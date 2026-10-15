<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdatePlayerRatingRequest;
use App\Models\CompetitionTier;
use App\Models\PlayerRating;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PlayerRatingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('ratings.read');

        $ratings = PlayerRating::query()
            ->with(['user:id,name,email', 'tier:id,name,code,sequence_number'])
            ->when($request->integer('tier_id'), fn ($query, int $tierId) => $query->where('tier_id', $tierId))
            ->when($request->string('search')->trim()->value(), function ($query, string $search): void {
                $query->whereHas('user', fn ($userQuery) => $userQuery
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%"));
            })
            ->orderByDesc('rating')
            ->limit(500)
            ->get();

        return response()->json([
            'data' => $ratings->map(fn (PlayerRating $rating): array => $this->data($rating)),
            'tiers' => CompetitionTier::query()->orderBy('sequence_number')->get(['id', 'name']),
        ]);
    }

    public function update(UpdatePlayerRatingRequest $request, PlayerRating $playerRating): JsonResponse
    {
        $validated = $request->validated();
        $playerRating->forceFill([
            ...$validated,
            'highest_rating' => max($playerRating->highest_rating, $validated['rating']),
        ])->save();

        return response()->json([
            'data' => $this->data($playerRating->load(['user:id,name,email', 'tier:id,name,code,sequence_number'])),
            'message' => 'Player rating updated successfully.',
        ]);
    }

    /** @return array<string, mixed> */
    private function data(PlayerRating $rating): array
    {
        return [
            'id' => $rating->getKey(),
            'userId' => $rating->user_id,
            'player' => $rating->user?->name,
            'email' => $rating->user?->email,
            'tierId' => $rating->tier_id,
            'tier' => $rating->tier?->name,
            'rating' => $rating->rating,
            'provisional' => $rating->provisional_rating,
            'provisionalGamesRemaining' => $rating->provisionalGamesRemaining(),
            'gamesPlayed' => $rating->games_played,
            'wins' => $rating->wins,
            'draws' => $rating->draws,
            'losses' => $rating->losses,
            'highestRating' => $rating->highest_rating,
            'lastGameAt' => $rating->last_game_at?->toIso8601String(),
        ];
    }
}
