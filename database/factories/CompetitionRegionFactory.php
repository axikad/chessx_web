<?php

namespace Database\Factories;

use App\Models\City;
use App\Models\CompetitionRegion;
use App\Models\CompetitionTier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CompetitionRegion>
 */
class CompetitionRegionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tier_id' => CompetitionTier::factory(),
            'city_id' => City::factory(),
            'name' => fake()->city().' City League',
            'status' => 'active',
        ];
    }
}
