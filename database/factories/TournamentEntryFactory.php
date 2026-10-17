<?php

namespace Database\Factories;

use App\Models\Tournament;
use App\Models\TournamentEntry;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TournamentEntry>
 */
class TournamentEntryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tournament_id' => Tournament::factory(),
            'user_id' => User::factory(),
            'seed_rating' => 1200,
            'status' => 'registered',
            'final_position' => null,
            'final_points' => null,
            'registered_at' => now(),
        ];
    }
}
