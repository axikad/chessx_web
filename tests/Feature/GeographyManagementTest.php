<?php

use App\Models\City;
use App\Models\Country;
use App\Models\Permission;
use App\Models\Role;
use App\Models\State;
use App\Models\User;
use App\Models\UserLocation;
use App\Services\RolePermissionService;

function geographyAdministrator(): User
{
    return User::factory()->for(Role::factory()->superAdmin())->create();
}

it('lists active and inactive geography records with dependency counts', function () {
    $country = Country::factory()->create(['status' => 'inactive']);
    $state = State::factory()->for($country)->create(['status' => 'inactive']);
    $city = City::factory()->for($state)->create(['status' => 'inactive']);
    UserLocation::factory()->for($city)->create();

    $this->actingAs(geographyAdministrator())
        ->getJson(route('management.geography.countries.index'))
        ->assertOk()
        ->assertJsonPath('data.0.status', 'inactive')
        ->assertJsonPath('data.0.states_count', 1);

    $this->getJson(route('management.geography.states.index', ['country_id' => $country->id]))
        ->assertOk()
        ->assertJsonPath('data.0.status', 'inactive')
        ->assertJsonPath('data.0.cities_count', 1);

    $this->getJson(route('management.geography.cities.index', ['state_id' => $state->id]))
        ->assertOk()
        ->assertJsonPath('data.0.status', 'inactive')
        ->assertJsonPath('data.0.players_count', 1);
});

it('creates and updates a complete manual geography hierarchy with audit history', function () {
    $actor = geographyAdministrator();

    $countryResponse = $this->actingAs($actor)
        ->postJson(route('management.geography.countries.store'), [
            'iso2' => ' nz ',
            'iso3' => 'nzl',
            'name' => ' New   Zealand ',
            'status' => 'active',
        ])
        ->assertCreated()
        ->assertJsonPath('data.iso2', 'NZ')
        ->assertJsonPath('data.name', 'New Zealand');
    $country = Country::query()->findOrFail($countryResponse->json('data.id'));

    $stateResponse = $this->postJson(route('management.geography.states.store'), [
        'country_id' => $country->id,
        'name' => ' Auckland  Region ',
        'code' => ' auk ',
        'status' => 'active',
    ])->assertCreated()->assertJsonPath('data.code', 'AUK');
    $state = State::query()->findOrFail($stateResponse->json('data.id'));

    $cityResponse = $this->postJson(route('management.geography.cities.store'), [
        'state_id' => $state->id,
        'name' => ' Auckland ',
        'district' => ' Auckland ',
        'latitude' => -36.8509,
        'longitude' => 174.7645,
        'timezone' => 'Pacific/Auckland',
        'status' => 'active',
    ])->assertCreated()->assertJsonPath('data.name', 'Auckland');
    $city = City::query()->findOrFail($cityResponse->json('data.id'));

    $this->putJson(route('management.geography.cities.update', $city), [
        'state_id' => $state->id,
        'name' => 'Auckland City',
        'district' => 'Auckland',
        'latitude' => -36.8509,
        'longitude' => 174.7645,
        'timezone' => 'Pacific/Auckland',
        'status' => 'inactive',
    ])->assertOk()->assertJsonPath('data.status', 'inactive');

    $this->assertDatabaseHas('cities', [
        'id' => $city->id,
        'name' => 'Auckland City',
        'normalized_name' => 'auckland city',
        'status' => 'inactive',
    ]);
    $this->assertDatabaseHas('audit_logs', ['actor_user_id' => $actor->id, 'action' => 'geography.country_created']);
    $this->assertDatabaseHas('audit_logs', ['actor_user_id' => $actor->id, 'action' => 'geography.state_created']);
    $this->assertDatabaseHas('audit_logs', ['actor_user_id' => $actor->id, 'action' => 'geography.city_created']);
    $this->assertDatabaseHas('audit_logs', ['actor_user_id' => $actor->id, 'action' => 'geography.city_updated']);
});

it('preserves GeoNames identifiers when administrators update imported records', function () {
    $country = Country::factory()->create(['geonames_id' => 1269750]);

    $this->actingAs(geographyAdministrator())
        ->putJson(route('management.geography.countries.update', $country), [
            'iso2' => $country->iso2,
            'iso3' => $country->iso3,
            'name' => 'Updated Country Name',
            'status' => 'inactive',
        ])
        ->assertOk()
        ->assertJsonPath('data.geonames_id', 1269750);

    expect($country->fresh()->geonames_id)->toBe(1269750);
});

it('validates country uniqueness and complete coordinate pairs', function () {
    $existing = Country::factory()->create(['iso2' => 'IN']);
    $state = State::factory()->create();

    $this->actingAs(geographyAdministrator())
        ->postJson(route('management.geography.countries.store'), [
            'iso2' => 'in',
            'iso3' => 'ZZZ',
            'name' => 'Another Country',
            'status' => 'active',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('iso2');

    $this->postJson(route('management.geography.cities.store'), [
        'state_id' => $state->id,
        'name' => 'Incomplete Coordinates',
        'latitude' => 23.02,
        'longitude' => null,
        'status' => 'active',
    ])->assertUnprocessable()->assertJsonValidationErrors('longitude');

    $this->assertModelExists($existing);
    $this->assertDatabaseMissing('cities', ['name' => 'Incomplete Coordinates']);
});

it('deletes unreferenced records and blocks deletion of linked geography', function () {
    $actor = geographyAdministrator();
    $emptyCountry = Country::factory()->create();
    $linkedCountry = Country::factory()->create();
    State::factory()->for($linkedCountry)->create();

    $this->actingAs($actor)
        ->deleteJson(route('management.geography.countries.destroy', $emptyCountry))
        ->assertOk();
    $this->assertDatabaseMissing('countries', ['id' => $emptyCountry->id]);
    $this->assertDatabaseHas('audit_logs', [
        'actor_user_id' => $actor->id,
        'action' => 'geography.country_deleted',
        'entity_id' => $emptyCountry->id,
    ]);

    $this->deleteJson(route('management.geography.countries.destroy', $linkedCountry))
        ->assertUnprocessable()
        ->assertJsonPath('message', 'Deactivate this country instead because it is referenced by states or competition regions.');
    $this->assertModelExists($linkedCountry);
});

it('enforces geography permissions independently for reading and writing', function () {
    $role = Role::factory()->create();
    $actor = User::factory()->for($role)->create();
    app(RolePermissionService::class)->assign(
        $role,
        Permission::factory()->create(['slug' => 'geography.read']),
        $actor,
    );

    $this->actingAs($actor)
        ->getJson(route('management.geography.countries.index'))
        ->assertOk();

    $this->postJson(route('management.geography.countries.store'), [
        'iso2' => 'NZ',
        'iso3' => 'NZL',
        'name' => 'New Zealand',
        'status' => 'active',
    ])->assertForbidden();

    $this->assertDatabaseMissing('countries', ['iso2' => 'NZ']);
});
