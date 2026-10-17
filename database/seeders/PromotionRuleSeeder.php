<?php

namespace Database\Seeders;

use App\Enums\CompetitionTierCode;
use App\Models\CompetitionTier;
use App\Models\PromotionRule;
use Illuminate\Database\Seeder;

class PromotionRuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $steps = [
            [CompetitionTierCode::City, CompetitionTierCode::State, 20],
            [CompetitionTierCode::State, CompetitionTierCode::National, 30],
            [CompetitionTierCode::National, CompetitionTierCode::World, 40],
        ];

        foreach ($steps as [$fromCode, $toCode, $minimumGames]) {
            $fromTier = CompetitionTier::query()->where('code', $fromCode)->firstOrFail();
            $toTier = CompetitionTier::query()->where('code', $toCode)->firstOrFail();
            $rule = PromotionRule::query()->firstOrNew([
                'from_tier_id' => $fromTier->getKey(),
                'to_tier_id' => $toTier->getKey(),
            ]);

            if (! $rule->exists) {
                $rule->effective_from = now();
            }

            $rule->fill([
                'min_rating' => 1200,
                'min_games' => $minimumGames,
                'qualification_required' => true,
                'qualification_tournament_id' => null,
                'is_active' => true,
                'rules_json' => [
                    'rating_threshold_configured' => false,
                    'note' => 'The rating threshold remains disabled until the team confirms the real value. Minimum games and tournament qualification are retained from the Chess-Mission design.',
                ],
            ])->save();
        }
    }
}
