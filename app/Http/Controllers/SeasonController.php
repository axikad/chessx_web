<?php

namespace App\Http\Controllers;

use App\Enums\SeasonStatus;
use App\Http\Requests\StoreSeasonRequest;
use App\Http\Requests\UpdateSeasonRequest;
use App\Models\Season;
use App\Services\Competition\SeasonRolloverService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class SeasonController extends Controller
{
    public function index(): JsonResponse
    {
        Gate::authorize('seasons.read');

        return response()->json(['data' => Season::query()
            ->withCount(['playerCompetitions', 'leaderboardSnapshots'])
            ->latest('starts_at')
            ->get()
            ->map(fn (Season $season): array => $this->data($season))]);
    }

    public function store(StoreSeasonRequest $request): JsonResponse
    {
        if ($request->validated('status') === SeasonStatus::Active->value) {
            throw ValidationException::withMessages(['status' => 'Create the season as scheduled, then use rollover to activate it.']);
        }

        $season = Season::query()->create($request->validated());

        return response()->json(['data' => $this->data($season), 'message' => 'Season created successfully.'], 201);
    }

    public function show(Season $season): JsonResponse
    {
        Gate::authorize('seasons.read');

        return response()->json(['data' => $this->data($season->loadCount(['playerCompetitions', 'leaderboardSnapshots']))]);
    }

    public function update(UpdateSeasonRequest $request, Season $season): JsonResponse
    {
        if ($request->validated('status') === SeasonStatus::Active->value && $season->status !== SeasonStatus::Active) {
            throw ValidationException::withMessages(['status' => 'Use season rollover to activate a scheduled season.']);
        }

        $season->update($request->validated());

        return response()->json(['data' => $this->data($season->loadCount(['playerCompetitions', 'leaderboardSnapshots'])), 'message' => 'Season updated successfully.']);
    }

    public function destroy(Request $request, Season $season): JsonResponse
    {
        Gate::authorize('seasons.delete');
        abort_if($season->playerCompetitions()->exists(), 422, 'A season with player eligibility records cannot be deleted.');
        $season->delete();

        return response()->json(['message' => 'Season deleted successfully.']);
    }

    public function rollover(Request $request, Season $season, SeasonRolloverService $service): JsonResponse
    {
        Gate::authorize('seasons.update');
        $result = $service->rollover($season);

        return response()->json([
            'data' => $result,
            'message' => 'Season rollover completed successfully.',
        ]);
    }

    /** @return array<string, mixed> */
    private function data(Season $season): array
    {
        return [
            'id' => $season->getKey(),
            'name' => $season->name,
            'startsAt' => $season->starts_at->toIso8601String(),
            'endsAt' => $season->ends_at->toIso8601String(),
            'status' => $season->status->value,
            'playerCount' => $season->player_competitions_count ?? $season->playerCompetitions()->count(),
            'snapshotCount' => $season->leaderboard_snapshots_count ?? $season->leaderboardSnapshots()->count(),
        ];
    }
}
