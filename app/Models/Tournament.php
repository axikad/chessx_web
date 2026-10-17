<?php

namespace App\Models;

use App\Enums\TournamentFormat;
use App\Enums\TournamentStatus;
use Database\Factories\TournamentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Tournament extends Model
{
    /** @use HasFactory<TournamentFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['season_id', 'tier_id', 'region_id', 'name', 'format', 'min_rating', 'min_games', 'max_players', 'registration_starts_at', 'registration_ends_at', 'starts_at', 'ends_at', 'status', 'rules_json'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['format' => TournamentFormat::class, 'min_rating' => 'integer', 'min_games' => 'integer', 'max_players' => 'integer', 'registration_starts_at' => 'datetime', 'registration_ends_at' => 'datetime', 'starts_at' => 'datetime', 'ends_at' => 'datetime', 'status' => TournamentStatus::class, 'rules_json' => 'array'];
    }

    protected static function booted(): void
    {
        static::creating(function (Tournament $tournament): void {
            $tournament->uuid ??= (string) Str::uuid();
        });
    }

    /** @return BelongsTo<Season, $this> */
    public function season(): BelongsTo
    {
        return $this->belongsTo(Season::class);
    }

    /** @return BelongsTo<CompetitionTier, $this> */
    public function tier(): BelongsTo
    {
        return $this->belongsTo(CompetitionTier::class, 'tier_id');
    }

    /** @return BelongsTo<CompetitionRegion, $this> */
    public function region(): BelongsTo
    {
        return $this->belongsTo(CompetitionRegion::class, 'region_id');
    }

    /** @return HasMany<TournamentEntry, $this> */
    public function entries(): HasMany
    {
        return $this->hasMany(TournamentEntry::class);
    }

    /** @return HasMany<TournamentRound, $this> */
    public function rounds(): HasMany
    {
        return $this->hasMany(TournamentRound::class);
    }

    /** @return HasMany<TournamentQualifier, $this> */
    public function qualifiers(): HasMany
    {
        return $this->hasMany(TournamentQualifier::class);
    }
}
