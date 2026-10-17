<?php

use App\Enums\PlayerCompetitionStatus;
use App\Exceptions\GoogleTokenVerificationException;
use App\Models\CompetitionTier;
use App\Models\Role;
use App\Models\User;
use App\Models\UserAuthProvider;
use App\Services\Auth\VerifiesGoogleIdToken;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery\MockInterface;

use function Pest\Laravel\mock;

/**
 * @param  array<string, mixed>  $overrides
 * @return array{sub: string, email: ?string, email_verified: bool, name: ?string, picture: ?string}
 */
function verifiedGoogleIdentity(array $overrides = []): array
{
    return array_replace([
        'sub' => 'google-subject-123',
        'email' => 'player@example.com',
        'email_verified' => true,
        'name' => 'Google Player',
        'picture' => 'https://example.com/player.png',
    ], $overrides);
}

test('login page exposes the configured Google web client', function () {
    config()->set('services.google.web_client_id', 'web-client.apps.googleusercontent.com');

    $response = $this->get(route('login'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('auth/login')
        ->where('googleClientId', 'web-client.apps.googleusercontent.com'));
});

test('Google login requires an identity token', function () {
    $response = $this->post(route('google.login'));

    $response->assertSessionHasErrors([
        'id_token' => 'The id token field is required.',
    ]);
    $this->assertGuest();
});

test('a linked active Google account starts a web session', function () {
    $this->travelTo('2026-10-16 12:00:00');
    $user = User::factory()->create([
        'email' => 'player@example.com',
        'last_login_at' => null,
        'status' => 'active',
    ]);
    UserAuthProvider::factory()->for($user)->create([
        'provider_user_id' => 'google-subject-123',
    ]);
    mock(VerifiesGoogleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')
            ->once()
            ->with('signed-google-token')
            ->andReturn(verifiedGoogleIdentity());
    });

    $response = $this->post(route('google.login'), [
        'id_token' => 'signed-google-token',
    ]);

    $response->assertRedirect(route('dashboard', absolute: false));
    $this->assertAuthenticatedAs($user);
    expect($user->refresh()->last_login_at?->toDateTimeString())->toBe('2026-10-16 12:00:00');
});

test('a verified matching email is linked and starts a web session', function () {
    $this->travelTo('2026-10-16 12:00:00');
    $user = User::factory()->create([
        'email' => 'player@example.com',
        'email_verified_at' => null,
        'status' => 'active',
    ]);
    mock(VerifiesGoogleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')->once()->andReturn(verifiedGoogleIdentity());
    });

    $response = $this->post(route('google.login'), [
        'id_token' => 'signed-google-token',
    ]);

    $response->assertRedirect(route('dashboard', absolute: false));
    $this->assertAuthenticatedAs($user);
    $this->assertDatabaseHas('user_auth_providers', [
        'user_id' => $user->id,
        'provider' => 'google',
        'provider_user_id' => 'google-subject-123',
    ]);
    expect($user->refresh()->email_verified_at?->toDateTimeString())->toBe('2026-10-16 12:00:00');
});

test('Google login imports missing display name and avatar', function () {
    Storage::fake('public');
    Http::preventStrayRequests();
    Http::fake([
        'https://lh3.googleusercontent.com/*' => Http::response(
            base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='),
            200,
            ['Content-Type' => 'image/png'],
        ),
    ]);
    $user = User::factory()->create([
        'email' => 'player@example.com',
        'avatar_path' => null,
    ]);
    mock(VerifiesGoogleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')->once()->andReturn(verifiedGoogleIdentity([
            'name' => '  Google   Player  ',
            'picture' => 'https://lh3.googleusercontent.com/a/player-photo',
        ]));
    });

    $this->post(route('google.login'), [
        'id_token' => 'signed-google-token',
    ])->assertRedirect(route('dashboard', absolute: false));

    $user->refresh()->load('profile');
    expect($user->profile?->display_name)->toBe('Google Player')
        ->and($user->avatar_path)->toStartWith('avatars/google-')->toEndWith('.png');
    Storage::disk('public')->assertExists($user->avatar_path);
    Http::assertSentCount(1);
});

