<?php

use App\Models\User;

test('settings page uses the ChessX application shell', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get('/settings');

    $response
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('welcome'));
});

test('legacy starter kit settings pages redirect to the ChessX settings page', function (string $legacyUrl) {
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->get($legacyUrl)
        ->assertRedirect('/settings');
})->with([
    '/settings/profile',
    '/settings/password',
    '/settings/appearance',
]);

test('unknown settings URLs stay inside the ChessX application shell', function () {
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->get('/settings/future-page')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('welcome'));
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'name' => 'Test User',
            'username' => 'test_player',
            'email' => 'test@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/settings');

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->username)->toBe('test_player');
    expect($user->username_changed_at)->not->toBeNull();
    expect($user->email)->toBe('test@example.com');
    expect($user->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'name' => 'Test User',
            'username' => $user->username,
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/settings');

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('player profile information is created and updated with the account', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patchJson('/settings/profile', [
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'display_name' => 'Knight Rider',
            'language' => 'hi',
            'timezone' => 'Asia/Kolkata',
            'date_of_birth' => '2000-05-10',
            'profile_visibility' => 'private',
        ])
        ->assertOk()
        ->assertJsonPath('data.profile.display_name', 'Knight Rider')
        ->assertJsonPath('data.profile.profile_visibility', 'private');

    $this->assertDatabaseHas('user_profiles', [
        'user_id' => $user->id,
        'display_name' => 'Knight Rider',
        'language' => 'hi',
        'timezone' => 'Asia/Kolkata',
        'date_of_birth' => '2000-05-10 00:00:00',
        'profile_visibility' => 'private',
    ]);
});

test('players younger than 13 cannot save a date of birth', function () {
    $this->travelTo('2026-10-15');
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patchJson('/settings/profile', [
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'date_of_birth' => '2013-10-16',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('date_of_birth');

    $this->assertDatabaseMissing('user_profiles', ['user_id' => $user->id]);
});

test('username cannot be changed again before 30 days', function () {
    $user = User::factory()->create([
        'username' => 'first_username',
        'username_changed_at' => now()->subDays(29),
    ]);

    $response = $this
        ->actingAs($user)
        ->from('/settings/profile')
        ->patch('/settings/profile', [
            'name' => $user->name,
            'username' => 'second_username',
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasErrors(['username' => 'Your username can only be changed once every 30 days. You can change it again on '.now()->addDay()->format('F j, Y').'.'])
        ->assertRedirect('/settings/profile');

    expect($user->refresh()->username)->toBe('first_username');
});

test('username can be changed after 30 days', function () {
    $user = User::factory()->create([
        'username' => 'first_username',
        'username_changed_at' => now()->subDays(30)->subSecond(),
    ]);

    $this
        ->actingAs($user)
        ->patch('/settings/profile', [
            'name' => $user->name,
            'username' => 'second_username',
            'email' => $user->email,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect('/settings');

    expect($user->refresh()->username)->toBe('second_username')
        ->and($user->username_changed_at)->not->toBeNull();
});

test('username must be unique and use the supported format', function () {
    $existingUser = User::factory()->create(['username' => 'existing_player']);
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->from('/settings/profile')
        ->patch('/settings/profile', [
            'name' => $user->name,
            'username' => $existingUser->username,
            'email' => $user->email,
        ])
        ->assertSessionHasErrors('username')
        ->assertRedirect('/settings/profile');

    $this
        ->actingAs($user)
        ->from('/settings/profile')
        ->patch('/settings/profile', [
            'name' => $user->name,
            'username' => 'invalid username!',
            'email' => $user->email,
        ])
        ->assertSessionHasErrors('username')
        ->assertRedirect('/settings/profile');
});

test('user can delete their account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete('/settings/profile', [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/');

    $this->assertGuest();
    $this->assertSoftDeleted($user);
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from('/settings/profile')
        ->delete('/settings/profile', [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect('/settings/profile');

    expect($user->fresh())->not->toBeNull();
});
