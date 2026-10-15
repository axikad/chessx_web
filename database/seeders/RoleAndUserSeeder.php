<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class RoleAndUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superAdminRole = Role::query()->firstOrCreate(
            ['slug' => 'super_admin'],
            ['name' => 'Super Admin'],
        );

        $adminRole = Role::query()->firstOrCreate(
            ['slug' => 'admin'],
            ['name' => 'Admin'],
        );

        $userRole = Role::query()->firstOrCreate(
            ['slug' => 'user'],
            ['name' => 'User'],
        );

        User::query()->whereNull('role_id')->update(['role_id' => $userRole->id]);

        $superAdmin = User::query()->firstOrCreate(
            ['email' => 'admin@chessx.test'],
            [
                'name' => 'ChessX Super Admin',
                'password' => 'password',
                'email_verified_at' => now(),
            ],
        );
        $superAdmin->update([
            'name' => 'ChessX Super Admin',
            'role_id' => $superAdminRole->id,
        ]);

        $admin = User::query()->firstOrCreate(
            ['email' => 'manager@chessx.test'],
            [
                'name' => 'ChessX Admin',
                'password' => 'password',
                'email_verified_at' => now(),
            ],
        );
        $admin->update(['role_id' => $adminRole->id]);

        $user = User::query()->firstOrCreate(
            ['email' => 'user@chessx.test'],
            [
                'name' => 'ChessX User',
                'password' => 'password',
                'email_verified_at' => now(),
            ],
        );
        $user->update(['role_id' => $userRole->id]);
    }
}
