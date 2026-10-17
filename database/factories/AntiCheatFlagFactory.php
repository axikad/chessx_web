<?php

namespace Database\Factories;

use App\Models\AntiCheatFlag;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AntiCheatFlag>
 */
class AntiCheatFlagFactory extends Factory
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
            'game_id' => null,
            'flag_type' => 'move_accuracy',
            'severity' => 'medium',
            'evidence_json' => ['score' => 0.95],
            'status' => 'open',
            'reviewed_by' => null,
            'reviewed_at' => null,
        ];
    }
}
