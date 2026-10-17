<?php

namespace App\Models;

use App\Enums\TournamentPairingResult;
use Database\Factories\TournamentPairingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TournamentPairing extends Model
{
    /** @use HasFactory<TournamentPairingFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['round_id', 'white_user_id', 'black_user_id', 'game_id', 'result', 'white_points', 'black_points'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['result' => TournamentPairingResult::class, 'white_points' => 'decimal:2', 'black_points' => 'decimal:2'];
    }

    /** @return BelongsTo<TournamentRound, $this> */
    public function round(): BelongsTo
    {
        return $this->belongsTo(TournamentRound::class, 'round_id');
    }

    /** @return BelongsTo<User, $this> */
    public function whitePlayer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'white_user_id');
    }

    /** @return BelongsTo<User, $this> */
    public function blackPlayer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'black_user_id');
    }

    /** @return BelongsTo<Game, $this> */
    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }
}
