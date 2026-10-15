<?php

use App\Models\City;
use App\Models\Country;
use App\Models\LocationChangeHistory;
use App\Models\LocationChangeRequest;
use App\Models\State;
use App\Models\User;
use App\Models\UserLocation;
use Database\Seeders\GeographySeeder;

test('geography and location data endpoints require authentication', function (string $routeName) {
    $this->getJson(route($routeName))->assertUnauthorized();
})->with([
    'countries' => 'geography.countries',
    'states' => 'geography.states',
    'cities' => 'geography.cities',
    'player location' => 'player.location.show',
]);

test('authenticated players can load the India geography hierarchy', function () {
    $this->seed(GeographySeeder::class);
    $user = User::factory()->create();
    $india = Country::query()->where('iso2', 'IN')->firstOrFail();
    $gujarat = State::query()->where('code', 'GJ')->firstOrFail();

    $this->actingAs($user)
        ->getJson(route('geography.countries'))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.iso2', 'IN');

    $this->getJson(route('geography.states', ['country_id' => $india->id]))
        ->assertOk()
        ->assertJsonCount(36, 'data')
        ->assertJsonFragment(['name' => 'Gujarat', 'code' => 'GJ']);

    $this->getJson(route('geography.cities', ['state_id' => $gujarat->id, 'search' => 'bad']))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Ahmedabad');
});

test('geography hierarchy endpoints validate their parent identifiers', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson(route('geography.states'))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('country_id');

    $this->getJson(route('geography.cities'))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('state_id');
});

test('a player without a location receives an empty location snapshot', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson(route('player.location.show'))
        ->assertOk()
        ->assertJsonPath('data.current', null)
        ->assertJsonPath('data.pendingRequest', null)
        ->assertJsonPath('data.cooldown.changeAllowed', false);
});

test('the location snapshot returns current pending and cooldown information', function () {
    $this->travelTo('2026-10-15 12:00:00');
    $this->seed(GeographySeeder::class);
    $user = User::factory()->create();
    $ahmedabad = City::query()->where('name', 'Ahmedabad')->firstOrFail();
    $surat = City::query()->where('name', 'Surat')->firstOrFail();
    UserLocation::factory()->for($user)->for($ahmedabad)->create(['verified_at' => now()->subDays(20)]);
    LocationChangeHistory::factory()->for($user)->create([
        'new_city_id' => $ahmedabad->id,
        'changed_at' => now()->subDays(20),
    ]);
    $request = LocationChangeRequest::factory()->for($user)->create([
        'old_city_id' => $ahmedabad->id,
        'new_city_id' => $surat->id,
        'reason' => 'Moved for work',
    ]);

    $this->actingAs($user)
        ->getJson(route('player.location.show'))
        ->assertOk()
        ->assertJsonPath('data.current.city', 'Ahmedabad')
        ->assertJsonPath('data.current.state', 'Gujarat')
        ->assertJsonPath('data.pendingRequest.id', $request->id)
        ->assertJsonPath('data.pendingRequest.newCity.city', 'Surat')
        ->assertJsonPath('data.cooldown.days', 90)
        ->assertJsonPath('data.cooldown.changeAllowed', false)
        ->assertJsonPath('data.cooldown.availableAt', '2026-12-24T12:00:00+00:00');
});
