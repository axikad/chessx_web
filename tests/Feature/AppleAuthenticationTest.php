<?php

use App\Enums\PlayerCompetitionStatus;
use App\Exceptions\AppleTokenVerificationException;
use App\Models\CompetitionTier;
use App\Models\Role;
use App\Models\User;
use App\Models\UserAuthProvider;
use App\Services\Auth\AppleWebAuthorizationService;
use App\Services\Auth\VerifiesAppleIdToken;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;
use Inertia\Testing\AssertableInertia as Assert;
use Mockery\MockInterface;

use function Pest\Laravel\mock;

/**
 * @param  array<string, mixed>  $overrides
 * @return array{sub: string, email: ?string, email_verified: bool, is_private_email: bool}
 */
function verifiedWebAppleIdentity(array $overrides = []): array
{
    return array_replace([
        'sub' => 'web-apple-subject-123',
        'email' => 'apple-player@privaterelay.appleid.com',
        'email_verified' => true,
        'is_private_email' => true,
    ], $overrides);
}

/** @return array<string, string> */
function webAppleLoginPayload(array $overrides = []): array
{
    return array_replace([
        'id_token' => 'signed-apple-id-token',
        'nonce' => 'apple-web-raw-nonce-1234567890',
        'state' => 'apple-web-state-1234567890',
        'first_name' => 'Apple',
        'last_name' => 'Player',
    ], $overrides);
}

test('Apple web authorization state is bound to the session and consumed once', function () {
    $session = app('session')->driver();
    $authorization = app(AppleWebAuthorizationService::class)->issue($session);

    expect($authorization['nonce_hash'])->toBe(hash('sha256', $authorization['nonce']))
        ->and(app(AppleWebAuthorizationService::class)->consumeState($session, $authorization['state']))->toBeTrue()
        ->and(app(AppleWebAuthorizationService::class)->consumeState($session, $authorization['state']))->toBeFalse();
});

test('login page exposes a secure Apple web authorization configuration', function () {
    config()->set('services.apple.web_client_id', 'com.chessx.web');
    config()->set('services.apple.web_redirect_uri', 'https://chessx.example.com/login');

    $response = $this->get(route('login'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('auth/login')
        ->where('appleAuthorization.clientId', 'com.chessx.web')
        ->where('appleAuthorization.redirectUri', 'https://chessx.example.com/login')
        ->has('appleAuthorization.nonce')
        ->has('appleAuthorization.nonce_hash')
        ->has('appleAuthorization.state'));
});

test('login page omits Apple authorization when web configuration is incomplete', function () {
    config()->set('services.apple.web_client_id', 'com.chessx.web');
    config()->set('services.apple.web_redirect_uri', null);

    $response = $this->get(route('login'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('auth/login')
        ->where('appleAuthorization', null));
});

test('a linked active Apple account starts a web session', function () {
    $this->travelTo('2026-10-16 12:00:00');
    $payload = webAppleLoginPayload();
    $user = User::factory()->create([
        'last_login_at' => null,
        'status' => 'active',
    ]);
    UserAuthProvider::factory()->for($user)->apple()->create([
        'provider_user_id' => 'web-apple-subject-123',
    ]);
    mock(VerifiesAppleIdToken::class, function (MockInterface $mock) use ($payload): void {
        $mock->shouldReceive('verify')
            ->once()
            ->with($payload['id_token'], $payload['nonce'])
            ->andReturn(verifiedWebAppleIdentity());
    });

    $response = $this
        ->withSession(['auth.apple.web_state' => hash('sha256', $payload['state'])])
        ->post(route('apple.login'), $payload);

    $response->assertRedirect(route('dashboard', absolute: false));
    $this->assertAuthenticatedAs($user);
    expect($user->refresh()->last_login_at?->toDateTimeString())->toBe('2026-10-16 12:00:00');
});

test('Apple web login rejects a mismatched state without verifying the token', function () {
    $payload = webAppleLoginPayload();
    mock(VerifiesAppleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldNotReceive('verify');
    });

    $response = $this
        ->withSession(['auth.apple.web_state' => hash('sha256', 'another-state')])
        ->post(route('apple.login'), $payload);

    $response->assertSessionHasErrors([
        'apple' => 'The Apple sign-in session is invalid or has expired. Please try again.',
    ]);
    $this->assertGuest();
});

test('a verified Apple identity creates and onboards a new player from the web', function () {
    $payload = webAppleLoginPayload([
        'first_name' => '  Apple ',
        'last_name' => ' Player  ',
    ]);
    $role = Role::factory()->user()->create();
    $cityTier = CompetitionTier::factory()->create();
    $stateTier = CompetitionTier::factory()->stateLeague()->create();
    CompetitionTier::factory()->nationalLeague()->create(['is_active' => false]);
    Event::fake([Registered::class]);
    mock(VerifiesAppleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')->once()->andReturn(verifiedWebAppleIdentity());
    });

    $response = $this
        ->withSession(['auth.apple.web_state' => hash('sha256', $payload['state'])])
        ->post(route('apple.login'), $payload);

    $response->assertRedirect(route('onboarding', absolute: false));
    $user = User::query()->where('email', 'apple-player@privaterelay.appleid.com')->firstOrFail();
    $this->assertAuthenticatedAs($user);
    $this->assertDatabaseHas('user_auth_providers', [
        'user_id' => $user->getKey(),
        'provider' => 'apple',
        'provider_user_id' => 'web-apple-subject-123',
    ]);
    expect($user->role_id)->toBe($role->getKey())
        ->and($user->name)->toBe('Apple Player')
        ->and($user->profile?->display_name)->toBe('Apple Player')
        ->and($user->playerRatings()->pluck('tier_id')->sort()->values()->all())
        ->toBe(collect([$cityTier->id, $stateTier->id])->sort()->values()->all())
        ->and($user->playerCompetitions()->pluck('status')->unique()->all())
        ->toBe([PlayerCompetitionStatus::Locked]);
    Event::assertDispatched(Registered::class, fn (Registered $event): bool => $event->user->is($user));
});

test('a rejected Apple token returns a safe web form error', function () {
    $payload = webAppleLoginPayload();
    mock(VerifiesAppleIdToken::class, function (MockInterface $mock): void {
        $mock->shouldReceive('verify')
            ->once()
            ->andThrow(AppleTokenVerificationException::invalid());
    });

    $response = $this
        ->withSession(['auth.apple.web_state' => hash('sha256', $payload['state'])])
        ->post(route('apple.login'), $payload);

    $response->assertSessionHasErrors([
        'apple' => 'The Apple identity token is invalid.',
    ]);
    $this->assertGuest();
});

test('Apple web login requires the identity token nonce and state', function () {
    $response = $this->post(route('apple.login'));

    $response->assertSessionHasErrors(['id_token', 'nonce', 'state']);
    $this->assertGuest();
});
