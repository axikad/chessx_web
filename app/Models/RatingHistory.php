<?php

namespace App\Models;

use Database\Factories\RatingHistoryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RatingHistory extends Model
{
    /** @use HasFactory<RatingHistoryFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    /** @var list<string> */
    protected $fillable = ['user_id', 'tier_id', 'game_id', 'rating_before', 'rating_after', 'rating_change'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['rating_before' => 'integer', 'rating_after' => 'integer', 'rating_change' => 'integer'];
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

    /** @return BelongsTo<Game, $this> */
    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }
}