test('Google login preserves player-managed profile information', function () {
    Storage::fake('public');
    Http::preventStrayRequests();
    $user = User::factory()->create([
        'email' => 'player@example.com',
        'avatar_path' => 'avatars/player-managed.jpg',
    ]);
    $user->profile()->create(['display_name' => 'Player Choice']);
    mock(VerifiesGoogleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')->once()->andReturn(verifiedGoogleIdentity([
            'name' => 'Google Name',
            'picture' => 'https://lh3.googleusercontent.com/a/google-photo',
        ]));
    });

    $this->post(route('google.login'), [
        'id_token' => 'signed-google-token',
    ])->assertRedirect(route('dashboard', absolute: false));

    $user->refresh()->load('profile');
    expect($user->profile?->display_name)->toBe('Player Choice')
        ->and($user->avatar_path)->toBe('avatars/player-managed.jpg');
    Http::assertNothingSent();
});

test('Google login ignores avatar URLs outside the trusted Google image domain', function () {
    Storage::fake('public');
    Http::preventStrayRequests();
    $user = User::factory()->create([
        'email' => 'player@example.com',
        'avatar_path' => null,
    ]);
    mock(VerifiesGoogleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')->once()->andReturn(verifiedGoogleIdentity([
            'picture' => 'https://example.com/untrusted-avatar.png',
        ]));
    });

    $this->post(route('google.login'), [
        'id_token' => 'signed-google-token',
    ])->assertRedirect(route('dashboard', absolute: false));

    expect($user->refresh()->avatar_path)->toBeNull();
    Http::assertNothingSent();
});

test('an unverified Google email cannot link a matching ChessX account', function () {
    $user = User::factory()->create([
        'email' => 'player@example.com',
        'email_verified_at' => null,
        'status' => 'active',
    ]);
    mock(VerifiesGoogleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')->once()->andReturn(verifiedGoogleIdentity([
            'email_verified' => false,
        ]));
    });

    $response = $this->post(route('google.login'), [
        'id_token' => 'signed-google-token',
    ]);

    $response->assertSessionHasErrors([
        'google' => 'Google must verify your email before ChessX can link this account.',
    ]);
    $this->assertGuest();
    expect($user->authProviders()->count())->toBe(0)
        ->and($user->refresh()->email_verified_at)->toBeNull();
});

test('a verified Google identity creates and onboards a new player', function () {
    $this->travelTo('2026-10-16 12:00:00');
    $role = Role::factory()->user()->create();
    $cityTier = CompetitionTier::factory()->create();
    $stateTier = CompetitionTier::factory()->stateLeague()->create();
    CompetitionTier::factory()->nationalLeague()->create(['is_active' => false]);
    Event::fake([Registered::class]);
    mock(VerifiesGoogleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')->once()->andReturn(verifiedGoogleIdentity([
            'picture' => null,
        ]));
    });

    $response = $this->post(route('google.login'), [
        'id_token' => 'signed-google-token',
    ]);

    $response->assertRedirect(route('onboarding', absolute: false));
    $user = User::query()->where('email', 'player@example.com')->firstOrFail();
    $this->assertAuthenticatedAs($user);
    $this->assertDatabaseHas('user_auth_providers', [
        'user_id' => $user->getKey(),
        'provider' => 'google',
        'provider_user_id' => 'google-subject-123',
    ]);
    expect($user->role_id)->toBe($role->getKey())
        ->and($user->name)->toBe('Google Player')
        ->and($user->status)->toBe('active')
        ->and($user->email_verified_at?->toDateTimeString())->toBe('2026-10-16 12:00:00')
        ->and($user->profile?->display_name)->toBe('Google Player')
        ->and($user->playerRatings()->count())->toBe(2)
        ->and($user->playerRatings()->pluck('tier_id')->sort()->values()->all())
        ->toBe(collect([$cityTier->id, $stateTier->id])->sort()->values()->all())
        ->and($user->playerCompetitions()->count())->toBe(2)
        ->and($user->playerCompetitions()->pluck('status')->unique()->all())
        ->toBe([PlayerCompetitionStatus::Locked]);
    Event::assertDispatched(Registered::class, fn (Registered $event): bool => $event->user->is($user));
});

