<?php

use App\Models\Role;
use App\Models\User;
use App\Models\UserLocation;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

it('directs a new player to location setup and then profile setup', function () {
    $role = Role::factory()->user()->create();
    $user = User::factory()->for($role)->create([
        'status' => 'active',
        'onboarding_completed_at' => null,
    ]);
    Sanctum::actingAs($user, ['mobile']);

    $this->getJson('/api/v1/me')
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.onboarding.required', true)
        ->assertJsonPath('data.onboarding.next_step', 'location')
        ->assertJsonPath('data.onboarding.steps.location_completed', false)
        ->assertJsonPath('data.onboarding.steps.profile_completed', false);

    UserLocation::factory()->for($user)->create();
    $user->unsetRelation('currentLocation');

    $this->getJson('/api/v1/me')
        ->assertOk()
        ->assertJsonPath('data.onboarding.next_step', 'profile')
        ->assertJsonPath('data.onboarding.steps.location_completed', true);
});

it('returns a conflict when profile completion is attempted before location confirmation', function () {
    $role = Role::factory()->user()->create();
    $user = User::factory()->for($role)->create([
        'status' => 'active',
        'onboarding_completed_at' => null,
    ]);
    Sanctum::actingAs($user, ['mobile']);

    $this->patchJson('/api/v1/me/profile', [
        'username' => 'first_player',
    ])->assertConflict()->assertExactJson([
        'success' => false,
        'message' => 'Confirm your home city before completing your player profile.',
        'code' => 'location_required',
    ]);
});

it('completes the player profile with a unique username date of birth and avatar', function () {
    Storage::fake('public');
    $role = Role::factory()->user()->create();
    $user = User::factory()->for($role)->create([
        'status' => 'active',
        'onboarding_completed_at' => null,
        'username_changed_at' => null,
    ]);
    UserLocation::factory()->for($user)->create();
    Sanctum::actingAs($user, ['mobile']);

    $response = $this->post('/api/v1/me/profile', [
        'username' => 'first_player',
        'date_of_birth' => '2000-01-15',
        'avatar' => UploadedFile::fake()->image('avatar.png', 300, 300),
    ], ['Accept' => 'application/json']);

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.username', 'first_player')
        ->assertJsonPath('data.profile.date_of_birth', '2000-01-15')
        ->assertJsonPath('data.onboarding.required', false)
        ->assertJsonPath('data.onboarding.next_step', 'complete');
    $user->refresh();
    expect($user->onboarding_completed_at)->not->toBeNull()
        ->and($user->username_changed_at)->not->toBeNull()
        ->and($user->profile?->date_of_birth?->toDateString())->toBe('2000-01-15');
    Storage::disk('public')->assertExists($user->avatar_path);
});

it('checks normalized username availability without treating the current username as taken', function () {
    $role = Role::factory()->user()->create();
    User::factory()->for($role)->create(['username' => 'taken_player']);
    $user = User::factory()->for($role)->create([
        'username' => 'current_player',
        'status' => 'active',
    ]);
    Sanctum::actingAs($user, ['mobile']);

    $this->getJson('/api/v1/usernames/check?username=TAKEN_PLAYER')
        ->assertOk()
        ->assertJsonPath('data.username', 'taken_player')
        ->assertJsonPath('data.available', false);

    $this->getJson('/api/v1/usernames/check?username=current_player')
        ->assertOk()
        ->assertJsonPath('data.available', true);
});

it('returns 422 for duplicate usernames and changes attempted inside 30 days', function () {
    $role = Role::factory()->user()->create();
    User::factory()->for($role)->create(['username' => 'taken_player']);
    $user = User::factory()->for($role)->create([
        'username' => 'current_player',
        'status' => 'active',
        'onboarding_completed_at' => now()->subDay(),
        'username_changed_at' => now()->subDays(29),
    ]);
    Sanctum::actingAs($user, ['mobile']);

    $this->patchJson('/api/v1/me/profile', [
        'username' => 'taken_player',
    ])->assertUnprocessable()->assertJsonValidationErrors('username');

    $this->patchJson('/api/v1/me/profile', [
        'username' => 'another_player',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('username')
        ->assertJsonPath('code', 'validation_failed');
});

it('allows a username change after the 30 day cooldown', function () {
    $role = Role::factory()->user()->create();
    $user = User::factory()->for($role)->create([
        'username' => 'current_player',
        'status' => 'active',
        'onboarding_completed_at' => now()->subDays(31),
        'username_changed_at' => now()->subDays(30)->subSecond(),
    ]);
    Sanctum::actingAs($user, ['mobile']);

    $this->patchJson('/api/v1/me/profile', [
        'username' => 'updated_player',
    ])->assertOk()->assertJsonPath('data.username', 'updated_player');

    expect($user->refresh()->username)->toBe('updated_player');
});
