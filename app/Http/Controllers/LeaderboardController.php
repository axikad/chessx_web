<?php

namespace App\Http\Controllers;

use App\Http\Requests\GenerateLeaderboardRequest;
use App\Models\CompetitionRegion;
use App\Models\CompetitionTier;
use App\Models\LeaderboardSnapshot;
use App\Models\PlayerRating;
use App\Models\Season;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class LeaderboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('leaderboards.read');

        $snapshots = LeaderboardSnapshot::query()
            ->with(['season:id,name', 'tier:id,name', 'region:id,name', 'user:id,name,email'])
            ->when($request->integer('season_id'), fn ($query, int $seasonId) => $query->where('season_id', $seasonId))
            ->when($request->integer('tier_id'), fn ($query, int $tierId) => $query->where('tier_id', $tierId))
            ->when($request->integer('region_id'), fn ($query, int $regionId) => $query->where('region_id', $regionId))
            ->latest('calculated_at')
            ->orderBy('rank')
            ->limit(500)
            ->get();

        return response()->json([
            'data' => $snapshots->map(fn (LeaderboardSnapshot $snapshot): array => $this->data($snapshot)),
            'seasons' => Season::query()->latest('starts_at')->get(['id', 'name']),
            'tiers' => CompetitionTier::query()
                ->with(['regions' => fn ($query) => $query->where('status', 'active')->orderBy('name')->select(['id', 'tier_id', 'name'])])
                ->orderBy('sequence_number')
                ->get(['id', 'name']),
        ]);
    }

    public function generate(GenerateLeaderboardRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $region = isset($validated['region_id'])
            ? CompetitionRegion::query()->findOrFail($validated['region_id'])
            : null;

        if ($region !== null && $region->tier_id !== $validated['tier_id']) {
            throw ValidationException::withMessages(['region_id' => 'The selected region does not belong to the competition tier.']);
        }

        $ratings = PlayerRating::query()
            ->where('tier_id', $validated['tier_id'])
            ->when($region !== null, fn (Builder $query) => $this->forRegion($query, $region))
            ->orderByDesc('rating')
            ->orderByDesc('games_played')
            ->orderBy('user_id')
            ->get();
        $calculatedAt = now();

        DB::transaction(function () use ($ratings, $validated, $region, $calculatedAt): void {
            $ratings->each(function (PlayerRating $rating, int $index) use ($validated, $region, $calculatedAt): void {
                LeaderboardSnapshot::query()->create([
                    'season_id' => $validated['season_id'],
                    'tier_id' => $validated['tier_id'],
                    'region_id' => $region?->getKey(),
                    'user_id' => $rating->user_id,
                    'rating' => $rating->rating,
                    'rank' => $index + 1,
                    'games_played' => $rating->games_played,
                    'calculated_at' => $calculatedAt,
                ]);
            });
        });

        return response()->json([
            'data' => ['created' => $ratings->count(), 'calculatedAt' => $calculatedAt->toIso8601String()],
            'message' => 'Leaderboard snapshot generated successfully.',
        ], 201);
    }

    private function forRegion(Builder $query, CompetitionRegion $region): Builder
    {
        return match (true) {
            $region->city_id !== null => $query->whereHas('user.currentLocation', fn ($locationQuery) => $locationQuery->where('city_id', $region->city_id)),
            $region->state_id !== null => $query->whereHas('user.currentLocation.city', fn ($cityQuery) => $cityQuery->where('state_id', $region->state_id)),
            $region->country_id !== null => $query->whereHas('user.currentLocation.city.state', fn ($stateQuery) => $stateQuery->where('country_id', $region->country_id)),
            default => $query,
        };
    }

    /** @return array<string, mixed> */
    private function data(LeaderboardSnapshot $snapshot): array
    {
        return [
            'id' => $snapshot->getKey(),
            'season' => $snapshot->season?->name,
            'seasonId' => $snapshot->season_id,
            'tier' => $snapshot->tier?->name,
            'tierId' => $snapshot->tier_id,
            'region' => $snapshot->region?->name ?? 'All regions',
            'regionId' => $snapshot->region_id,
            'player' => $snapshot->user?->name,
            'email' => $snapshot->user?->email,
            'rating' => $snapshot->rating,
            'rank' => $snapshot->rank,
            'gamesPlayed' => $snapshot->games_played,
            'calculatedAt' => $snapshot->calculated_at->toIso8601String(),
        ];
    }
}
