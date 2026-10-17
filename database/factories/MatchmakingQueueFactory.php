<?php

namespace Database\Factories;

use App\Models\CompetitionTier;
use App\Models\MatchmakingQueue;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MatchmakingQueue>
 */
class MatchmakingQueueFactory extends Factory
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
            'region_id' => null,
            'game_mode' => 'rated',
            'time_control_seconds' => 600,
            'increment_seconds' => 0,
            'rating' => 1200,
            'rating_tolerance' => 100,
            'status' => 'queued',
            'queued_at' => now(),
            'expires_at' => now()->addMinutes(5),
            'matched_game_id' => null,
        ];
    }
}
