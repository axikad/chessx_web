<?php

namespace App\Models;

use App\Enums\PlayerCompetitionStatus;
use Database\Factories\PlayerCompetitionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlayerCompetition extends Model
{
    /** @use HasFactory<PlayerCompetitionFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['user_id', 'tier_id', 'season_id', 'status', 'unlocked_at'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'status' => PlayerCompetitionStatus::class,
            'unlocked_at' => 'datetime',
        ];
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

    /** @return BelongsTo<Season, $this> */
    public function season(): BelongsTo
    {
        return $this->belongsTo(Season::class);
    }
}
