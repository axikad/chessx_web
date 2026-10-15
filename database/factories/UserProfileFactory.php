<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserProfile>
 */
class UserProfileFactory extends Factory
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
            'display_name' => fake()->name(),
            'language' => 'en',
            'timezone' => fake()->timezone(),
            'date_of_birth' => fake()->dateTimeBetween('-70 years', '-13 years')->format('Y-m-d'),
            'profile_visibility' => 'public',
        ];
    }
}
