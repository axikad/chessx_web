<?php

namespace Database\Factories;

use App\Models\Game;
use App\Models\GameEvent;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GameEvent>
 */
class GameEventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'game_id' => Game::factory(),
            'event_type' => 'game_created',
            'payload_json' => ['source' => 'matchmaking'],
        ];
    }
}
