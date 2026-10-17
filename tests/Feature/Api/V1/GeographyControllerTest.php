<?php

use App\Models\City;
use App\Models\Country;
use App\Models\State;
use App\Models\User;
use Database\Seeders\GeographySeeder;
use Laravel\Sanctum\Sanctum;

it('returns 401 when a mobile token is missing', function (string $endpoint) {
    $this->getJson($endpoint)->assertUnauthorized();
})->with([
    'countries' => '/api/v1/geography/countries',
    'states' => '/api/v1/geography/states?country_id=1',
    'cities' => '/api/v1/geography/cities?state_id=1',
]);

it('returns the active India country options', function () {
    $this->seed(GeographySeeder::class);
    Country::factory()->create(['status' => 'inactive']);
    Sanctum::actingAs(User::factory()->create(['status' => 'active']), ['mobile']);

    $response = $this->getJson('/api/v1/geography/countries');

    $response->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.iso2', 'IN')
        ->assertJsonStructure(['data' => [['id', 'iso2', 'iso3', 'name']]]);
});

it('returns active states belonging to the selected country', function () {
    $this->seed(GeographySeeder::class);
    $india = Country::query()->where('iso2', 'IN')->firstOrFail();
    State::factory()->for($india)->create(['status' => 'inactive']);
    Sanctum::actingAs(User::factory()->create(['status' => 'active']), ['mobile']);

    $response = $this->getJson('/api/v1/geography/states?country_id='.$india->getKey());

    $response->assertOk()
        ->assertJsonCount(36, 'data')
        ->assertJsonFragment(['name' => 'Gujarat', 'code' => 'GJ'])
        ->assertJsonStructure(['data' => [['id', 'country_id', 'name', 'code']]]);
});

it('returns searchable active cities belonging to the selected state', function () {
    $this->seed(GeographySeeder::class);
    $gujarat = State::query()->where('code', 'GJ')->firstOrFail();
    City::factory()->for($gujarat)->create([
        'name' => 'Badlapur Test',
        'status' => 'inactive',
    ]);
    Sanctum::actingAs(User::factory()->create(['status' => 'active']), ['mobile']);

    $response = $this->getJson('/api/v1/geography/cities?state_id='.$gujarat->getKey().'&search=bad');

    $response->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Ahmedabad')
        ->assertJsonStructure(['data' => [['id', 'state_id', 'name', 'timezone']]]);
});

it('returns 422 when geography filters are missing or invalid', function () {
    Sanctum::actingAs(User::factory()->create(['status' => 'active']), ['mobile']);

    $this->getJson('/api/v1/geography/states')
        ->assertUnprocessable()
        ->assertJsonValidationErrors('country_id');

    $this->getJson('/api/v1/geography/cities?state_id=999999')
        ->assertUnprocessable()
        ->assertJsonValidationErrors('state_id');
});
