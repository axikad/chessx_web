<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleAndUserSeeder::class);
        $this->call(UserProfileSeeder::class);
        $this->call(ModuleAndPermissionSeeder::class);
        $this->call(SiteSettingSeeder::class);
    }
}
