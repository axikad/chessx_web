<?php

namespace App\Models;

use App\Enums\TournamentQualifierStatus;
use Database\Factories\TournamentQualifierFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TournamentQualifier extends Model
{
    /** @use HasFactory<TournamentQualifierFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['tournament_id', 'user_id', 'destination_tier_id', 'qualification_rank', 'status', 'qualified_at'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['qualification_rank' => 'integer', 'status' => TournamentQualifierStatus::class, 'qualified_at' => 'datetime'];
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

    /** @return BelongsTo<CompetitionTier, $this> */
    public function destinationTier(): BelongsTo
    {
        return $this->belongsTo(CompetitionTier::class, 'destination_tier_id');
    }
}
