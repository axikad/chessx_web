<?php

use App\Models\City;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\CompetitionTierSeeder;
use Database\Seeders\GeographySeeder;
use Laravel\Sanctum\Sanctum;

it('returns 401 when a mobile token is missing from location endpoints', function () {
    $this->getJson('/api/v1/player/location')->assertUnauthorized()->assertJsonPath('code', 'unauthenticated');
});

it('resolves GPS coordinates without storing the raw coordinates', function () {
    $this->seed(GeographySeeder::class);
    $role = Role::factory()->user()->create();
    $user = User::factory()->for($role)->create(['status' => 'active']);
    Sanctum::actingAs($user, ['mobile']);

    $response = $this->postJson('/api/v1/player/location/resolve', [
        'permission' => 'granted',
        'latitude' => 23.022505,
        'longitude' => 72.571362,
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.candidates.0.city', 'Ahmedabad')
        ->assertJsonMissingPath('data.latitude')
        ->assertJsonMissingPath('data.longitude');
    expect($response->json('data.resolutionToken'))->toBeString()->not->toBeEmpty();
    $this->assertDatabaseCount('user_locations', 0);
});

it('confirms a resolved home city and advances onboarding to profile', function () {
    $this->seed([GeographySeeder::class, CompetitionTierSeeder::class]);
    $role = Role::factory()->user()->create();
    $user = User::factory()->for($role)->create([
        'status' => 'active',
        'onboarding_completed_at' => null,
    ]);
    $city = City::query()->where('name', 'Ahmedabad')->firstOrFail();
    Sanctum::actingAs($user, ['mobile']);
    $resolved = $this->postJson('/api/v1/player/location/resolve', [
        'permission' => 'granted',
        'latitude' => 23.022505,
        'longitude' => 72.571362,
    ])->assertOk();

    $this->postJson('/api/v1/player/location/confirm', [
        'resolution_token' => $resolved->json('data.resolutionToken'),
        'accepted' => true,
        'city_id' => $city->getKey(),
    ])->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.city', 'Ahmedabad')
        ->assertJsonPath('data.onboarding.next_step', 'profile');

    $this->assertDatabaseHas('user_locations', [
        'user_id' => $user->getKey(),
        'city_id' => $city->getKey(),
        'is_current' => true,
    ]);
});

it('returns 422 when location permission is denied', function () {
    $role = Role::factory()->user()->create();
    $user = User::factory()->for($role)->create(['status' => 'active']);
    Sanctum::actingAs($user, ['mobile']);

    $this->postJson('/api/v1/player/location/resolve', [
        'permission' => 'denied',
    ])->assertUnprocessable()
        ->assertJsonPath('success', false)
        ->assertJsonPath('code', 'validation_failed')
        ->assertJsonValidationErrors('permission');

});
