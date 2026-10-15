<?php

namespace App\Models;

use Database\Factories\PlayerRatingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlayerRating extends Model
{
    /** @use HasFactory<PlayerRatingFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'user_id',
        'tier_id',
        'rating',
        'provisional_rating',
        'games_played',
        'wins',
        'draws',
        'losses',
        'highest_rating',
        'last_game_at',
    ];

    /** @var array<string, bool|int> */
    protected $attributes = [
        'provisional_rating' => true,
        'games_played' => 0,
        'wins' => 0,
        'draws' => 0,
        'losses' => 0,
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'provisional_rating' => 'boolean',
            'games_played' => 'integer',
            'wins' => 'integer',
            'draws' => 'integer',
            'losses' => 'integer',
            'highest_rating' => 'integer',
            'last_game_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (PlayerRating $playerRating): void {
            $startingRating = max(1, (int) config('chess.starting_rating', 1200));

            $playerRating->rating ??= $startingRating;
            $playerRating->highest_rating ??= $playerRating->rating;
        });

        static::saving(function (PlayerRating $playerRating): void {
            if (! $playerRating->exists || $playerRating->isDirty('games_played')) {
                $playerRating->provisional_rating = $playerRating->games_played < self::provisionalGameThreshold();
            }
        });
    }

    public static function provisionalGameThreshold(): int
    {
        return max(1, (int) config('chess.provisional_games', 10));
    }

    public function provisionalGamesRemaining(): int
    {
        return max(0, self::provisionalGameThreshold() - $this->games_played);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<CompetitionTier, $this> */
    public function tier(): BelongsTo
    {
        return $this->belongsTo(CompetitionTier::class, 'tier_id');
    }
}
