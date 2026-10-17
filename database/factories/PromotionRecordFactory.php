<?php

namespace Database\Factories;

use App\Enums\PromotionStatus;
use App\Models\PromotionRecord;
use App\Models\PromotionRule;
use App\Models\Season;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PromotionRecord>
 */
class PromotionRecordFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'promotion_rule_id' => PromotionRule::factory(),
            'from_tier_id' => fn (array $attributes): int => PromotionRule::query()
                ->findOrFail($attributes['promotion_rule_id'])->from_tier_id,
            'to_tier_id' => fn (array $attributes): int => PromotionRule::query()
                ->findOrFail($attributes['promotion_rule_id'])->to_tier_id,
            'season_id' => Season::factory(),
            'rating_at_qualification' => 1200,
            'games_at_qualification' => 20,
            'tournament_id' => null,
            'status' => PromotionStatus::Pending,
            'qualified_at' => null,
            'approved_at' => null,
        ];
    }
}
