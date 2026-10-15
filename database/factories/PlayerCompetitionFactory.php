<?php

namespace Database\Factories;

use App\Enums\PlayerCompetitionStatus;
use App\Models\CompetitionTier;
use App\Models\PlayerCompetition;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PlayerCompetition>
 */
class PlayerCompetitionFactory extends Factory
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
            'season_id' => null,
            'status' => PlayerCompetitionStatus::Locked,
            'unlocked_at' => null,
        ];
    }

    public function eligible(): static
    {
        return $this->state(fn (): array => [
            'status' => PlayerCompetitionStatus::Eligible,
            'unlocked_at' => now(),
        ]);
    }

    public function active(): static
    {
        return $this->state(fn (): array => [
            'status' => PlayerCompetitionStatus::Active,
            'unlocked_at' => now()->subDay(),
        ]);
    }

    public function suspended(): static
    {
        return $this->state(fn (): array => [
            'status' => PlayerCompetitionStatus::Suspended,
            'unlocked_at' => now()->subWeek(),
        ]);
    }
}
