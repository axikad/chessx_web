<?php

namespace Database\Factories;

use App\Models\IdempotencyKey;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<IdempotencyKey>
 */
class IdempotencyKeyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => null,
            'scope' => 'testing:'.Str::uuid(),
            'key' => (string) Str::uuid(),
            'request_hash' => hash('sha256', fake()->uuid()),
            'response_status' => null,
            'response_json' => null,
            'expires_at' => now()->addDay(),
        ];
    }
}
