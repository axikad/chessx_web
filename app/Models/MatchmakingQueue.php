<?php

namespace App\Models;

use App\Enums\GameMode;
use App\Enums\MatchmakingQueueStatus;
use Database\Factories\MatchmakingQueueFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchmakingQueue extends Model
{
    /** @use HasFactory<MatchmakingQueueFactory> */
    use HasFactory;

    protected $table = 'matchmaking_queue';

    /** @var list<string> */
    protected $fillable = ['user_id', 'tier_id', 'region_id', 'game_mode', 'time_control_seconds', 'increment_seconds', 'rating', 'rating_tolerance', 'status', 'queued_at', 'expires_at', 'matched_game_id'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['game_mode' => GameMode::class, 'time_control_seconds' => 'integer', 'increment_seconds' => 'integer', 'rating' => 'integer', 'rating_tolerance' => 'integer', 'status' => MatchmakingQueueStatus::class, 'queued_at' => 'datetime', 'expires_at' => 'datetime'];
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

    /** @return BelongsTo<CompetitionRegion, $this> */
    public function region(): BelongsTo
    {
        return $this->belongsTo(CompetitionRegion::class, 'region_id');
    }

    /** @return BelongsTo<Game, $this> */
    public function matchedGame(): BelongsTo
    {
        return $this->belongsTo(Game::class, 'matched_game_id');
    }
}
