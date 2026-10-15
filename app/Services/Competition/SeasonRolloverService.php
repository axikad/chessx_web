<?php

namespace App\Services\Competition;

use App\Enums\SeasonStatus;
use App\Models\PlayerCompetition;
use App\Models\Season;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SeasonRolloverService
{
    /** @return array{completed_seasons: int, created_eligibilities: int} */
    public function rollover(Season $targetSeason): array
    {
        return DB::transaction(function () use ($targetSeason): array {
            $target = Season::query()->lockForUpdate()->findOrFail($targetSeason->getKey());

            if (in_array($target->status, [SeasonStatus::Completed, SeasonStatus::Cancelled], true)) {
                throw ValidationException::withMessages([
                    'season' => 'Only a scheduled or already active season can be used for rollover.',
                ]);
            }

            $currentSeasons = Season::query()
                ->where('status', SeasonStatus::Active)
                ->whereKeyNot($target->getKey())
                ->lockForUpdate()
                ->get();

            $currentSeasons->each(fn (Season $season) => $season->update(['status' => SeasonStatus::Completed]));

            if ($target->status !== SeasonStatus::Active) {
                $target->update(['status' => SeasonStatus::Active]);
            }

            $createdEligibilities = 0;
            PlayerCompetition::query()
                ->whereNull('season_id')
                ->orderBy('id')
                ->chunkById(200, function ($standingEligibilities) use ($target, &$createdEligibilities): void {
                    $standingEligibilities->each(function (PlayerCompetition $standing) use ($target, &$createdEligibilities): void {
                        $eligibility = PlayerCompetition::query()->firstOrCreate(
                            [
                                'user_id' => $standing->user_id,
                                'tier_id' => $standing->tier_id,
                                'season_id' => $target->getKey(),
                            ],
                            [
                                'status' => $standing->status,
                                'unlocked_at' => $standing->unlocked_at,
                            ],
                        );

                        if ($eligibility->wasRecentlyCreated) {
                            $createdEligibilities++;
                        }
                    });
                });

            return [
                'completed_seasons' => $currentSeasons->count(),
                'created_eligibilities' => $createdEligibilities,
            ];
        });
    }
}