test('a verified Google identity returns a safe error when the player role is unavailable', function () {
    mock(VerifiesGoogleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')->once()->andReturn(verifiedGoogleIdentity([
            'picture' => null,
        ]));
    });

    $response = $this->post(route('google.login'), [
        'id_token' => 'signed-google-token',
    ]);

    $response->assertSessionHasErrors([
        'google' => 'Google sign-in is temporarily unavailable. Please try again later.',
    ]);
    $this->assertGuest();
    expect(User::query()->count())->toBe(0)
        ->and(UserAuthProvider::query()->count())->toBe(0);
});

test('a ChessX account linked to another Google subject rejects the new identity', function () {
    $user = User::factory()->create([
        'email' => 'player@example.com',
        'status' => 'active',
    ]);
    UserAuthProvider::factory()->for($user)->create([
        'provider_user_id' => 'different-google-subject',
    ]);
    mock(VerifiesGoogleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')->once()->andReturn(verifiedGoogleIdentity());
    });

    $response = $this->post(route('google.login'), [
        'id_token' => 'signed-google-token',
    ]);

    $response->assertSessionHasErrors([
        'google' => 'This ChessX account is already linked to another Google account.',
    ]);
    $this->assertGuest();
    expect($user->authProviders()->count())->toBe(1)
        ->and($user->authProviders()->first()?->provider_user_id)->toBe('different-google-subject');
});

test('an inactive matching ChessX account is not linked to Google', function () {
    $user = User::factory()->create([
        'email' => 'player@example.com',
        'status' => 'suspended',
    ]);
    mock(VerifiesGoogleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')->once()->andReturn(verifiedGoogleIdentity());
    });

    $response = $this->post(route('google.login'), [
        'id_token' => 'signed-google-token',
    ]);

    $response->assertSessionHasErrors([
        'google' => 'This ChessX account is not active.',
    ]);
    $this->assertGuest();
    expect($user->authProviders()->count())->toBe(0);
});

test('an inactive linked account cannot start a Google session', function () {
    $user = User::factory()->create(['status' => 'suspended']);
    UserAuthProvider::factory()->for($user)->create([
        'provider_user_id' => 'google-subject-123',
    ]);
    mock(VerifiesGoogleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')->once()->andReturn(verifiedGoogleIdentity());
    });

    $response = $this->post(route('google.login'), [
        'id_token' => 'signed-google-token',
    ]);

    $response->assertSessionHasErrors([
        'google' => 'This ChessX account is not active.',
    ]);
    $this->assertGuest();
    expect($user->refresh()->last_login_at)->toBeNull();
});

test('a rejected Google token returns a safe form error', function () {
    mock(VerifiesGoogleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')
            ->once()
            ->andThrow(GoogleTokenVerificationException::invalid());
    });

    $response = $this->post(route('google.login'), [
        'id_token' => 'invalid-google-token',
    ]);

    $response->assertSessionHasErrors([
        'google' => 'The Google identity token is invalid.',
    ]);
    $this->assertGuest();
});

test('Google login rejects identity tokens larger than the supported limit', function () {
    $response = $this->post(route('google.login'), [
        'id_token' => str_repeat('a', 8193),
    ]);

    $response->assertSessionHasErrors([
        'id_token' => 'The id token field must not be greater than 8192 characters.',
    ]);
    $this->assertGuest();
});

test('Google login is rate limited after six failed attempts', function () {
    mock(VerifiesGoogleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')
            ->times(6)
            ->andThrow(GoogleTokenVerificationException::invalid());
    });

    foreach (range(1, 6) as $attempt) {
        $this->post(route('google.login'), [
            'id_token' => 'invalid-google-token-'.$attempt,
        ])->assertSessionHasErrors('google');
    }

    $this->post(route('google.login'), [
        'id_token' => 'invalid-google-token-7',
    ])->assertTooManyRequests();
    $this->assertGuest();
});
