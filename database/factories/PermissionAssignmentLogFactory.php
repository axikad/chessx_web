<?php

namespace Database\Factories;

use App\Models\Permission;
use App\Models\PermissionAssignmentLog;
use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PermissionAssignmentLog>
 */
class PermissionAssignmentLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'role_id' => Role::factory(),
            'permission_id' => Permission::factory(),
            'role_name' => fake()->jobTitle(),
            'permission_slug' => fake()->slug(2),
            'action' => fake()->randomElement(['assigned', 'revoked']),
        ];
    }
}
