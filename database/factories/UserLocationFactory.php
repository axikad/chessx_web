<?php

namespace Database\Factories;

use App\Models\City;
use App\Models\User;
use App\Models\UserLocation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserLocation>
 */
class UserLocationFactory extends Factory
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
            'city_id' => City::factory(),
            'verification_method' => 'manual',
            'verified_at' => now(),
            'policy_version' => '1.0',
            'is_current' => true,
        ];
    }
}
