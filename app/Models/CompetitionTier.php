<?php

namespace App\Models;

use App\Enums\CompetitionTierCode;
use Database\Factories\CompetitionTierFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class CompetitionTier extends Model
{
    /** @use HasFactory<CompetitionTierFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['code', 'name', 'artwork_path', 'scope_type', 'sequence_number', 'is_active'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'code' => CompetitionTierCode::class,
            'sequence_number' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function artworkPath(): string
    {
        return $this->artwork_path ?: match ($this->code) {
            CompetitionTierCode::City => 'leagues/Lcity.png',
            CompetitionTierCode::State => 'leagues/Lstate.png',
            CompetitionTierCode::National => 'leagues/Lnational.png',
            CompetitionTierCode::World => 'leagues/Lworld.png',
        };
    }

    public function artworkUrl(): string
    {
        return Storage::disk('public')->url($this->artworkPath());
    }

    /** @return HasMany<CompetitionRegion, $this> */
    public function regions(): HasMany
    {
        return $this->hasMany(CompetitionRegion::class, 'tier_id');
    }

    /** @return HasMany<PlayerCompetition, $this> */
    public function playerCompetitions(): HasMany
    {
        return $this->hasMany(PlayerCompetition::class, 'tier_id');
    }

    /** @return HasMany<PlayerRating, $this> */
    public function playerRatings(): HasMany
    {
        return $this->hasMany(PlayerRating::class, 'tier_id');
    }

    /** @return HasMany<LeaderboardSnapshot, $this> */
    public function leaderboardSnapshots(): HasMany
    {
        return $this->hasMany(LeaderboardSnapshot::class, 'tier_id');
    }

    /** @return HasMany<Game, $this> */
    public function games(): HasMany
    {
        return $this->hasMany(Game::class, 'tier_id');
    }

    /** @return HasMany<MatchmakingQueue, $this> */
    public function matchmakingEntries(): HasMany
    {
        return $this->hasMany(MatchmakingQueue::class, 'tier_id');
    }

    /** @return HasMany<RatingHistory, $this> */
    public function ratingHistories(): HasMany
    {
        return $this->hasMany(RatingHistory::class, 'tier_id');
    }

    /** @return HasMany<Tournament, $this> */
    public function tournaments(): HasMany
    {
        return $this->hasMany(Tournament::class, 'tier_id');
    }

    /** @return HasMany<TournamentQualifier, $this> */
    public function tournamentQualifiers(): HasMany
    {
        return $this->hasMany(TournamentQualifier::class, 'destination_tier_id');
    }
}
