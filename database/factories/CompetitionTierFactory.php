<?php

namespace Database\Factories;

use App\Enums\CompetitionTierCode;
use App\Models\CompetitionTier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CompetitionTier>
 */
class CompetitionTierFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => CompetitionTierCode::City,
            'name' => 'City League',
            'scope_type' => 'city',
            'sequence_number' => 1,
            'is_active' => true,
        ];
    }

    public function stateLeague(): static
    {
        return $this->state(fn (): array => [
            'code' => CompetitionTierCode::State,
            'name' => 'State League',
            'scope_type' => 'state',
            'sequence_number' => 2,
        ]);
    }

    public function nationalLeague(): static
    {
        return $this->state(fn (): array => [
            'code' => CompetitionTierCode::National,
            'name' => 'National League',
            'scope_type' => 'country',
            'sequence_number' => 3,
        ]);
    }

    public function worldLeague(): static
    {
        return $this->state(fn (): array => [
            'code' => CompetitionTierCode::World,
            'name' => 'World League',
            'scope_type' => 'global',
            'sequence_number' => 4,
        ]);
    }
}
