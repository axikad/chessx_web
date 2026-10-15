<?php

use App\Models\Module;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Services\RolePermissionService;

test('super admin can create update list and delete unassigned permissions', function () {
    $actor = User::factory()->for(Role::factory()->superAdmin())->create();
    $module = Module::factory()->create();

    $create = $this->actingAs($actor)->postJson(route('management.permissions.store'), [
        'module_id' => $module->id, 'name' => 'Export Users', 'slug' => 'users.export',
        'action' => 'export', 'description' => 'Export the user list', 'is_active' => true,
    ])->assertCreated();
    $permission = Permission::query()->findOrFail($create->json('data.id'));

    $this->getJson(route('management.permissions.index'))->assertOk()->assertJsonFragment(['slug' => 'users.export']);
    $this->putJson(route('management.permissions.update', $permission), [
        'module_id' => $module->id, 'name' => 'Export Members', 'slug' => 'users.export',
        'action' => 'export', 'description' => null, 'is_active' => false,
    ])->assertOk()->assertJsonPath('data.is_active', false);
    $this->deleteJson(route('management.permissions.destroy', $permission))->assertOk();
    $this->assertDatabaseMissing('permissions', ['id' => $permission->id]);
});

test('assigned permissions cannot be deleted', function () {
    $actor = User::factory()->for(Role::factory()->superAdmin())->create();
    $permission = Permission::factory()->create();
    Role::factory()->create()->permissions()->attach($permission);
    $this->actingAs($actor)->deleteJson(route('management.permissions.destroy', $permission))->assertUnprocessable();
});

test('read-only permission access does not allow permission changes', function () {
    $role = Role::factory()->create();
    $actor = User::factory()->for($role)->create();
    $target = Permission::factory()->create();
    $read = Permission::factory()->create(['slug' => 'permissions.read']);
    app(RolePermissionService::class)->assign($role, $read, $actor);

    $this->actingAs($actor)->postJson(route('management.permissions.store'), [])->assertForbidden();
    $this->putJson(route('management.permissions.update', $target), [])->assertForbidden();
    $this->deleteJson(route('management.permissions.destroy', $target))->assertForbidden();
});
