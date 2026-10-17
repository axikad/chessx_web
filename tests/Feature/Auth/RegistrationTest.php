<?php

use App\Enums\PlayerCompetitionStatus;
use App\Models\CompetitionTier;
use App\Models\Role;
use App\Models\User;

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register', function () {
    Role::factory()->user()->create();
    $cityTier = CompetitionTier::factory()->create();
    $stateTier = CompetitionTier::factory()->stateLeague()->create();
    CompetitionTier::factory()->nationalLeague()->create(['is_active' => false]);

    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('onboarding', absolute: false));

    $user = User::query()->where('email', 'test@example.com')->firstOrFail();

    expect($user->role?->slug)->toBe('user')
        ->and($user->profile?->display_name)->toBe('Test User')
        ->and($user->playerRatings()->count())->toBe(2)
        ->and($user->playerCompetitions()->count())->toBe(2)
        ->and($user->playerRatings()->pluck('tier_id')->sort()->values()->all())
        ->toBe(collect([$cityTier->id, $stateTier->id])->sort()->values()->all())
        ->and($user->playerRatings()->pluck('rating')->unique()->all())->toBe([1200])
        ->and($user->playerCompetitions()->pluck('status')->unique()->all())
        ->toBe([PlayerCompetitionStatus::Locked]);
});
