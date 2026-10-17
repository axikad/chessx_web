<?php

use App\Actions\OnboardPlayer;
use App\Models\CompetitionTier;
use App\Models\Role;
use App\Models\User;

it('requires authentication to view player onboarding', function () {
    $this->get('/onboarding')->assertRedirect(route('login'));
});

it('renders player onboarding inside the ChessX application shell', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/onboarding')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('welcome'));
});

it('does not duplicate player records when onboarding runs again', function () {
    $role = Role::factory()->user()->create();
    $user = User::factory()->for($role)->create();
    CompetitionTier::factory()->create();
    CompetitionTier::factory()->stateLeague()->create();

    $onboardPlayer = app(OnboardPlayer::class);
    $onboardPlayer->handle($user);
    $onboardPlayer->handle($user);

    expect($user->profile()->count())->toBe(1)
        ->and($user->playerRatings()->count())->toBe(2)
        ->and($user->playerCompetitions()->count())->toBe(2);
});

it('does not create player records for administrative roles', function (string $roleState) {
    $role = Role::factory()->{$roleState}()->create();
    $user = User::factory()->for($role)->create();
    CompetitionTier::factory()->create();

    app(OnboardPlayer::class)->handle($user);

    expect($user->profile()->doesntExist())->toBeTrue()
        ->and($user->playerRatings()->doesntExist())->toBeTrue()
        ->and($user->playerCompetitions()->doesntExist())->toBeTrue();
})->with([
    'admin' => 'admin',
    'super admin' => 'superAdmin',
]);
