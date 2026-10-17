<?php

namespace App\Models;

use App\Enums\TournamentEntryStatus;
use Database\Factories\TournamentEntryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TournamentEntry extends Model
{
    /** @use HasFactory<TournamentEntryFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['tournament_id', 'user_id', 'seed_rating', 'status', 'final_position', 'final_points', 'registered_at'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['seed_rating' => 'integer', 'status' => TournamentEntryStatus::class, 'final_position' => 'integer', 'final_points' => 'decimal:2', 'registered_at' => 'datetime'];
    }

    /** @return BelongsTo<Tournament, $this> */
    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
