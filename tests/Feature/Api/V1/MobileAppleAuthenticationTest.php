<?php

use App\Exceptions\AppleTokenVerificationException;
use App\Models\MobileSession;
use App\Models\Role;
use App\Models\User;
use App\Models\UserAuthProvider;
use App\Services\Auth\VerifiesAppleIdToken;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;
use Mockery\MockInterface;

use function Pest\Laravel\mock;

/**
 * @param  array<string, mixed>  $overrides
 * @return array{sub: string, email: ?string, email_verified: bool, is_private_email: bool}
 */
function mobileAppleIdentity(array $overrides = []): array
{
    return array_replace([
        'sub' => 'mobile-apple-subject-123',
        'email' => 'apple-player@privaterelay.appleid.com',
        'email_verified' => true,
        'is_private_email' => true,
    ], $overrides);
}

function mobileApplePayload(array $overrides = []): array
{
    return array_replace([
        'id_token' => 'signed-apple-id-token',
        'nonce' => 'apple-mobile-raw-nonce-1234567890',
        'first_name' => 'Apple',
        'last_name' => 'Player',
        'device_name' => 'iPhone 17',
        'platform' => 'ios',
        'device_id' => 'apple-ios-device',
    ], $overrides);
}

beforeEach(function () {
    config()->set('services.apple.enabled', true);
    config()->set('services.apple.native_client_ids', ['com.chessx.mobile']);
});

it('issues a short-lived Apple sign-in nonce', function () {
    $response = $this->postJson('/api/v1/auth/apple/nonce');

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('message', 'Apple sign-in nonce created successfully.')
        ->assertJsonPath('data.expires_in', 600);
    expect($response->json('data.nonce'))->toBeString()->toHaveLength(43);
});

it('returns 503 for Apple mobile authentication when backend configuration is disabled', function (string $endpoint) {
    config()->set('services.apple.enabled', false);

    $this->postJson($endpoint, mobileApplePayload())
        ->assertServiceUnavailable()
        ->assertExactJson([
            'success' => false,
            'message' => 'Apple authentication is not configured.',
            'code' => 'apple_auth_not_configured',
        ]);
})->with([
    'nonce endpoint' => ['/api/v1/auth/apple/nonce'],
    'login endpoint' => ['/api/v1/auth/apple'],
]);

it('issues mobile tokens for a linked active Apple account without requiring email again', function () {
    $user = User::factory()->create(['status' => 'active']);
    UserAuthProvider::factory()->for($user)->apple()->create([
        'provider_user_id' => 'mobile-apple-subject-123',
    ]);
    mock(VerifiesAppleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')->once()->andReturn(mobileAppleIdentity([
            'email' => null,
            'email_verified' => false,
        ]));
    });

    $response = $this->postJson('/api/v1/auth/apple', mobileApplePayload());

    $response->assertOk()
        ->assertJsonPath('data.is_new_user', false)
        ->assertJsonPath('data.user.id', $user->uuid);
    $this->assertDatabaseHas('mobile_sessions', [
        'user_id' => $user->getKey(),
        'platform' => 'ios',
    ]);
});

it('links an existing active account using an Apple-verified matching email', function () {
    $user = User::factory()->unverified()->create([
        'email' => 'apple-player@privaterelay.appleid.com',
        'status' => 'active',
    ]);
    mock(VerifiesAppleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')->once()->andReturn(mobileAppleIdentity());
    });

    $response = $this->postJson('/api/v1/auth/apple', mobileApplePayload());

    $response->assertOk()->assertJsonPath('data.is_new_user', false);
    $this->assertDatabaseHas('user_auth_providers', [
        'user_id' => $user->getKey(),
        'provider' => 'apple',
        'provider_user_id' => 'mobile-apple-subject-123',
    ]);
    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

it('returns 422 when Apple has not verified the email for an unlinked identity', function () {
    mock(VerifiesAppleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')->once()->andReturn(mobileAppleIdentity([
            'email_verified' => false,
        ]));
    });

    $this->postJson('/api/v1/auth/apple', mobileApplePayload())
        ->assertUnprocessable()
        ->assertJsonPath('errors.apple.0', 'Apple must verify your email before ChessX can link this account.');
    $this->assertDatabaseCount('users', 0);
});

it('returns 422 when the matching ChessX account is linked to another Apple subject', function () {
    $user = User::factory()->create([
        'email' => 'apple-player@privaterelay.appleid.com',
        'status' => 'active',
    ]);
    UserAuthProvider::factory()->for($user)->apple()->create([
        'provider_user_id' => 'another-apple-subject',
    ]);
    mock(VerifiesAppleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')->once()->andReturn(mobileAppleIdentity());
    });

    $this->postJson('/api/v1/auth/apple', mobileApplePayload())
        ->assertUnprocessable()
        ->assertJsonPath('errors.apple.0', 'This ChessX account is already linked to another Apple account.');
    expect($user->authProviders()->count())->toBe(1);
    $this->assertDatabaseCount('personal_access_tokens', 0);
});

