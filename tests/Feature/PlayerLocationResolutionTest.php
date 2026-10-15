<?php

use App\Enums\CompetitionTierCode;
use App\Enums\PlayerCompetitionStatus;
use App\Models\City;
use App\Models\CompetitionTier;
use App\Models\PlayerCompetition;
use App\Models\User;
use Database\Seeders\CompetitionTierSeeder;
use Database\Seeders\GeographySeeder;

test('authentication is required to resolve a player location', function () {
    $this->postJson(route('player.location.resolve'), [
        'permission' => 'granted',
        'latitude' => 23.022505,
        'longitude' => 72.571362,
    ])->assertUnauthorized();
});

test('denied browser location permission saves nothing', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('player.location.resolve'), ['permission' => 'denied'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('permission');

    $this->assertDatabaseCount('user_locations', 0);
    $this->assertDatabaseCount('location_change_histories', 0);
});

test('coordinates outside the supported radius do not create a location', function () {
    $this->seed(GeographySeeder::class);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('player.location.resolve'), [
            'permission' => 'granted',
            'latitude' => 0,
            'longitude' => 0,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('location');

    $this->assertDatabaseCount('user_locations', 0);
});

test('GPS coordinates resolve nearby cities without being stored', function () {
    $this->seed(GeographySeeder::class);
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->postJson(route('player.location.resolve'), [
            'permission' => 'granted',
            'latitude' => 23.022505,
            'longitude' => 72.571362,
        ])
        ->assertOk()
        ->assertJsonPath('data.candidates.0.city', 'Ahmedabad')
        ->assertJsonPath('data.candidates.0.state', 'Gujarat')
        ->assertJsonMissingPath('data.latitude')
        ->assertJsonMissingPath('data.longitude');

    expect($response->json('data.resolutionToken'))->toBeString()->not->toBeEmpty();
    $this->assertDatabaseCount('user_locations', 0);
});

test('a player can confirm a resolved city once', function () {
    $this->seed([GeographySeeder::class, CompetitionTierSeeder::class]);
    $user = User::factory()->create();
    $city = City::query()->where('name', 'Ahmedabad')->firstOrFail();

    $resolved = $this->actingAs($user)->postJson(route('player.location.resolve'), [
        'permission' => 'granted',
        'latitude' => 23.022505,
        'longitude' => 72.571362,
    ]);

    $this->postJson(route('player.location.confirm'), [
        'resolution_token' => $resolved->json('data.resolutionToken'),
        'accepted' => true,
        'city_id' => $city->id,
    ])->assertCreated()
        ->assertJsonPath('data.city', 'Ahmedabad')
        ->assertJsonPath('data.verificationMethod', 'gps');

    $this->assertDatabaseHas('user_locations', [
        'user_id' => $user->id,
        'city_id' => $city->id,
        'verification_method' => 'gps',
        'is_current' => true,
    ]);
    $this->assertDatabaseHas('location_change_histories', [
        'user_id' => $user->id,
        'old_city_id' => null,
        'new_city_id' => $city->id,
    ]);
    $cityTier = CompetitionTier::query()->where('code', CompetitionTierCode::City)->firstOrFail();
    $this->assertDatabaseHas('player_competitions', [
        'user_id' => $user->id,
        'tier_id' => $cityTier->id,
        'season_id' => null,
        'status' => PlayerCompetitionStatus::Eligible->value,
    ]);

    $this->postJson(route('player.location.confirm'), [
        'resolution_token' => $resolved->json('data.resolutionToken'),
        'accepted' => true,
        'city_id' => $city->id,
    ])->assertConflict();
});

test('location confirmation unlocks only the standing City League eligibility', function () {
    $this->seed([GeographySeeder::class, CompetitionTierSeeder::class]);
    $user = User::factory()->create();
    $city = City::query()->where('name', 'Ahmedabad')->firstOrFail();
    $cityTier = CompetitionTier::query()->where('code', CompetitionTierCode::City)->firstOrFail();
    $stateTier = CompetitionTier::query()->where('code', CompetitionTierCode::State)->firstOrFail();
    $cityEligibility = PlayerCompetition::factory()->for($user)->for($cityTier, 'tier')->create();
    $stateEligibility = PlayerCompetition::factory()->for($user)->for($stateTier, 'tier')->create();
    $resolved = $this->actingAs($user)->postJson(route('player.location.resolve'), [
        'permission' => 'granted',
        'latitude' => 23.022505,
        'longitude' => 72.571362,
    ]);

    $this->postJson(route('player.location.confirm'), [
        'resolution_token' => $resolved->json('data.resolutionToken'),
        'accepted' => true,
        'city_id' => $city->id,
    ])->assertCreated();

    expect($cityEligibility->refresh()->status)->toBe(PlayerCompetitionStatus::Eligible)
        ->and($cityEligibility->unlocked_at)->not->toBeNull()
        ->and($stateEligibility->refresh()->status)->toBe(PlayerCompetitionStatus::Locked)
        ->and($stateEligibility->unlocked_at)->toBeNull();

    expect(PlayerCompetition::query()
        ->whereBelongsTo($user)
        ->whereBelongsTo($cityTier, 'tier')
        ->whereNull('season_id')
        ->count())->toBe(1);
});

test('a resolution token cannot be used by another player', function () {
    $this->seed(GeographySeeder::class);
    $owner = User::factory()->create();
    $otherPlayer = User::factory()->create();
    $city = City::query()->where('name', 'Ahmedabad')->firstOrFail();

    $resolved = $this->actingAs($owner)->postJson(route('player.location.resolve'), [
        'permission' => 'granted',
        'latitude' => 23.022505,
        'longitude' => 72.571362,
    ]);

    $this->actingAs($otherPlayer)
        ->postJson(route('player.location.confirm'), [
            'resolution_token' => $resolved->json('data.resolutionToken'),
            'accepted' => true,
            'city_id' => $city->id,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('resolution_token');

    $this->assertDatabaseCount('user_locations', 0);
});

test('an expired resolution token cannot create a location', function () {
    $this->travelTo('2026-10-15 12:00:00');
    $this->seed(GeographySeeder::class);
    $user = User::factory()->create();
    $city = City::query()->where('name', 'Ahmedabad')->firstOrFail();
    $resolved = $this->actingAs($user)->postJson(route('player.location.resolve'), [
        'permission' => 'granted',
        'latitude' => 23.022505,
        'longitude' => 72.571362,
    ]);

    $this->travel(16)->minutes();

    $this->postJson(route('player.location.confirm'), [
        'resolution_token' => $resolved->json('data.resolutionToken'),
        'accepted' => true,
        'city_id' => $city->id,
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('resolution_token');

    $this->assertDatabaseCount('user_locations', 0);
});
