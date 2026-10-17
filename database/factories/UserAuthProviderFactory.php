<?php

namespace Database\Factories;

use App\Enums\AuthProvider;
use App\Models\User;
use App\Models\UserAuthProvider;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserAuthProvider>
 */
class UserAuthProviderFactory extends Factory
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
            'provider' => AuthProvider::Google,
            'provider_user_id' => fake()->unique()->numerify('#####################'),
        ];
    }

    public function apple(): static
    {
        return $this->state(fn (): array => [
            'provider' => AuthProvider::Apple,
            'provider_user_id' => fake()->unique()->uuid(),
        ]);
    }
}
