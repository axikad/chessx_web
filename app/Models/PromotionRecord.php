<?php

namespace App\Models;

use App\Enums\PromotionStatus;
use Database\Factories\PromotionRecordFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PromotionRecord extends Model
{
    /** @use HasFactory<PromotionRecordFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'user_id',
        'from_tier_id',
        'to_tier_id',
        'season_id',
        'promotion_rule_id',
        'rating_at_qualification',
        'games_at_qualification',
        'tournament_id',
        'status',
        'qualified_at',
        'approved_at',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'rating_at_qualification' => 'integer',
            'games_at_qualification' => 'integer',
            'status' => PromotionStatus::class,
            'qualified_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<CompetitionTier, $this> */
    public function fromTier(): BelongsTo
    {
        return $this->belongsTo(CompetitionTier::class, 'from_tier_id');
    }

    /** @return BelongsTo<CompetitionTier, $this> */
    public function toTier(): BelongsTo
    {
        return $this->belongsTo(CompetitionTier::class, 'to_tier_id');
    }

    /** @return BelongsTo<Season, $this> */
    public function season(): BelongsTo
    {
        return $this->belongsTo(Season::class);
    }

    /** @return BelongsTo<PromotionRule, $this> */
    public function rule(): BelongsTo
    {
        return $this->belongsTo(PromotionRule::class, 'promotion_rule_id');
    }

    /** @return BelongsTo<Tournament, $this> */
    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }
}
