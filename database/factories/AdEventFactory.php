<?php

namespace Database\Factories;

use App\Models\AdEvent;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<AdEvent>
 */
class AdEventFactory extends Factory
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
            'placement' => 'game_complete',
            'event_type' => 'impression',
            'provider' => 'testing',
            'session_id' => (string) Str::uuid(),
            'provider_event_id' => (string) Str::uuid(),
        ];
    }
}
