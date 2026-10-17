<?php

namespace Database\Factories;

use App\Models\CompetitionTier;
use App\Models\Season;
use App\Models\Tournament;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Tournament>
 */
class TournamentFactory extends Factory
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
            'name' => fake()->words(3, true).' Tournament',
            'format' => 'swiss',
            'min_rating' => null,
            'min_games' => 0,
            'max_players' => 64,
            'registration_starts_at' => now(),
            'registration_ends_at' => now()->addDays(5),
            'starts_at' => now()->addDays(7),
            'ends_at' => now()->addDays(8),
            'status' => 'draft',
            'rules_json' => null,
        ];
    }
}
