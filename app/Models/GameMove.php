<?php

namespace App\Models;

use Database\Factories\GameMoveFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameMove extends Model
{
    /** @use HasFactory<GameMoveFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    /** @var list<string> */
    protected $fillable = [
        'game_id',
        'ply',
        'user_id',
        'piece_color',
        'piece_type',
        'from_square',
        'to_square',
        'captured_piece_type',
        'promotion_piece',
        'is_capture',
        'is_castling',
        'is_en_passant',
        'uci_move',
        'san_move',
        'fen_after',
        'clock_remaining_ms',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'ply' => 'integer',
            'is_capture' => 'boolean',
            'is_castling' => 'boolean',
            'is_en_passant' => 'boolean',
            'clock_remaining_ms' => 'integer',
        ];
    }

    /** @return BelongsTo<Game, $this> */
    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    /** @return BelongsTo<User, $this> */
    public function player(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
