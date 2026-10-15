<?php

namespace Database\Factories;

use App\Models\Permission;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Permission>
 */
class PermissionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $resource = fake()->unique()->word();

        return ['name' => "Read {$resource}", 'slug' => "{$resource}.read", 'action' => 'read', 'is_active' => true];
    }
}
