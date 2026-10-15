<?php

use App\Enums\CompetitionTierCode;
use App\Models\City;
use App\Models\CompetitionRegion;
use App\Models\CompetitionTier;
use App\Models\Country;
use App\Models\State;
use Database\Seeders\CompetitionRegionSeeder;
use Database\Seeders\CompetitionTierSeeder;
use Database\Seeders\GeographySeeder;

test('India geography creates city state national and world competition regions', function () {
    $this->seed([GeographySeeder::class, CompetitionTierSeeder::class, CompetitionRegionSeeder::class]);

    expect(CompetitionRegion::query()->count())->toBe(79)
        ->and(CompetitionRegion::query()->whereNotNull('city_id')->count())->toBe(41)
        ->and(CompetitionRegion::query()->whereNotNull('state_id')->count())->toBe(36)
        ->and(CompetitionRegion::query()->whereNotNull('country_id')->count())->toBe(1)
        ->and(CompetitionRegion::query()->where('scope_key', 'global')->count())->toBe(1);
});

test('competition region seeding is idempotent', function () {
    $this->seed([GeographySeeder::class, CompetitionTierSeeder::class, CompetitionRegionSeeder::class]);
    $this->seed(CompetitionRegionSeeder::class);

    expect(CompetitionRegion::query()->count())->toBe(79);
});

test('competition regions retain their geographic relationships', function () {
    $this->seed([GeographySeeder::class, CompetitionTierSeeder::class, CompetitionRegionSeeder::class]);
    $ahmedabad = City::query()->where('name', 'Ahmedabad')->firstOrFail();
    $gujarat = State::query()->where('code', 'GJ')->firstOrFail();
    $india = Country::query()->where('iso2', 'IN')->firstOrFail();

    $cityRegion = CompetitionRegion::query()->where('city_id', $ahmedabad->id)->firstOrFail();
    $stateRegion = CompetitionRegion::query()->where('state_id', $gujarat->id)->firstOrFail();
    $nationalRegion = CompetitionRegion::query()->where('country_id', $india->id)->firstOrFail();

    expect($cityRegion->tier->code)->toBe(CompetitionTierCode::City)
        ->and($cityRegion->city->is($ahmedabad))->toBeTrue()
        ->and($stateRegion->tier->code)->toBe(CompetitionTierCode::State)
        ->and($stateRegion->state->is($gujarat))->toBeTrue()
        ->and($nationalRegion->tier->code)->toBe(CompetitionTierCode::National)
        ->and($nationalRegion->country->is($india))->toBeTrue();
});

test('a competition region cannot use geography from the wrong tier scope', function () {
    $this->seed([GeographySeeder::class, CompetitionTierSeeder::class]);
    $stateTier = CompetitionTier::query()->where('code', CompetitionTierCode::State)->firstOrFail();
    $city = City::query()->firstOrFail();

    expect(fn () => CompetitionRegion::query()->create([
        'tier_id' => $stateTier->id,
        'city_id' => $city->id,
        'name' => 'Invalid State Region',
        'status' => 'active',
    ]))->toThrow(LogicException::class, 'State regions must reference only a state.');

    $this->assertDatabaseCount('competition_regions', 0);
});
