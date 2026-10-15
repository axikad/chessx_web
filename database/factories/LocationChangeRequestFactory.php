<?php

namespace Database\Factories;

use App\Models\City;
use App\Models\LocationChangeRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LocationChangeRequest>
 */
class LocationChangeRequestFactory extends Factory
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
            'old_city_id' => City::factory(),
            'new_city_id' => City::factory(),
            'verification_method' => 'manual',
            'status' => 'pending',
            'requested_at' => now(),
            'reviewed_at' => null,
            'reviewed_by' => null,
            'reason' => fake()->optional()->sentence(),
        ];
    }
}
