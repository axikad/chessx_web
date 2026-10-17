<?php

namespace Database\Factories;

use App\Models\CompetitionTier;
use App\Models\PromotionRule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PromotionRule>
 */
class PromotionRuleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'from_tier_id' => CompetitionTier::factory(),
            'to_tier_id' => CompetitionTier::factory()->stateLeague(),
            'min_rating' => 1200,
            'min_games' => 20,
            'qualification_required' => true,
            'qualification_tournament_id' => null,
            'rules_json' => ['rating_threshold_configured' => false],
            'effective_from' => now(),
            'effective_until' => null,
            'is_active' => true,
        ];
    }
}
