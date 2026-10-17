<?php

namespace Database\Factories;

use App\Models\Game;
use App\Models\GameState;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GameState>
 */
class GameStateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'game_id' => Game::factory(),
            'fen' => 'rn1qkbnr/pppb1ppp/3pp3/8/2PPP3/5N2/PP3PPP/RNBQKB1R b KQkq - 0 4',
            'active_color' => 'black',
            'white_time_ms' => 600000,
            'black_time_ms' => 600000,
            'active_clock_started_at' => null,
            'fullmove_number' => 4,
            'state_version' => 0,
            'draw_offer_by' => null,
        ];
    }
}
