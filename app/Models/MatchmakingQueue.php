<?php

namespace App\Models;

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
    protected $fillable = ['user_id', 'tier_id', 'region_id', 'rating', 'rating_range', 'status', 'queued_at', 'expires_at', 'matched_game_id'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['rating' => 'integer', 'rating_range' => 'integer', 'status' => MatchmakingQueueStatus::class, 'queued_at' => 'datetime', 'expires_at' => 'datetime'];
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
