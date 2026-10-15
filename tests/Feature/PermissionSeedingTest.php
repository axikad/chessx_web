<?php

use App\Models\Module;
use App\Models\Permission;
use App\Models\PermissionAssignmentLog;
use App\Models\Role;
use App\Models\User;
use App\Services\RolePermissionService;
use Database\Seeders\DatabaseSeeder;

test('permission seed data creates modules permissions and role assignments', function () {
    $this->seed(DatabaseSeeder::class);

    $admin = User::query()->where('email', 'manager@chessx.test')->firstOrFail();
    $user = User::query()->where('email', 'user@chessx.test')->firstOrFail();

    expect(Module::query()->count())->toBe(7)
        ->and(Permission::query()->count())->toBe(24)
        ->and($admin->can('users.delete'))->toBeTrue()
        ->and($admin->can('branding.update'))->toBeTrue()
        ->and($admin->can('player_profiles.update'))->toBeTrue()
        ->and($user->can('dashboard.read'))->toBeTrue()
        ->and($user->can('users.read'))->toBeFalse();
});

test('permission seeding is idempotent', function () {
    $this->seed(DatabaseSeeder::class);
    $userRole = Role::query()->where('slug', 'user')->firstOrFail();
    app(RolePermissionService::class)->assign(
        $userRole,
        Permission::query()->where('slug', 'users.read')->firstOrFail(),
    );
    $this->seed(DatabaseSeeder::class);

    expect(Module::query()->count())->toBe(7)
        ->and(Permission::query()->count())->toBe(24)
        ->and(Role::query()->where('slug', 'admin')->firstOrFail()->permissions()->count())->toBe(24)
        ->and($userRole->fresh()->hasPermission('users.read'))->toBeTrue()
        ->and(PermissionAssignmentLog::query()->where('action', 'assigned')->count())->toBe(26);
});
