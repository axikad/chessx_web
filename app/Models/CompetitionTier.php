<?php

namespace App\Models;

use App\Enums\CompetitionTierCode;
use Database\Factories\CompetitionTierFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CompetitionTier extends Model
{
    /** @use HasFactory<CompetitionTierFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['code', 'name', 'scope_type', 'sequence_number', 'is_active'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'code' => CompetitionTierCode::class,
            'sequence_number' => 'integer',
            'is_active' => 'boolean',
        ];
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
}
