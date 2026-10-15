<?php

namespace Database\Factories;

use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Role>
 */
class RoleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->jobTitle(),
            'slug' => fake()->unique()->slug(2),
        ];
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes): array => [
            'name' => 'Admin',
            'slug' => 'admin',
        ]);
    }

    public function superAdmin(): static
    {
        return $this->state(fn (array $attributes): array => [
            'name' => 'Super Admin',
            'slug' => 'super_admin',
        ]);
    }

    public function user(): static
    {
        return $this->state(fn (array $attributes): array => [
            'name' => 'User',
            'slug' => 'user',
        ]);
    }
}
