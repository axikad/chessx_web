<?php

namespace Database\Factories;

use App\Models\Game;
use App\Models\GameDispute;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GameDispute>
 */
class GameDisputeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'game_id' => Game::factory(),
            'reporting_user_id' => User::factory(),
            'reason' => 'incorrect_result',
            'description' => fake()->sentence(),
            'status' => 'open',
            'resolution' => null,
            'reviewed_by' => null,
            'reviewed_at' => null,
        ];
    }
}
