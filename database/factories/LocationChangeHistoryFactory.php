<?php

namespace Database\Factories;

use App\Models\City;
use App\Models\LocationChangeHistory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LocationChangeHistory>
 */
class LocationChangeHistoryFactory extends Factory
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
            'old_city_id' => null,
            'new_city_id' => City::factory(),
            'change_request_id' => null,
            'changed_at' => now(),
        ];
    }
}
