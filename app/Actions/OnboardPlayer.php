<?php

namespace App\Actions;

use App\Enums\PlayerCompetitionStatus;
use App\Models\CompetitionTier;
use App\Models\PlayerCompetition;
use App\Models\PlayerRating;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class OnboardPlayer
{
    public function handle(User $user): void
    {
        if ($user->role()->value('slug') !== 'user') {
            return;
        }

        DB::transaction(function () use ($user): void {
            $user->profile()->firstOrCreate([], [
                'display_name' => $user->name,
            ]);

            CompetitionTier::query()
                ->where('is_active', true)
                ->orderBy('id')
                ->each(function (CompetitionTier $tier) use ($user): void {
                    PlayerRating::query()->firstOrCreate([
                        'user_id' => $user->getKey(),
                        'tier_id' => $tier->getKey(),
                    ]);

                    PlayerCompetition::query()->firstOrCreate(
                        [
                            'user_id' => $user->getKey(),
                            'tier_id' => $tier->getKey(),
                            'season_id' => null,
                        ],
                        [
                            'status' => PlayerCompetitionStatus::Locked,
                            'unlocked_at' => null,
                        ],
                    );
                });
        });
    }
}
