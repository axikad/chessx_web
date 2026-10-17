<?php

namespace Database\Factories;

use App\Models\CompetitionTier;
use App\Models\Game;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Game>
 */
class GameFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'season_id' => null,
            'tier_id' => CompetitionTier::factory(),
            'region_id' => null,
            'white_user_id' => User::factory(),
            'black_user_id' => User::factory(),
            'time_control_seconds' => 600,
            'increment_seconds' => 0,
            'game_mode' => 'rated',
            'status' => 'waiting',
            'result' => null,
            'termination_reason' => null,
            'started_at' => null,
            'ended_at' => null,
        ];
    }
}
