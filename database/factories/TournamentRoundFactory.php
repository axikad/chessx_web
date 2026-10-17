<?php

namespace Database\Factories;

use App\Models\Tournament;
use App\Models\TournamentRound;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TournamentRound>
 */
class TournamentRoundFactory extends Factory
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
            'round_number' => 1,
            'status' => 'pending',
            'starts_at' => null,
            'completed_at' => null,
        ];
    }
}
