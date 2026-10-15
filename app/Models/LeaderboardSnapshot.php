<?php

namespace App\Models;

use Database\Factories\LeaderboardSnapshotFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LogicException;

class LeaderboardSnapshot extends Model
{
    /** @use HasFactory<LeaderboardSnapshotFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'season_id',
        'tier_id',
        'region_id',
        'user_id',
        'rating',
        'rank',
        'games_played',
        'calculated_at',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'rank' => 'integer',
            'games_played' => 'integer',
            'calculated_at' => 'datetime',
        ];
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

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected static function booted(): void
    {
        static::saving(function (LeaderboardSnapshot $snapshot): void {
            if ($snapshot->region_id !== null && $snapshot->region()->value('tier_id') !== $snapshot->tier_id) {
                throw new LogicException('The leaderboard region must belong to the selected competition tier.');
            }
        });
    }
}
