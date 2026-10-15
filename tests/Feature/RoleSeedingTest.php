<?php

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleAndUserSeeder;
use Illuminate\Support\Facades\Hash;

test('roles and their default users are seeded', function () {
    $this->seed(RoleAndUserSeeder::class);

    $superAdmin = User::query()->where('email', 'admin@chessx.test')->firstOrFail();
    $admin = User::query()->where('email', 'manager@chessx.test')->firstOrFail();
    $user = User::query()->where('email', 'user@chessx.test')->firstOrFail();

    expect($superAdmin->role?->slug)->toBe('super_admin')
        ->and($admin->role?->slug)->toBe('admin')
        ->and($user->role?->slug)->toBe('user')
        ->and(Hash::check('password', $superAdmin->password))->toBeTrue()
        ->and(Hash::check('password', $admin->password))->toBeTrue()
        ->and(Hash::check('password', $user->password))->toBeTrue();
});

test('seeding roles and default users is idempotent', function () {
    $this->seed(RoleAndUserSeeder::class);
    $this->seed(RoleAndUserSeeder::class);

    expect(Role::query()->count())->toBe(3)
        ->and(User::query()->count())->toBe(3);
});

test('existing users without a role receive the user role', function () {
    $existingUser = User::factory()->create(['role_id' => null]);

    $this->seed(RoleAndUserSeeder::class);

    expect($existingUser->fresh()->role?->slug)->toBe('user');
});
