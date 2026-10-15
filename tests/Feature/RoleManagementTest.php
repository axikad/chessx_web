<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Services\RolePermissionService;

test('super admin can manage roles and synchronize permissions', function () {
    $actor = User::factory()->for(Role::factory()->superAdmin())->create();
    $permission = Permission::factory()->create();

    $create = $this->actingAs($actor)->postJson(route('management.roles.store'), [
        'name' => 'Moderator', 'slug' => 'moderator', 'description' => 'Moderates content',
    ])->assertCreated();
    $role = Role::query()->findOrFail($create->json('data.id'));

    $this->putJson(route('management.roles.update', $role), ['name' => 'Lead Moderator', 'slug' => 'lead_moderator', 'description' => 'Leads moderation'])->assertOk();
    $this->putJson(route('management.roles.permissions.update', $role), ['permission_ids' => [$permission->id]])->assertOk();
    $this->assertDatabaseHas('permission_role', ['role_id' => $role->id, 'permission_id' => $permission->id]);
    $this->assertDatabaseHas('permission_assignment_logs', ['role_id' => $role->id, 'performed_by' => $actor->id, 'action' => 'assigned']);

    $this->deleteJson(route('management.roles.destroy', $role))->assertOk();
    $this->assertDatabaseMissing('roles', ['id' => $role->id]);
});

test('roles assigned to users cannot be deleted', function () {
    $actor = User::factory()->for(Role::factory()->superAdmin())->create();
    $role = Role::factory()->create();
    User::factory()->for($role)->create();
    $this->actingAs($actor)->deleteJson(route('management.roles.destroy', $role))->assertUnprocessable();
});

test('read-only role permission does not allow role changes or permission assignment', function () {
    $role = Role::factory()->create();
    $actor = User::factory()->for($role)->create();
    $target = Role::factory()->create();
    $read = Permission::factory()->create(['slug' => 'roles.read']);
    app(RolePermissionService::class)->assign($role, $read, $actor);

    $this->actingAs($actor)->postJson(route('management.roles.store'), [])->assertForbidden();
    $this->putJson(route('management.roles.update', $target), [])->assertForbidden();
    $this->putJson(route('management.roles.permissions.update', $target), ['permission_ids' => []])->assertForbidden();
    $this->deleteJson(route('management.roles.destroy', $target))->assertForbidden();
});
