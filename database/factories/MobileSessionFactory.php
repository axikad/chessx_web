<?php

namespace Database\Factories;

use App\Models\MobileSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<MobileSession>
 */
class MobileSessionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'device_name' => fake()->randomElement(['Pixel 9', 'iPhone 17']),
            'platform' => fake()->randomElement(['android', 'ios']),
            'device_identifier_hash' => hash('sha256', Str::uuid()->toString()),
            'refresh_token_hash' => hash('sha256', Str::random(64)),
            'refresh_token_expires_at' => now()->addDays(30),
            'last_ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
        ];
    }
}
