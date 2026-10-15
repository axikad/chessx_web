<?php

namespace Database\Factories;

use App\Enums\SeasonStatus;
use App\Models\Season;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Season>
 */
class SeasonFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startsAt = fake()->dateTimeBetween('+1 week', '+2 months');

        return [
            'name' => 'Season '.fake()->unique()->numberBetween(1, 9999),
            'starts_at' => $startsAt,
            'ends_at' => (clone $startsAt)->modify('+3 months'),
            'status' => SeasonStatus::Scheduled,
        ];
    }

    public function active(): static
    {
        return $this->state(fn (): array => [
            'starts_at' => now()->subMonth(),
            'ends_at' => now()->addMonths(2),
            'status' => SeasonStatus::Active,
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (): array => [
            'starts_at' => now()->subMonths(4),
            'ends_at' => now()->subMonth(),
            'status' => SeasonStatus::Completed,
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (): array => [
            'status' => SeasonStatus::Cancelled,
        ]);
    }
}
