<?php

namespace Database\Factories;

use App\Models\Game;
use App\Models\GameMove;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GameMove>
 */
class GameMoveFactory extends Factory
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
            'ply' => 1,
            'user_id' => User::factory(),
            'piece_color' => 'white',
            'piece_type' => 'pawn',
            'from_square' => 'e2',
            'to_square' => 'e4',
            'captured_piece_type' => null,
            'promotion_piece' => null,
            'is_capture' => false,
            'is_castling' => false,
            'is_en_passant' => false,
            'uci_move' => 'e2e4',
            'san_move' => 'e4',
            'fen_after' => 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
            'clock_remaining_ms' => 599000,
        ];
    }
}
