<?php

namespace Database\Factories;

use App\Models\CompetitionTier;
use App\Models\Game;
use App\Models\RatingHistory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RatingHistory>
 */
class RatingHistoryFactory extends Factory
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
            'tier_id' => CompetitionTier::factory(),
            'game_id' => Game::factory(),
            'rating_before' => 1200,
            'rating_after' => 1216,
            'rating_change' => 16,
        ];
    }
}
