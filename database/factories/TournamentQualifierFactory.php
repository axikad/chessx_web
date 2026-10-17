<?php

namespace Database\Factories;

use App\Models\CompetitionTier;
use App\Models\Tournament;
use App\Models\TournamentQualifier;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TournamentQualifier>
 */
class TournamentQualifierFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tournament_id' => Tournament::factory(),
            'user_id' => User::factory(),
            'destination_tier_id' => CompetitionTier::factory(),
            'qualification_rank' => 1,
            'status' => 'pending',
            'qualified_at' => null,
        ];
    }
}
