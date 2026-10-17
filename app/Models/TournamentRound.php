<?php

namespace App\Models;

use App\Enums\TournamentRoundStatus;
use Database\Factories\TournamentRoundFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TournamentRound extends Model
{
    /** @use HasFactory<TournamentRoundFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['tournament_id', 'round_number', 'status', 'starts_at', 'completed_at'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['round_number' => 'integer', 'status' => TournamentRoundStatus::class, 'starts_at' => 'datetime', 'completed_at' => 'datetime'];
    }

    /** @return BelongsTo<Tournament, $this> */
    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    /** @return HasMany<TournamentPairing, $this> */
    public function pairings(): HasMany
    {
        return $this->hasMany(TournamentPairing::class, 'round_id');
    }
}
