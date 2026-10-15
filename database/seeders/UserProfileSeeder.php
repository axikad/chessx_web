<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::query()
            ->whereDoesntHave('profile')
            ->eachById(function (User $user): void {
                $user->profile()->create([
                    'display_name' => $user->name,
                    'language' => 'en',
                    'profile_visibility' => 'public',
                ]);
            });
    }
}
