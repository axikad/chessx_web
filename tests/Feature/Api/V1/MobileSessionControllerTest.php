<?php

use App\Models\MobileSession;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

function mobileLogin(User $user, string $deviceName, string $deviceId): array
{
    return test()->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => 'password',
        'device_name' => $deviceName,
        'platform' => 'android',
        'device_id' => $deviceId,
    ])->assertOk()->json('data');
}

it('returns 401 when listing sessions without a token', function () {
    $this->getJson('/api/v1/me/sessions')
        ->assertUnauthorized()
        ->assertExactJson([
            'success' => false,
            'message' => 'Authentication is required.',
            'code' => 'unauthenticated',
        ]);
});

it('lists only active sessions belonging to the authenticated user', function () {
    $this->travelTo('2026-10-16 12:00:00');
    $user = User::factory()->create(['password' => 'password']);
    $otherUser = User::factory()->create(['password' => 'password']);
    $current = mobileLogin($user, 'Pixel 9', 'pixel-current');
    $this->travel(1)->minute();
    $second = mobileLogin($user, 'Tablet', 'tablet-active');
    MobileSession::factory()->for($user)->create([
        'device_name' => 'Revoked Phone',
        'revoked_at' => now(),
    ]);
    MobileSession::factory()->for($user)->create([
        'device_name' => 'Expired Phone',
        'refresh_token_expires_at' => now()->subMinute(),
    ]);
    MobileSession::factory()->for($otherUser)->create(['device_name' => 'Other User Phone']);

    $response = $this->withToken($current['access_token'])->getJson('/api/v1/me/sessions');

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('message', 'Mobile sessions retrieved successfully.')
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.id', $second['session_id'])
        ->assertJsonPath('data.0.is_current', false)
        ->assertJsonPath('data.1.id', $current['session_id'])
        ->assertJsonPath('data.1.is_current', true)
        ->assertJsonMissing(['device_identifier_hash'])
        ->assertJsonMissing(['refresh_token_hash']);
});

it('revokes an owned session and invalidates its access and refresh tokens', function () {
    $user = User::factory()->create(['password' => 'password']);
    $current = mobileLogin($user, 'Pixel 9', 'pixel-current');
    $other = mobileLogin($user, 'Tablet', 'tablet-to-revoke');
    $session = MobileSession::query()->findOrFail($other['session_id']);
    $accessTokenId = $session->access_token_id;

    $response = $this->withToken($current['access_token'])
        ->deleteJson('/api/v1/me/sessions/'.$session->getKey());

    $response->assertOk()->assertExactJson([
        'success' => true,
        'message' => 'Mobile session revoked successfully.',
        'data' => ['session_id' => $session->getKey()],
    ]);
    expect($session->refresh()->revoked_at)->not->toBeNull();
    $this->assertDatabaseMissing('personal_access_tokens', ['id' => $accessTokenId]);
    Auth::forgetGuards();
    $this->withToken($other['access_token'])->getJson('/api/v1/me')->assertUnauthorized();
    $this->postJson('/api/v1/auth/refresh', [
        'refresh_token' => $other['refresh_token'],
    ])->assertUnprocessable()->assertJsonValidationErrors('refresh_token');
});

it('returns 404 without revoking a session belonging to another user', function () {
    $user = User::factory()->create(['password' => 'password']);
    $otherUser = User::factory()->create(['password' => 'password']);
    $current = mobileLogin($user, 'Pixel 9', 'pixel-current');
    $other = mobileLogin($otherUser, 'Other Phone', 'other-user-device');

    $response = $this->withToken($current['access_token'])
        ->deleteJson('/api/v1/me/sessions/'.$other['session_id']);

    $response->assertNotFound()->assertExactJson([
        'success' => false,
        'message' => 'The mobile session was not found.',
        'code' => 'mobile_session_not_found',
    ]);
    expect(MobileSession::query()->findOrFail($other['session_id'])->revoked_at)->toBeNull();
    Auth::forgetGuards();
    $this->withToken($other['access_token'])->getJson('/api/v1/me')->assertOk();
});

it('logs out every mobile device belonging to the authenticated user', function () {
    $user = User::factory()->create(['password' => 'password']);
    $otherUser = User::factory()->create(['password' => 'password']);
    $current = mobileLogin($user, 'Pixel 9', 'pixel-current');
    $second = mobileLogin($user, 'Tablet', 'tablet-active');
    $other = mobileLogin($otherUser, 'Other Phone', 'other-user-device');

    $response = $this->withToken($current['access_token'])->deleteJson('/api/v1/me/sessions');

    $response->assertOk()->assertExactJson([
        'success' => true,
        'message' => 'All mobile sessions revoked successfully.',
        'data' => ['revoked_sessions' => 2],
    ]);
    expect($user->mobileSessions()->whereNull('revoked_at')->count())->toBe(0)
        ->and($otherUser->mobileSessions()->whereNull('revoked_at')->count())->toBe(1);
    Auth::forgetGuards();
    $this->withToken($current['access_token'])->getJson('/api/v1/me')->assertUnauthorized();
    Auth::forgetGuards();
    $this->withToken($second['access_token'])->getJson('/api/v1/me')->assertUnauthorized();
    $this->postJson('/api/v1/auth/refresh', [
        'refresh_token' => $second['refresh_token'],
    ])->assertUnprocessable()->assertJsonValidationErrors('refresh_token');
    Auth::forgetGuards();
    $this->withToken($other['access_token'])->getJson('/api/v1/me')->assertOk();
});
