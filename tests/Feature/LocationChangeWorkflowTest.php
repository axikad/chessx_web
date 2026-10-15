<?php

use App\Models\AuditLog;
use App\Models\City;
use App\Models\LocationChangeHistory;
use App\Models\LocationChangeRequest;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Models\UserLocation;
use App\Services\RolePermissionService;
use Database\Seeders\GeographySeeder;

test('the cooldown prevents an early location-change request', function () {
    $this->seed(GeographySeeder::class);
    $user = User::factory()->create();
    $ahmedabad = City::query()->where('name', 'Ahmedabad')->firstOrFail();
    $surat = City::query()->where('name', 'Surat')->firstOrFail();
    UserLocation::factory()->for($user)->for($ahmedabad)->create();
    LocationChangeHistory::factory()->for($user)->create([
        'new_city_id' => $ahmedabad->id,
        'changed_at' => now()->subDays(89),
    ]);
    $resolved = $this->actingAs($user)->postJson(route('player.location.resolve'), [
        'permission' => 'granted', 'latitude' => 21.170240, 'longitude' => 72.831062,
    ]);

    $this->postJson(route('player.location.change-requests.store'), [
        'resolution_token' => $resolved->json('data.resolutionToken'),
        'city_id' => $surat->id,
        'reason' => 'Moved home',
    ])->assertUnprocessable()->assertJsonValidationErrors('location');

    $this->assertDatabaseCount('location_change_requests', 0);
});

test('an eligible player can submit one pending request without changing the current city', function () {
    $this->seed(GeographySeeder::class);
    $user = User::factory()->create();
    $ahmedabad = City::query()->where('name', 'Ahmedabad')->firstOrFail();
    $surat = City::query()->where('name', 'Surat')->firstOrFail();
    UserLocation::factory()->for($user)->for($ahmedabad)->create();
    LocationChangeHistory::factory()->for($user)->create([
        'new_city_id' => $ahmedabad->id,
        'changed_at' => now()->subDays(90)->subSecond(),
    ]);
    $resolved = $this->actingAs($user)->postJson(route('player.location.resolve'), [
        'permission' => 'granted', 'latitude' => 21.170240, 'longitude' => 72.831062,
    ]);

    $this->postJson(route('player.location.change-requests.store'), [
        'resolution_token' => $resolved->json('data.resolutionToken'),
        'city_id' => $surat->id,
        'reason' => 'Moved home',
    ])->assertCreated()->assertJsonPath('data.status', 'pending');

    $this->assertDatabaseHas('location_change_requests', [
        'user_id' => $user->id, 'old_city_id' => $ahmedabad->id, 'new_city_id' => $surat->id, 'status' => 'pending',
    ]);
    expect($user->currentLocation()->firstOrFail()->city_id)->toBe($ahmedabad->id);

    $this->postJson(route('player.location.change-requests.store'), [
        'resolution_token' => $resolved->json('data.resolutionToken'),
        'city_id' => $surat->id,
    ])->assertConflict();
});

test('an administrator without location permissions cannot review requests', function () {
    $actor = User::factory()->for(Role::factory()->admin())->create();
    $changeRequest = LocationChangeRequest::factory()->create();

    $this->actingAs($actor)
        ->patchJson(route('management.location-change-requests.update', $changeRequest), [
            'decision' => 'approved', 'review_reason' => 'Verified move',
        ])->assertForbidden();

    expect($changeRequest->fresh()->status)->toBe('pending');
});

test('only administrators with read permission can list location-change requests', function () {
    $role = Role::factory()->admin()->create();
    $actor = User::factory()->for($role)->create();
    $changeRequest = LocationChangeRequest::factory()->create();

    $this->actingAs($actor)
        ->getJson(route('management.location-change-requests.index'))
        ->assertForbidden();

    $permission = Permission::factory()->create(['slug' => 'player_locations.read']);
    app(RolePermissionService::class)->assign($role, $permission, $actor);

    $this->getJson(route('management.location-change-requests.index', ['status' => 'pending']))
        ->assertOk()
        ->assertJsonPath('data.0.id', $changeRequest->id);
});

test('an authorized administrator can approve a location change with history and audit records', function () {
    $role = Role::factory()->admin()->create();
    $actor = User::factory()->for($role)->create();
    $permission = Permission::factory()->create(['slug' => 'player_locations.review']);
    app(RolePermissionService::class)->assign($role, $permission, $actor);
    $player = User::factory()->create();
    $oldCity = City::factory()->create();
    $newCity = City::factory()->create();
    UserLocation::factory()->for($player)->for($oldCity)->create();
    $changeRequest = LocationChangeRequest::factory()->for($player)->create([
        'old_city_id' => $oldCity->id, 'new_city_id' => $newCity->id,
    ]);

    $this->actingAs($actor)
        ->patchJson(route('management.location-change-requests.update', $changeRequest), [
            'decision' => 'approved', 'review_reason' => 'Address evidence verified',
        ])->assertOk()->assertJsonPath('data.status', 'approved');

    expect($player->currentLocation()->firstOrFail()->city_id)->toBe($newCity->id);
    $this->assertDatabaseHas('location_change_histories', [
        'user_id' => $player->id, 'old_city_id' => $oldCity->id, 'new_city_id' => $newCity->id,
        'change_request_id' => $changeRequest->id,
    ]);
    $this->assertDatabaseHas('audit_logs', [
        'actor_user_id' => $actor->id, 'action' => 'location.change_approved',
        'entity_type' => 'location_change_requests', 'entity_id' => $changeRequest->id,
    ]);
});

test('rejecting a location change preserves the current city and creates an audit record', function () {
    $actor = User::factory()->for(Role::factory()->superAdmin())->create();
    $player = User::factory()->create();
    $oldCity = City::factory()->create();
    $newCity = City::factory()->create();
    UserLocation::factory()->for($player)->for($oldCity)->create();
    $changeRequest = LocationChangeRequest::factory()->for($player)->create([
        'old_city_id' => $oldCity->id, 'new_city_id' => $newCity->id,
    ]);

    $this->actingAs($actor)
        ->patchJson(route('management.location-change-requests.update', $changeRequest), [
            'decision' => 'rejected', 'review_reason' => 'Evidence did not match',
        ])->assertOk()->assertJsonPath('data.status', 'rejected');

    expect($player->currentLocation()->firstOrFail()->city_id)->toBe($oldCity->id);
    $this->assertDatabaseCount('location_change_histories', 0);
    expect(AuditLog::query()->firstOrFail()->metadata['review_reason'])->toBe('Evidence did not match');
});
