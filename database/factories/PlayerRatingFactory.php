<?php

namespace Database\Factories;

use App\Models\CompetitionTier;
use App\Models\PlayerRating;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PlayerRating>
 */
class PlayerRatingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startingRating = max(1, (int) config('chess.starting_rating', 1200));

        return [
            'user_id' => User::factory(),
            'tier_id' => CompetitionTier::factory(),
            'rating' => $startingRating,
            'provisional_rating' => true,
            'games_played' => 0,
            'wins' => 0,
            'draws' => 0,
            'losses' => 0,
            'highest_rating' => $startingRating,
            'last_game_at' => null,
        ];
    }

    public function established(): static
    {
        return $this->state(fn (): array => [
            'rating' => 1384,
            'provisional_rating' => false,
            'games_played' => 20,
            'wins' => 12,
            'draws' => 3,
            'losses' => 5,
            'highest_rating' => 1412,
            'last_game_at' => now()->subDay(),
        ]);
    }
}
