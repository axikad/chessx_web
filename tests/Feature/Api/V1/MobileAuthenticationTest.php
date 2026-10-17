<?php

use App\Models\MobileSession;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

it('issues short-lived access and hashed refresh tokens to an active mobile user', function () {
    $this->travelTo('2026-10-16 12:00:00');
    $user = User::factory()->create([
        'email' => 'mobile@example.test',
        'password' => 'password',
        'status' => 'active',
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'MOBILE@example.test',
        'password' => 'password',
        'device_name' => 'Pixel 9',
        'platform' => 'ANDROID',
        'device_id' => 'pixel-device-123',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.token_type', 'Bearer')
        ->assertJsonPath('data.expires_in', 900)
        ->assertJsonPath('data.user.id', $user->uuid)
        ->assertJsonPath('data.user.email', 'mobile@example.test');

    $accessToken = $response->json('data.access_token');
    $refreshToken = $response->json('data.refresh_token');
    $session = MobileSession::query()->sole();

    expect($session->platform)->toBe('android')
        ->and($session->device_name)->toBe('Pixel 9')
        ->and($session->device_identifier_hash)->toBe(hash('sha256', 'pixel-device-123'))
        ->and($session->refresh_token_hash)->toBe(hash('sha256', $refreshToken))
        ->and($session->refresh_token_hash)->not->toBe($refreshToken)
        ->and($session->refresh_token_expires_at->toIso8601String())->toBe('2026-11-15T12:00:00+00:00');

    $this->assertDatabaseHas('personal_access_tokens', [
        'id' => $session->access_token_id,
        'name' => 'Pixel 9',
        'expires_at' => '2026-10-16 12:15:00',
    ]);
    $this->withToken($accessToken)->getJson('/api/v1/me')->assertOk();
    $this->travel(16)->minutes();
    Auth::forgetGuards();
    $this->withToken($accessToken)->getJson('/api/v1/me')->assertUnauthorized();
});

it('returns the same safe error for invalid credentials and inactive accounts', function (array $attributes) {
    $user = User::factory()->create($attributes);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
        'device_name' => 'Test Phone',
        'platform' => 'android',
        'device_id' => 'rejected-device',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['email'])
        ->assertJsonPath('errors.email.0', 'These credentials do not match our records.');
    expect(MobileSession::query()->count())->toBe(0);
    $this->assertDatabaseCount('personal_access_tokens', 0);
})->with([
    'wrong password' => [['status' => 'active']],
    'inactive account' => [['status' => 'inactive']],
    'suspended account' => [['status' => 'suspended']],
]);

it('validates the mobile login device contract', function () {
    $this->postJson('/api/v1/auth/login', [
        'email' => 'not-an-email',
        'platform' => 'web',
    ])->assertUnprocessable()->assertJsonValidationErrors([
        'email',
        'password',
        'device_name',
        'platform',
        'device_id',
    ]);
});

it('rotates access and refresh tokens atomically', function () {
    $user = User::factory()->create([
        'email' => 'rotation@example.test',
        'password' => 'password',
        'status' => 'active',
    ]);
    $login = $this->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => 'password',
        'device_name' => 'iPhone 17',
        'platform' => 'ios',
        'device_id' => 'ios-device-456',
    ])->assertOk();
    $oldAccessToken = $login->json('data.access_token');
    $oldRefreshToken = $login->json('data.refresh_token');
    $sessionId = $login->json('data.session_id');

    $refresh = $this->postJson('/api/v1/auth/refresh', [
        'refresh_token' => $oldRefreshToken,
    ])->assertOk()->assertJsonPath('data.session_id', $sessionId);

    $newAccessToken = $refresh->json('data.access_token');
    $newRefreshToken = $refresh->json('data.refresh_token');

    expect($newAccessToken)->not->toBe($oldAccessToken)
        ->and($newRefreshToken)->not->toBe($oldRefreshToken)
        ->and(MobileSession::query()->sole()->refresh_token_hash)->toBe(hash('sha256', $newRefreshToken));

    $this->postJson('/api/v1/auth/refresh', [
        'refresh_token' => $oldRefreshToken,
    ])->assertUnprocessable()->assertJsonValidationErrors('refresh_token');
    $this->withToken($oldAccessToken)->getJson('/api/v1/me')->assertUnauthorized();
    $this->withToken($newAccessToken)->getJson('/api/v1/me')->assertOk();
});

it('rejects expired refresh tokens without exposing session details', function () {
    $plainRefreshToken = 'expired-refresh-token';
    MobileSession::factory()->create([
        'refresh_token_hash' => hash('sha256', $plainRefreshToken),
        'refresh_token_expires_at' => now()->subSecond(),
    ]);

    $this->postJson('/api/v1/auth/refresh', [
        'refresh_token' => $plainRefreshToken,
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('refresh_token')
        ->assertJsonPath('errors.refresh_token.0', 'The refresh token is invalid or has expired.');
});

it('does not refresh tokens after an account becomes inactive', function () {
    $user = User::factory()->create([
        'email' => 'inactive-after-login@example.test',
        'password' => 'password',
        'status' => 'active',
    ]);
    $login = $this->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => 'password',
        'device_name' => 'Pixel 9',
        'platform' => 'android',
        'device_id' => 'inactive-device',
    ])->assertOk();

    $user->update(['status' => 'inactive']);

    $this->postJson('/api/v1/auth/refresh', [
        'refresh_token' => $login->json('data.refresh_token'),
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('refresh_token')
        ->assertJsonPath('errors.refresh_token.0', 'The refresh token is invalid or has expired.');
});

it('rate limits repeated mobile login attempts', function () {
    $payload = [
        'email' => 'rate-limit-'.fake()->uuid().'@example.test',
        'password' => 'wrong-password',
        'device_name' => 'Test Phone',
        'platform' => 'android',
        'device_id' => 'rate-limited-device',
    ];

    foreach (range(1, 6) as $attempt) {
        $this->postJson('/api/v1/auth/login', $payload)->assertUnprocessable();
    }

    $this->postJson('/api/v1/auth/login', $payload)
        ->assertTooManyRequests()
        ->assertJsonPath('success', false)
        ->assertJsonPath('code', 'too_many_requests');
});
