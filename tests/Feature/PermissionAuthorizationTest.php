<?php

use App\Models\Permission;
use App\Models\PermissionAssignmentLog;
use App\Models\Role;
use App\Models\User;
use App\Services\RolePermissionService;

test('super admin bypasses database permission assignments', function () {
    $superAdminRole = Role::factory()->superAdmin()->create();
    $superAdmin = User::factory()->for($superAdminRole)->create();

    expect($superAdmin->can('users.delete'))->toBeTrue();
});

test('a user is authorized only for active permissions assigned to their role', function () {
    $role = Role::factory()->create();
    $user = User::factory()->for($role)->create();
    $permission = Permission::factory()->create(['slug' => 'users.read']);
    $service = app(RolePermissionService::class);

    expect($user->can('users.read'))->toBeFalse();

    $service->assign($role, $permission, $user);

    expect($user->can('users.read'))->toBeTrue()
        ->and($user->can('users.delete'))->toBeFalse();

    $permission->update(['is_active' => false]);

    expect($user->can('users.read'))->toBeFalse();
});

test('assignment changes clear cached permissions and create audit records', function () {
    $role = Role::factory()->create();
    $actor = User::factory()->create();
    $permission = Permission::factory()->create(['slug' => 'branding.update']);
    $service = app(RolePermissionService::class);

    expect($role->hasPermission('branding.update'))->toBeFalse();

    $service->assign($role, $permission, $actor);

    expect($role->hasPermission('branding.update'))->toBeTrue();

    $service->revoke($role, $permission, $actor);

    expect($role->hasPermission('branding.update'))->toBeFalse();

    expect(PermissionAssignmentLog::query()->where([
        'role_id' => $role->id,
        'permission_id' => $permission->id,
        'performed_by' => $actor->id,
    ])->pluck('action')->all())->toBe(['assigned', 'revoked']);
});

test('a permission can exist without a module', function () {
    $permission = Permission::factory()->create(['module_id' => null]);

    expect($permission->module)->toBeNull();
});
