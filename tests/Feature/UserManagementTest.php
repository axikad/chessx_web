<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Services\RolePermissionService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('super admin can create update list and delete users', function () {
    $actor = User::factory()->for(Role::factory()->superAdmin())->create();
    $role = Role::factory()->user()->create();

    $create = $this->actingAs($actor)->postJson(route('management.users.store'), [
        'name' => 'New Player', 'email' => 'player@example.test', 'phone' => '12345',
        'password' => 'password123', 'role_id' => $role->id, 'status' => 'active',
    ])->assertCreated()->assertJsonPath('data.email', 'player@example.test');

    $user = User::query()->findOrFail($create->json('data.id'));
    $this->getJson(route('management.users.index'))->assertOk()->assertJsonFragment(['email' => 'player@example.test']);
    $this->putJson(route('management.users.update', $user), [
        'name' => 'Updated Player', 'email' => 'player@example.test', 'phone' => null,
        'password' => '', 'role_id' => $role->id, 'status' => 'inactive',
    ])->assertOk()->assertJsonPath('data.status', 'inactive');
    $this->deleteJson(route('management.users.destroy', $user))->assertOk();
    $this->assertSoftDeleted($user);
});

test('authorized users can list and restore archived accounts', function () {
    $role = Role::factory()->create();
    $actor = User::factory()->for($role)->create();
    $target = User::factory()->for(Role::factory()->user())->create();
    $read = Permission::factory()->create(['slug' => 'users.read']);
    $restore = Permission::factory()->create(['slug' => 'users.restore']);
    app(RolePermissionService::class)->sync($role, [$read->id, $restore->id], $actor);
    $target->delete();

    $this->actingAs($actor)
        ->getJson(route('management.users.index', ['account' => 'archived']))
        ->assertOk()
        ->assertJsonFragment(['email' => $target->email]);

    $this->putJson(route('management.users.restore', $target->id))
        ->assertOk()
        ->assertJsonPath('data.email', $target->email);

    expect($target->fresh())->not->toBeNull();
});

test('users without restore permission cannot recover archived accounts', function () {
    $actor = User::factory()->for(Role::factory()->user())->create();
    $target = User::factory()->create();
    $target->delete();

    $this->actingAs($actor)
        ->putJson(route('management.users.restore', $target->id))
        ->assertForbidden();

    $this->assertSoftDeleted($target);
});

test('ordinary users cannot access user management', function () {
    $user = User::factory()->for(Role::factory()->user())->create();
    $this->actingAs($user)->getJson(route('management.users.index'))->assertForbidden();
});

test('users with read permission cannot see super admin accounts without the dedicated permission', function () {
    $role = Role::factory()->create();
    $actor = User::factory()->for($role)->create();
    $visibleUser = User::factory()->for(Role::factory()->user())->create(['email' => 'visible@example.test']);
    $superAdmin = User::factory()->for(Role::factory()->superAdmin())->create(['email' => 'hidden@example.test']);
    $read = Permission::factory()->create(['slug' => 'users.read']);
    app(RolePermissionService::class)->assign($role, $read, $actor);

    $response = $this->actingAs($actor)->getJson(route('management.users.index'));

    $response->assertOk()
        ->assertJsonFragment(['email' => $visibleUser->email])
        ->assertJsonMissing(['email' => $superAdmin->email]);
});

test('super admin records return not found without the dedicated viewing permission', function () {
    $role = Role::factory()->create();
    $actor = User::factory()->for($role)->create();
    $superAdmin = User::factory()->for(Role::factory()->superAdmin())->create();
    $read = Permission::factory()->create(['slug' => 'users.read']);
    app(RolePermissionService::class)->assign($role, $read, $actor);

    $this->actingAs($actor)->getJson(route('management.users.show', $superAdmin))->assertNotFound();
});

