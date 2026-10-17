<?php

namespace App\Models;

use Database\Factories\PromotionRuleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PromotionRule extends Model
{
    /** @use HasFactory<PromotionRuleFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'from_tier_id',
        'to_tier_id',
        'min_rating',
        'min_games',
        'qualification_required',
        'qualification_tournament_id',
        'rules_json',
        'effective_from',
        'effective_until',
        'is_active',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'min_rating' => 'integer',
            'min_games' => 'integer',
            'qualification_required' => 'boolean',
            'rules_json' => 'array',
            'effective_from' => 'datetime',
            'effective_until' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function ratingThresholdIsConfigured(): bool
    {
        return (bool) ($this->rules_json['rating_threshold_configured'] ?? false);
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

    /** @return BelongsTo<Tournament, $this> */
    public function qualificationTournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class, 'qualification_tournament_id');
    }
}
