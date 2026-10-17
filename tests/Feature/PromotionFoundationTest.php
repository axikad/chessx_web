<?php

use App\Enums\PromotionStatus;
use App\Models\PromotionRecord;
use App\Models\PromotionRule;
use Database\Seeders\CompetitionTierSeeder;
use Database\Seeders\PromotionRuleSeeder;

it('seeds the staged league promotion rules idempotently', function () {
    $this->seed(CompetitionTierSeeder::class);
    $this->seed(PromotionRuleSeeder::class);
    $this->seed(PromotionRuleSeeder::class);

    $rules = PromotionRule::query()
        ->with(['fromTier:id,code,sequence_number', 'toTier:id,code'])
        ->get()
        ->sortBy('fromTier.sequence_number')
        ->values();

    expect($rules)->toHaveCount(3)
        ->and($rules->map(fn (PromotionRule $rule): array => [
            $rule->fromTier->code->value,
            $rule->toTier->code->value,
            $rule->min_games,
        ])->all())->toBe([
            ['city', 'state', 20],
            ['state', 'national', 30],
            ['national', 'world', 40],
        ])
        ->and($rules->every(fn (PromotionRule $rule): bool => $rule->min_rating === 1200))->toBeTrue()
        ->and($rules->every(fn (PromotionRule $rule): bool => $rule->qualification_required))->toBeTrue()
        ->and($rules->every(fn (PromotionRule $rule): bool => ! $rule->ratingThresholdIsConfigured()))->toBeTrue();
});

it('stores a player promotion without requiring the future tournament module', function () {
    $record = PromotionRecord::factory()->create();

    expect($record->status)->toBe(PromotionStatus::Pending)
        ->and($record->tournament_id)->toBeNull()
        ->and($record->rule->from_tier_id)->toBe($record->from_tier_id)
        ->and($record->rule->to_tier_id)->toBe($record->to_tier_id);
});
