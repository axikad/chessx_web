<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Models\UserProfile;
use App\Services\RolePermissionService;

test('returns 403 when an administrator lacks player profile read permission', function () {
    $actor = User::factory()->for(Role::factory()->admin())->create();
    $target = User::factory()->has(UserProfile::factory(), 'profile')->create();

    $this->actingAs($actor)
        ->getJson(route('management.users.profile.show', $target))
        ->assertForbidden();
});

test('an authorized administrator can read another players profile', function () {
    $role = Role::factory()->admin()->create();
    $actor = User::factory()->for($role)->create();
    $target = User::factory()->has(UserProfile::factory()->state([
        'display_name' => 'Chess Knight',
        'date_of_birth' => '2000-05-10',
    ]), 'profile')->create();
    $permission = Permission::factory()->create(['slug' => 'player_profiles.read']);
    app(RolePermissionService::class)->assign($role, $permission, $actor);

    $this->actingAs($actor)
        ->getJson(route('management.users.profile.show', $target))
        ->assertOk()
        ->assertJsonPath('data.displayName', 'Chess Knight')
        ->assertJsonPath('data.dateOfBirth', '2000-05-10');
});

test('read permission does not allow updating another players profile', function () {
    $role = Role::factory()->admin()->create();
    $actor = User::factory()->for($role)->create();
    $target = User::factory()->has(UserProfile::factory()->state(['display_name' => 'Original Name']), 'profile')->create();
    $permission = Permission::factory()->create(['slug' => 'player_profiles.read']);
    app(RolePermissionService::class)->assign($role, $permission, $actor);

    $this->actingAs($actor)
        ->patchJson(route('management.users.profile.update', $target), ['display_name' => 'Changed Name'])
        ->assertForbidden();

    expect($target->profile->fresh()->display_name)->toBe('Original Name');
});

test('an authorized administrator can update another players profile', function () {
    $role = Role::factory()->admin()->create();
    $actor = User::factory()->for($role)->create();
    $target = User::factory()->create();
    $permission = Permission::factory()->create(['slug' => 'player_profiles.update']);
    app(RolePermissionService::class)->assign($role, $permission, $actor);

    $this->actingAs($actor)
        ->patchJson(route('management.users.profile.update', $target), [
            'display_name' => 'Updated Player',
            'language' => 'en',
            'timezone' => 'Asia/Kolkata',
            'date_of_birth' => '2000-05-10',
            'profile_visibility' => 'private',
        ])
        ->assertOk()
        ->assertJsonPath('data.displayName', 'Updated Player');

    $this->assertDatabaseHas('user_profiles', [
        'user_id' => $target->id,
        'display_name' => 'Updated Player',
        'profile_visibility' => 'private',
    ]);
});

test('non super administrators cannot access a super admin player profile', function () {
    $role = Role::factory()->admin()->create();
    $actor = User::factory()->for($role)->create();
    $target = User::factory()->for(Role::factory()->superAdmin())->create();
    $permissions = Permission::factory()->count(2)->sequence(
        ['slug' => 'player_profiles.read'],
        ['slug' => 'player_profiles.update'],
    )->create();
    app(RolePermissionService::class)->sync($role, $permissions->modelKeys(), $actor);

    $this->actingAs($actor)
        ->getJson(route('management.users.profile.show', $target))
        ->assertNotFound();

    $this->patchJson(route('management.users.profile.update', $target), ['display_name' => 'Unsafe Change'])
        ->assertForbidden();

    $this->assertDatabaseMissing('user_profiles', ['user_id' => $target->id]);
});
