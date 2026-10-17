<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserReport;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserReport>
 */
class UserReportFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reporter_user_id' => User::factory(),
            'reported_user_id' => User::factory(),
            'game_id' => null,
            'reason' => 'abusive_behavior',
            'description' => fake()->sentence(),
            'status' => 'open',
            'reviewed_by' => null,
            'reviewed_at' => null,
        ];
    }
}
