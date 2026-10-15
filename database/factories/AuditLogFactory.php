<?php

namespace Database\Factories;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AuditLog>
 */
class AuditLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'actor_user_id' => User::factory(),
            'action' => 'location.change_reviewed',
            'entity_type' => 'location_change_requests',
            'entity_id' => fake()->randomNumber(),
            'metadata' => [],
            'ip_address' => fake()->ipv4(),
        ];
    }
}
