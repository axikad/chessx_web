<?php

namespace App\Models;

use App\Enums\ChessColor;
use Database\Factories\GameStateFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameState extends Model
{
    /** @use HasFactory<GameStateFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['game_id', 'fen', 'active_color', 'white_time_ms', 'black_time_ms', 'active_clock_started_at', 'move_number', 'state_version', 'draw_offer_by'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['active_color' => ChessColor::class, 'white_time_ms' => 'integer', 'black_time_ms' => 'integer', 'active_clock_started_at' => 'datetime', 'move_number' => 'integer', 'state_version' => 'integer'];
    }

    /** @return BelongsTo<Game, $this> */
    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    /** @return BelongsTo<User, $this> */
    public function drawOfferBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'draw_offer_by');
    }
}
