<?php

use App\Exceptions\GoogleTokenVerificationException;
use App\Models\MobileSession;
use App\Models\Role;
use App\Models\User;
use App\Models\UserAuthProvider;
use App\Services\Auth\VerifiesGoogleIdToken;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;
use Mockery\MockInterface;

use function Pest\Laravel\mock;

/**
 * @param  array<string, mixed>  $overrides
 * @return array{sub: string, email: ?string, email_verified: bool, name: ?string, picture: ?string}
 */
function mobileGoogleIdentity(array $overrides = []): array
{
    return array_replace([
        'sub' => 'mobile-google-subject-123',
        'email' => 'mobile-google@example.test',
        'email_verified' => true,
        'name' => 'Mobile Google Player',
        'picture' => null,
    ], $overrides);
}

it('issues mobile tokens for a linked active Google account', function () {
    $this->travelTo('2026-10-16 12:00:00');
    $user = User::factory()->create([
        'email' => 'mobile-google@example.test',
        'status' => 'active',
        'last_login_at' => null,
    ]);
    UserAuthProvider::factory()->for($user)->create([
        'provider_user_id' => 'mobile-google-subject-123',
    ]);
    mock(VerifiesGoogleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')
            ->once()
            ->with('signed-google-id-token')
            ->andReturn(mobileGoogleIdentity());
    });

    $response = $this->postJson('/api/v1/auth/google', [
        'id_token' => 'signed-google-id-token',
        'device_name' => 'iPhone 17',
        'platform' => 'IOS',
        'device_id' => 'google-ios-device',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.token_type', 'Bearer')
        ->assertJsonPath('data.expires_in', 900)
        ->assertJsonPath('data.is_new_user', false)
        ->assertJsonPath('data.user.id', $user->uuid)
        ->assertJsonPath('data.user.email', 'mobile-google@example.test');
    $this->assertGuest();
    $this->assertDatabaseHas('mobile_sessions', [
        'user_id' => $user->getKey(),
        'device_name' => 'iPhone 17',
        'platform' => 'ios',
        'device_identifier_hash' => hash('sha256', 'google-ios-device'),
    ]);
    expect($user->refresh()->last_login_at?->toDateTimeString())->toBe('2026-10-16 12:00:00');
    $this->withToken($response->json('data.access_token'))->getJson('/api/v1/me')->assertOk();
});

it('creates and onboards a new player before issuing Google mobile tokens', function () {
    $role = Role::factory()->user()->create();
    Event::fake([Registered::class]);
    mock(VerifiesGoogleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')->once()->andReturn(mobileGoogleIdentity());
    });

    $response = $this->postJson('/api/v1/auth/google', [
        'id_token' => 'signed-google-id-token',
        'device_name' => 'Pixel 9',
        'platform' => 'android',
        'device_id' => 'google-android-device',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.user.email', 'mobile-google@example.test')
        ->assertJsonPath('data.is_new_user', true)
        ->assertJsonPath('data.user.onboarding.next_step', 'location');
    $user = User::query()->where('email', 'mobile-google@example.test')->firstOrFail();
    expect($user->role_id)->toBe($role->getKey())
        ->and($user->email_verified_at)->not->toBeNull()
        ->and($user->profile?->display_name)->toBe('Mobile Google Player');
    $this->assertDatabaseHas('user_auth_providers', [
        'user_id' => $user->getKey(),
        'provider' => 'google',
        'provider_user_id' => 'mobile-google-subject-123',
    ]);
    $this->assertDatabaseHas('mobile_sessions', [
        'user_id' => $user->getKey(),
        'platform' => 'android',
    ]);
    Event::assertDispatched(Registered::class, fn (Registered $event): bool => $event->user->is($user));
    $this->assertGuest();
});

it('returns 401 without creating a session when the Google token is invalid', function () {
    mock(VerifiesGoogleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')
            ->once()
            ->andThrow(GoogleTokenVerificationException::invalid());
    });

    $this->postJson('/api/v1/auth/google', [
        'id_token' => 'invalid-google-token',
        'device_name' => 'Pixel 9',
        'platform' => 'android',
        'device_id' => 'invalid-google-device',
    ])->assertUnauthorized()->assertExactJson([
        'success' => false,
        'message' => 'The Google identity token is invalid.',
        'code' => 'google_token_invalid',
    ]);
    expect(MobileSession::query()->count())->toBe(0)
        ->and(UserAuthProvider::query()->count())->toBe(0);
});

it('returns 422 without issuing tokens for an inactive Google account', function () {
    $user = User::factory()->create([
        'email' => 'mobile-google@example.test',
        'status' => 'suspended',
    ]);
    UserAuthProvider::factory()->for($user)->create([
        'provider_user_id' => 'mobile-google-subject-123',
    ]);
    mock(VerifiesGoogleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')->once()->andReturn(mobileGoogleIdentity());
    });

    $this->postJson('/api/v1/auth/google', [
        'id_token' => 'signed-google-id-token',
        'device_name' => 'Pixel 9',
        'platform' => 'android',
        'device_id' => 'inactive-google-device',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('google')
        ->assertJsonPath('errors.google.0', 'This Chess Mission account is not active.');
    expect(MobileSession::query()->count())->toBe(0);
    $this->assertDatabaseCount('personal_access_tokens', 0);
});

it('returns 422 when the Google mobile device contract is invalid', function () {
    $this->postJson('/api/v1/auth/google', [
        'platform' => 'web',
    ])->assertUnprocessable()->assertJsonValidationErrors([
        'id_token',
        'device_name',
        'platform',
        'device_id',
    ]);
});

it('returns 429 after six Google mobile login attempts in one minute', function () {
    mock(VerifiesGoogleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')
            ->times(6)
            ->andThrow(GoogleTokenVerificationException::invalid());
    });
    $payload = [
        'id_token' => 'invalid-google-token',
        'device_name' => 'Pixel 9',
        'platform' => 'android',
        'device_id' => 'rate-limited-google-device',
    ];

    foreach (range(1, 6) as $attempt) {
        $this->postJson('/api/v1/auth/google', $payload)->assertUnauthorized();
    }

    $this->postJson('/api/v1/auth/google', $payload)->assertTooManyRequests();
});
