<?php

use App\Enums\CompetitionTierCode;
use App\Models\AuditLog;
use App\Models\City;
use App\Models\CompetitionRegion;
use App\Models\CompetitionTier;
use App\Models\LeaderboardSnapshot;
use App\Models\Permission;
use App\Models\Role;
use App\Models\State;
use App\Models\User;
use App\Services\RolePermissionService;
use Database\Seeders\CompetitionRegionSeeder;
use Database\Seeders\CompetitionTierSeeder;
use Database\Seeders\GeographySeeder;

function regionManager(): User
{
    return User::factory()->for(Role::factory()->superAdmin())->create();
}

test('authorized administrators can list competition regions with their scope and history count', function () {
    $this->seed([GeographySeeder::class, CompetitionTierSeeder::class, CompetitionRegionSeeder::class]);
    $cityRegion = CompetitionRegion::query()->whereNotNull('city_id')->firstOrFail();
    LeaderboardSnapshot::factory()->for($cityRegion, 'region')->for($cityRegion->tier, 'tier')->create();

    $this->actingAs(regionManager())
        ->getJson(route('management.competition-regions.index'))
        ->assertOk()
        ->assertJsonCount(79, 'data')
        ->assertJsonCount(4, 'tiers')
        ->assertJsonFragment([
            'id' => $cityRegion->id,
            'tierCode' => 'city',
            'leaderboardSnapshotCount' => 1,
        ]);
});

test('authorized administrators can create and update a scoped competition region with audit history', function () {
    $actor = regionManager();
    $tier = CompetitionTier::factory()->create();
    $state = State::factory()->create();
    $firstCity = City::factory()->for($state)->create();
    $secondCity = City::factory()->for($state)->create();

    $created = $this->actingAs($actor)->postJson(route('management.competition-regions.store'), [
        'tier_id' => $tier->id,
        'city_id' => $firstCity->id,
        'name' => '  First City League  ',
        'status' => 'active',
    ])->assertCreated()
        ->assertJsonPath('data.scopeKey', 'city:'.$firstCity->id)
        ->assertJsonPath('data.countryId', $state->country_id)
        ->assertJsonPath('data.stateId', $state->id);

    $region = CompetitionRegion::query()->findOrFail($created->json('data.id'));

    $this->putJson(route('management.competition-regions.update', $region), [
        'tier_id' => $tier->id,
        'city_id' => $secondCity->id,
        'name' => 'Second City League',
        'status' => 'inactive',
    ])->assertOk()
        ->assertJsonPath('data.scopeKey', 'city:'.$secondCity->id)
        ->assertJsonPath('data.status', 'inactive');

    $this->assertDatabaseHas('competition_regions', [
        'id' => $region->id,
        'city_id' => $secondCity->id,
        'name' => 'Second City League',
        'status' => 'inactive',
    ]);
    expect(AuditLog::query()->where('entity_type', 'competition_regions')->pluck('action')->all())
        ->toBe(['competition.region_created', 'competition.region_updated']);
});

test('region validation enforces the tier scope and prevents duplicates', function () {
    $actor = regionManager();
    $tier = CompetitionTier::factory()->stateLeague()->create();
    $state = State::factory()->create();
    $city = City::factory()->for($state)->create();
    CompetitionRegion::factory()->create([
        'tier_id' => $tier->id,
        'state_id' => $state->id,
        'city_id' => null,
    ]);

    $this->actingAs($actor)->postJson(route('management.competition-regions.store'), [
        'tier_id' => $tier->id,
        'city_id' => $city->id,
        'name' => 'Wrong Scope',
        'status' => 'active',
    ])->assertUnprocessable()->assertJsonValidationErrors('tier_id');

    $this->postJson(route('management.competition-regions.store'), [
        'tier_id' => $tier->id,
        'state_id' => $state->id,
        'name' => 'Duplicate State League',
        'status' => 'active',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('tier_id')
        ->assertJsonPath('errors.tier_id.0', 'A competition region already exists for this tier and geographic scope.');
});

test('unreferenced regions can be deleted while leaderboard history protects referenced regions', function () {
    $actor = regionManager();
    $tier = CompetitionTier::factory()->worldLeague()->create();
    $protected = CompetitionRegion::factory()->create([
        'tier_id' => $tier->id,
        'city_id' => null,
        'scope_key' => 'global',
        'name' => 'World League',
    ]);
    LeaderboardSnapshot::factory()->for($protected, 'region')->for($tier, 'tier')->create();

    $this->actingAs($actor)
        ->deleteJson(route('management.competition-regions.destroy', $protected))
        ->assertUnprocessable()
        ->assertJsonPath('message', 'Deactivate this region instead because it is referenced by leaderboard history.');
    $this->assertModelExists($protected);

    $cityTier = CompetitionTier::factory()->create(['code' => CompetitionTierCode::City]);
    $unreferenced = CompetitionRegion::factory()->for($cityTier, 'tier')->create();
    $this->deleteJson(route('management.competition-regions.destroy', $unreferenced))->assertOk();
    $this->assertModelMissing($unreferenced);
    $this->assertDatabaseHas('audit_logs', [
        'action' => 'competition.region_deleted',
        'entity_id' => $unreferenced->id,
    ]);
});

test('competition region management enforces read and write permissions', function () {
    $role = Role::factory()->create();
    $actor = User::factory()->for($role)->create();
    $readPermission = Permission::factory()->create(['slug' => 'competitions.read']);
    app(RolePermissionService::class)->assign($role, $readPermission, $actor);

    $this->actingAs($actor)->getJson(route('management.competition-regions.index'))->assertOk();
    $this->postJson(route('management.competition-regions.store'), [])->assertForbidden();
});
