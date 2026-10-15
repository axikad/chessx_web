<?php

use App\Enums\CompetitionTierCode;
use App\Models\CompetitionTier;
use Database\Seeders\CompetitionTierSeeder;

test('competition tiers are seeded in progression order', function () {
    $this->seed(CompetitionTierSeeder::class);

    $tiers = CompetitionTier::query()->orderBy('sequence_number')->get();

    expect($tiers)->toHaveCount(4)
        ->and($tiers->pluck('code')->all())->toBe([
            CompetitionTierCode::City,
            CompetitionTierCode::State,
            CompetitionTierCode::National,
            CompetitionTierCode::World,
        ])
        ->and($tiers->pluck('scope_type')->all())->toBe(['city', 'state', 'country', 'global'])
        ->and($tiers->every(fn (CompetitionTier $tier): bool => $tier->is_active))->toBeTrue();
});

test('competition tier seeding is idempotent', function () {
    $this->seed(CompetitionTierSeeder::class);
    CompetitionTier::query()->where('code', CompetitionTierCode::City)->update(['name' => 'Old Name']);

    $this->seed(CompetitionTierSeeder::class);

    expect(CompetitionTier::query()->count())->toBe(4)
        ->and(CompetitionTier::query()->where('code', CompetitionTierCode::City)->value('name'))->toBe('City League');
});
