<?php

namespace App\Models;

use App\Enums\GameMode;
use App\Enums\GameResult;
use App\Enums\GameStatus;
use App\Enums\GameTerminationReason;
use Database\Factories\GameFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Game extends Model
{
    /** @use HasFactory<GameFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['season_id', 'tier_id', 'region_id', 'white_user_id', 'black_user_id', 'time_control_seconds', 'increment_seconds', 'game_mode', 'status', 'result', 'termination_reason', 'started_at', 'ended_at'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['time_control_seconds' => 'integer', 'increment_seconds' => 'integer', 'game_mode' => GameMode::class, 'status' => GameStatus::class, 'result' => GameResult::class, 'termination_reason' => GameTerminationReason::class, 'started_at' => 'datetime', 'ended_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::creating(function (Game $game): void {
            $game->uuid ??= (string) Str::uuid();
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

    /** @return HasOne<GameState, $this> */
    public function state(): HasOne
    {
        return $this->hasOne(GameState::class);
    }

    /** @return HasMany<GameMove, $this> */
    public function moves(): HasMany
    {
        return $this->hasMany(GameMove::class);
    }

    /** @return HasMany<GameEvent, $this> */
    public function events(): HasMany
    {
        return $this->hasMany(GameEvent::class);
    }

    /** @return HasMany<GameDispute, $this> */
    public function disputes(): HasMany
    {
        return $this->hasMany(GameDispute::class);
    }

    /** @return HasMany<RatingHistory, $this> */
    public function ratingHistories(): HasMany
    {
        return $this->hasMany(RatingHistory::class);
    }

    /** @return HasOne<TournamentPairing, $this> */
    public function tournamentPairing(): HasOne
    {
        return $this->hasOne(TournamentPairing::class);
    }

    /** @return HasMany<UserReport, $this> */
    public function userReports(): HasMany
    {
        return $this->hasMany(UserReport::class);
    }

    /** @return HasMany<AntiCheatFlag, $this> */
    public function antiCheatFlags(): HasMany
    {
        return $this->hasMany(AntiCheatFlag::class);
    }
}