it('creates and onboards a new player using an Apple private-relay email and first-login name', function () {
    $role = Role::factory()->user()->create();
    Event::fake([Registered::class]);
    mock(VerifiesAppleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')->once()->andReturn(mobileAppleIdentity());
    });

    $response = $this->postJson('/api/v1/auth/apple', mobileApplePayload([
        'first_name' => '  Apple ',
        'last_name' => ' Player  ',
    ]));

    $response->assertOk()
        ->assertJsonPath('data.is_new_user', true)
        ->assertJsonPath('data.user.email', 'apple-player@privaterelay.appleid.com')
        ->assertJsonPath('data.user.onboarding.next_step', 'location');
    $user = User::query()->where('email', 'apple-player@privaterelay.appleid.com')->firstOrFail();
    expect($user->role_id)->toBe($role->getKey())
        ->and($user->name)->toBe('Apple Player')
        ->and($user->profile?->display_name)->toBe('Apple Player')
        ->and($user->email_verified_at)->not->toBeNull();
    $this->assertDatabaseHas('user_auth_providers', [
        'user_id' => $user->getKey(),
        'provider' => 'apple',
        'provider_user_id' => 'mobile-apple-subject-123',
    ]);
    Event::assertDispatched(Registered::class, fn (Registered $event): bool => $event->user->is($user));
});

it('returns 401 without creating a session when the Apple token is invalid', function () {
    mock(VerifiesAppleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')->once()->andThrow(AppleTokenVerificationException::invalid());
    });

    $this->postJson('/api/v1/auth/apple', mobileApplePayload())
        ->assertUnauthorized()
        ->assertExactJson([
            'success' => false,
            'message' => 'The Apple identity token is invalid.',
            'code' => 'apple_token_invalid',
        ]);
    expect(MobileSession::query()->count())->toBe(0);
});

it('returns 422 when an unlinked Apple identity does not include an email', function () {
    mock(VerifiesAppleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')->once()->andReturn(mobileAppleIdentity([
            'email' => null,
            'email_verified' => false,
        ]));
    });

    $this->postJson('/api/v1/auth/apple', mobileApplePayload())
        ->assertUnprocessable()
        ->assertJsonValidationErrors('apple')
        ->assertJsonPath('errors.apple.0', 'Apple did not provide an email for this new ChessX account.');
});

it('returns 422 without consuming the identity when the Player role is unavailable', function () {
    mock(VerifiesAppleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')->once()->andReturn(mobileAppleIdentity());
    });

    $this->postJson('/api/v1/auth/apple', mobileApplePayload())
        ->assertUnprocessable()
        ->assertJsonPath('errors.apple.0', 'Apple sign-in is temporarily unavailable. Please try again later.');
    $this->assertDatabaseCount('users', 0);
    $this->assertDatabaseCount('user_auth_providers', 0);
});

it('returns 422 without issuing tokens for an inactive linked Apple account', function () {
    $user = User::factory()->create(['status' => 'suspended']);
    UserAuthProvider::factory()->for($user)->apple()->create([
        'provider_user_id' => 'mobile-apple-subject-123',
    ]);
    mock(VerifiesAppleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')->once()->andReturn(mobileAppleIdentity());
    });

    $this->postJson('/api/v1/auth/apple', mobileApplePayload())
        ->assertUnprocessable()
        ->assertJsonPath('errors.apple.0', 'This ChessX account is not active.');
    $this->assertDatabaseCount('personal_access_tokens', 0);
});

it('returns 422 when the Apple mobile request contract is invalid', function () {
    $this->postJson('/api/v1/auth/apple', [
        'nonce' => 'short',
        'platform' => 'web',
    ])->assertUnprocessable()->assertJsonValidationErrors([
        'id_token',
        'nonce',
        'device_name',
        'platform',
        'device_id',
    ]);
});

it('returns 429 after six Apple mobile login attempts in one minute', function () {
    mock(VerifiesAppleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')
            ->times(6)
            ->andThrow(AppleTokenVerificationException::invalid());
    });

    foreach (range(1, 6) as $attempt) {
        $this->postJson('/api/v1/auth/apple', mobileApplePayload([
            'id_token' => 'invalid-apple-token-'.$attempt,
        ]))->assertUnauthorized();
    }

    $this->postJson('/api/v1/auth/apple', mobileApplePayload([
        'id_token' => 'invalid-apple-token-7',
    ]))->assertTooManyRequests();
});
