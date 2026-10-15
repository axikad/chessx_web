<?php

namespace Database\Factories;

use App\Models\CompetitionTier;
use App\Models\LeaderboardSnapshot;
use App\Models\Season;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LeaderboardSnapshot>
 */
class LeaderboardSnapshotFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'season_id' => Season::factory(),
            'tier_id' => CompetitionTier::factory(),
            'region_id' => null,
            'user_id' => User::factory(),
            'rating' => fake()->numberBetween(800, 2400),
            'rank' => fake()->numberBetween(1, 500),
            'games_played' => fake()->numberBetween(1, 100),
            'calculated_at' => now(),
        ];
    }
}
