<?php

use App\Models\City;
use App\Models\Country;
use App\Models\State;
use Database\Seeders\GeographySeeder;

test('countries contain states and states contain cities', function () {
    $country = Country::factory()->create();
    $state = State::factory()->for($country)->create();
    $city = City::factory()->for($state)->create();

    expect($country->states->first()->is($state))->toBeTrue()
        ->and($state->country->is($country))->toBeTrue()
        ->and($state->cities->first()->is($city))->toBeTrue()
        ->and($city->state->is($state))->toBeTrue();
});

test('city names are normalized consistently when saved', function () {
    $state = State::factory()->create();

    $city = City::factory()->for($state)->create([
        'name' => '  São   Paulo  ',
    ]);

    expect($city->normalized_name)->toBe('sao paulo');
});

test('the same state name can exist in different countries', function () {
    $firstCountry = Country::factory()->create();
    $secondCountry = Country::factory()->create();

    $firstState = State::factory()->for($firstCountry)->create(['name' => 'Georgia']);
    $secondState = State::factory()->for($secondCountry)->create(['name' => 'Georgia']);

    $this->assertModelExists($firstState);
    $this->assertModelExists($secondState);
});

test('city coordinates retain seven decimal places', function () {
    $city = City::factory()->create([
        'latitude' => '23.0225050',
        'longitude' => '72.5713620',
    ]);

    expect($city->latitude)->toBe('23.0225050')
        ->and($city->longitude)->toBe('72.5713620');
});

test('India starter geography seeding is complete and idempotent', function () {
    $this->seed(GeographySeeder::class);
    $this->seed(GeographySeeder::class);

    $gujarat = State::query()->where('code', 'GJ')->firstOrFail();

    expect(Country::query()->count())->toBe(1)
        ->and(Country::query()->value('iso2'))->toBe('IN')
        ->and(State::query()->count())->toBe(36)
        ->and(City::query()->count())->toBe(41)
        ->and($gujarat->cities()->orderBy('name')->pluck('name')->all())->toBe([
            'Ahmedabad',
            'Gandhinagar',
            'Rajkot',
            'Surat',
            'Vadodara',
        ]);
});
