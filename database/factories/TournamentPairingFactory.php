<?php

namespace Database\Factories;

use App\Models\TournamentPairing;
use App\Models\TournamentRound;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TournamentPairing>
 */
class TournamentPairingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'round_id' => TournamentRound::factory(),
            'white_user_id' => User::factory(),
            'black_user_id' => User::factory(),
            'game_id' => null,
            'result' => null,
            'white_points' => 0,
            'black_points' => 0,
        ];
    }
}