test('users with the dedicated viewing permission can see super admin accounts', function () {
    $role = Role::factory()->create();
    $actor = User::factory()->for($role)->create();
    $superAdmin = User::factory()->for(Role::factory()->superAdmin())->create(['email' => 'allowed@example.test']);
    $read = Permission::factory()->create(['slug' => 'users.read']);
    $viewSuperAdmin = Permission::factory()->create(['slug' => 'users.view_super_admin']);
    app(RolePermissionService::class)->sync($role, [$read->id, $viewSuperAdmin->id], $actor);

    $this->actingAs($actor)->getJson(route('management.users.index'))
        ->assertOk()
        ->assertJsonFragment(['email' => $superAdmin->email]);
});

test('read-only user management permission does not allow write operations', function () {
    $role = Role::factory()->create();
    $actor = User::factory()->for($role)->create();
    $target = User::factory()->create();
    $read = Permission::factory()->create(['slug' => 'users.read']);
    app(RolePermissionService::class)->assign($role, $read, $actor);

    $this->actingAs($actor)->postJson(route('management.users.store'), [])->assertForbidden();
    $this->putJson(route('management.users.update', $target), [])->assertForbidden();
    $this->deleteJson(route('management.users.destroy', $target))->assertForbidden();
});

test('a user cannot delete their own account', function () {
    $user = User::factory()->for(Role::factory()->superAdmin())->create();
    $this->actingAs($user)->deleteJson(route('management.users.destroy', $user))->assertUnprocessable();
    $this->assertDatabaseHas('users', ['id' => $user->id]);
});

test('role options come from the database and non super admins cannot assign super admin', function () {
    $adminRole = Role::factory()->admin()->create();
    $userRole = Role::factory()->user()->create();
    $superAdminRole = Role::factory()->superAdmin()->create();
    $admin = User::factory()->for($adminRole)->create();
    $createUsers = Permission::factory()->create(['slug' => 'users.create']);
    app(RolePermissionService::class)->assign($adminRole, $createUsers);

    $this->actingAs($admin)
        ->getJson(route('management.users.role-options'))
        ->assertOk()
        ->assertJsonFragment(['id' => $userRole->id, 'slug' => 'user'])
        ->assertJsonMissing(['id' => $superAdminRole->id, 'slug' => 'super_admin']);

    $this->postJson(route('management.users.store'), [
        'name' => 'Unsafe User', 'email' => 'unsafe@example.test', 'phone' => null,
        'password' => 'password123', 'role_id' => $superAdminRole->id, 'status' => 'active',
    ])->assertUnprocessable()->assertJsonValidationErrors('role_id');
});

test('a profile image is stored and returned for the user and authenticated header', function () {
    Storage::fake('public');
    $role = Role::factory()->superAdmin()->create();
    $actor = User::factory()->for($role)->create();

    $response = $this->actingAs($actor)->post(route('management.users.store'), [
        'name' => 'Avatar User', 'email' => 'avatar@example.test', 'phone' => null,
        'password' => 'password123', 'role_id' => $role->id, 'status' => 'active',
        'avatar' => UploadedFile::fake()->image('avatar.jpg', 300, 300),
    ])->assertCreated();

    $user = User::query()->findOrFail($response->json('data.id'));
    Storage::disk('public')->assertExists($user->avatar_path);
    expect($response->json('data.avatar'))->toContain('/storage/avatars/');

    $user->update(['avatar_path' => $user->avatar_path]);
    $this->actingAs($user)->get(route('home'))->assertInertia(fn (Assert $page) => $page
        ->where('auth.user.name', 'Avatar User')
        ->where('auth.user.role', 'Super Admin')
        ->where('auth.user.avatar', fn (string $avatar): bool => str_contains($avatar, '/storage/avatars/')));
});

test('profile images must be supported images no larger than two megabytes', function () {
    Storage::fake('public');
    $actor = User::factory()->for(Role::factory()->superAdmin())->create();
    $role = Role::factory()->user()->create();

    $this->actingAs($actor)->postJson(route('management.users.store'), [
        'name' => 'Invalid Avatar', 'email' => 'bad-avatar@example.test', 'password' => 'password123',
        'role_id' => $role->id, 'status' => 'active', 'avatar' => UploadedFile::fake()->create('avatar.pdf', 100, 'application/pdf'),
    ])->assertUnprocessable()->assertJsonValidationErrors('avatar');
});
