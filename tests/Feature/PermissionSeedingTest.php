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

    expect(Module::query()->count())->toBe(14)
        ->and(Permission::query()->count())->toBe(45)
        ->and($admin->can('users.delete'))->toBeTrue()
        ->and($admin->can('branding.update'))->toBeTrue()
        ->and($admin->can('player_profiles.update'))->toBeTrue()
        ->and($admin->can('player_locations.review'))->toBeTrue()
        ->and($admin->can('competitions.delete'))->toBeTrue()
        ->and($admin->can('seasons.create'))->toBeTrue()
        ->and($admin->can('ratings.update'))->toBeTrue()
        ->and($admin->can('leaderboards.generate'))->toBeTrue()
        ->and($admin->can('promotions.review'))->toBeTrue()
        ->and($user->can('dashboard.read'))->toBeTrue()
        ->and($user->can('users.read'))->toBeFalse()
        ->and($user->can('competitions.read'))->toBeFalse()
        ->and($user->can('ratings.read'))->toBeFalse();
});

test('permission seeding is idempotent', function () {
    $this->seed(DatabaseSeeder::class);
    $userRole = Role::query()->where('slug', 'user')->firstOrFail();
    app(RolePermissionService::class)->assign(
        $userRole,
        Permission::query()->where('slug', 'users.read')->firstOrFail(),
    );
    $this->seed(DatabaseSeeder::class);

    expect(Module::query()->count())->toBe(14)
        ->and(Permission::query()->count())->toBe(45)
        ->and(Role::query()->where('slug', 'admin')->firstOrFail()->permissions()->count())->toBe(45)
        ->and($userRole->fresh()->hasPermission('users.read'))->toBeTrue()
        ->and(PermissionAssignmentLog::query()->where('action', 'assigned')->count())->toBe(47);
});

test('competition foundation permissions use the intended action sets', function () {
    $this->seed(DatabaseSeeder::class);

    expect(Permission::query()->whereHas('module', fn ($query) => $query->where('slug', 'competitions'))->pluck('action')->sort()->values()->all())
        ->toBe(['create', 'delete', 'read', 'update'])
        ->and(Permission::query()->whereHas('module', fn ($query) => $query->where('slug', 'seasons'))->pluck('action')->sort()->values()->all())
        ->toBe(['create', 'delete', 'read', 'update'])
        ->and(Permission::query()->whereHas('module', fn ($query) => $query->where('slug', 'ratings'))->pluck('action')->sort()->values()->all())
        ->toBe(['read', 'update'])
        ->and(Permission::query()->whereHas('module', fn ($query) => $query->where('slug', 'leaderboards'))->pluck('action')->sort()->values()->all())
        ->toBe(['generate', 'read'])
        ->and(Permission::query()->whereHas('module', fn ($query) => $query->where('slug', 'promotions'))->pluck('action')->sort()->values()->all())
        ->toBe(['read', 'review', 'update']);
});
