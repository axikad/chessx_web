<?php

use App\Models\Module;
use App\Models\Permission;
use App\Models\PermissionAssignmentLog;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;

test('permission seed data creates modules permissions and role assignments', function () {
    $this->seed(DatabaseSeeder::class);

    $admin = User::query()->where('email', 'manager@chessx.test')->firstOrFail();
    $user = User::query()->where('email', 'user@chessx.test')->firstOrFail();

    expect(Module::query()->count())->toBe(6)
        ->and(Permission::query()->count())->toBe(20)
        ->and($admin->can('users.delete'))->toBeTrue()
        ->and($admin->can('branding.update'))->toBeTrue()
        ->and($user->can('dashboard.read'))->toBeTrue()
        ->and($user->can('users.read'))->toBeFalse();
});

test('permission seeding is idempotent', function () {
    $this->seed(DatabaseSeeder::class);
    $this->seed(DatabaseSeeder::class);

    expect(Module::query()->count())->toBe(6)
        ->and(Permission::query()->count())->toBe(20)
        ->and(Role::query()->where('slug', 'admin')->firstOrFail()->permissions()->count())->toBe(20)
        ->and(PermissionAssignmentLog::query()->where('action', 'assigned')->count())->toBe(21);
});
