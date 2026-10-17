<?php

use App\Models\EmailLoginOtp;
use App\Models\MobileSession;
use App\Models\Role;
use App\Models\User;
use App\Notifications\EmailLoginOtpNotification;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;

it('renders Chess Mission branding, the login code, and expiry in the email notification', function () {
    $html = (string) (new EmailLoginOtpNotification('1234', 10))->toMail(new stdClass)->render();

    expect($html)->toContain('Sign in to Chess Mission')
        ->and($html)->toContain('1234')
        ->and($html)->toContain('10 minutes')
        ->and($html)->toContain('can only be used once');
});

it('sends a hashed single-use login code to a normalized email', function () {
    $this->travelTo('2026-10-16 12:00:00');
    Notification::fake();
    $sentCode = null;

    $response = $this->postJson('/api/v1/auth/email-otp/request', [
        'email' => ' PLAYER@Example.test ',
    ]);

    $response->assertAccepted()->assertExactJson([
        'success' => true,
        'message' => 'If this email can use Chess Mission, a login code has been sent.',
        'data' => [
            'expires_in' => 600,
            'resend_after' => 60,
        ],
    ]);
    Notification::assertSentOnDemand(
        EmailLoginOtpNotification::class,
        function (EmailLoginOtpNotification $notification, array $channels, object $notifiable) use (&$sentCode): bool {
            $sentCode = $notification->code;

            return $channels === ['mail']
                && $notifiable->routes['mail'] === 'player@example.test';
        },
    );
    $otp = EmailLoginOtp::query()->sole();
    expect($sentCode)->toMatch('/^\d{4}$/')
        ->and($otp->email)->toBe('player@example.test')
        ->and($otp->otp_hash)->not->toBe($sentCode)
        ->and(Hash::check($sentCode, $otp->otp_hash))->toBeTrue()
        ->and($otp->attempts_remaining)->toBe(5)
        ->and($otp->expires_at->toDateTimeString())->toBe('2026-10-16 12:10:00')
        ->and($otp->resend_available_at->toDateTimeString())->toBe('2026-10-16 12:01:00');
});

it('does not send another code during the resend cooldown', function () {
    Notification::fake();

    $this->postJson('/api/v1/auth/email-otp/request', [
        'email' => 'cooldown@example.test',
    ])->assertAccepted();
    $originalHash = EmailLoginOtp::query()->sole()->otp_hash;

    $this->postJson('/api/v1/auth/email-otp/request', [
        'email' => 'cooldown@example.test',
    ])->assertAccepted();

    Notification::assertSentOnDemandTimes(EmailLoginOtpNotification::class, 1);
    expect(EmailLoginOtp::query()->sole()->otp_hash)->toBe($originalHash);
});

it('returns the generic accepted response without emailing an inactive account', function () {
    User::factory()->create([
        'email' => 'inactive@example.test',
        'status' => 'inactive',
    ]);
    Notification::fake();

    $response = $this->postJson('/api/v1/auth/email-otp/request', [
        'email' => 'inactive@example.test',
    ]);

    $response->assertAccepted()->assertJsonPath(
        'message',
        'If this email can use Chess Mission, a login code has been sent.',
    );
    Notification::assertNothingSent();
    expect(EmailLoginOtp::query()->count())->toBe(0);
});

it('logs in and verifies an existing active account with a valid code', function () {
    $user = User::factory()->unverified()->create([
        'email' => 'existing@example.test',
        'status' => 'active',
    ]);
    EmailLoginOtp::factory()->create([
        'email' => $user->email,
        'otp_hash' => Hash::make('1234'),
    ]);

    $response = $this->postJson('/api/v1/auth/email-otp/verify', [
        'email' => $user->email,
        'otp' => '1234',
        'device_name' => 'Pixel 9',
        'platform' => 'android',
        'device_id' => 'existing-otp-device',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.user.id', $user->uuid)
        ->assertJsonPath('data.user.email', $user->email)
        ->assertJsonPath('data.is_new_user', false);
    $this->assertGuest();
    expect($user->refresh()->email_verified_at)->not->toBeNull()
        ->and(EmailLoginOtp::query()->count())->toBe(0)
        ->and(MobileSession::query()->whereBelongsTo($user)->count())->toBe(1);
    $this->withToken($response->json('data.access_token'))->getJson('/api/v1/me')->assertOk();
});

it('registers and onboards a new player with a valid code', function () {
    $role = Role::factory()->user()->create();
    EmailLoginOtp::factory()->create([
        'email' => 'new.player@example.test',
        'otp_hash' => Hash::make('6543'),
    ]);
    Event::fake([Registered::class]);

    $response = $this->postJson('/api/v1/auth/email-otp/verify', [
        'email' => 'new.player@example.test',
        'otp' => '6543',
        'device_name' => 'iPhone 17',
        'platform' => 'ios',
        'device_id' => 'new-otp-device',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.user.email', 'new.player@example.test')
        ->assertJsonPath('data.is_new_user', true)
        ->assertJsonPath('data.user.onboarding.next_step', 'location');
    $user = User::query()->where('email', 'new.player@example.test')->firstOrFail();
    expect($user->role_id)->toBe($role->getKey())
        ->and($user->name)->toBe('New Player')
        ->and($user->email_verified_at)->not->toBeNull()
        ->and($user->profile?->display_name)->toBe('New Player')
        ->and(EmailLoginOtp::query()->count())->toBe(0);
    $this->assertDatabaseHas('mobile_sessions', [
        'user_id' => $user->getKey(),
        'platform' => 'ios',
        'device_identifier_hash' => hash('sha256', 'new-otp-device'),
    ]);
    Event::assertDispatched(Registered::class, fn (Registered $event): bool => $event->user->is($user));
});

it('returns 503 without consuming the code when the Player role is unavailable', function () {
    $otp = EmailLoginOtp::factory()->create([
        'email' => 'role-unavailable@example.test',
        'otp_hash' => Hash::make('1234'),
    ]);

    $this->postJson('/api/v1/auth/email-otp/verify', [
        'email' => $otp->email,
        'otp' => '1234',
        'device_name' => 'Test Phone',
        'platform' => 'android',
        'device_id' => 'role-unavailable-device',
    ])->assertServiceUnavailable()->assertExactJson([
        'success' => false,
        'message' => 'Email login is temporarily unavailable.',
        'code' => 'email_otp_unavailable',
    ]);

    $this->assertModelExists($otp->fresh());
    expect(User::query()->count())->toBe(0);
    $this->assertDatabaseCount('personal_access_tokens', 0);
});

it('returns 422 and reduces the remaining attempts for an invalid code', function () {
    $otp = EmailLoginOtp::factory()->create([
        'email' => 'wrong-code@example.test',
        'otp_hash' => Hash::make('1234'),
        'attempts_remaining' => 5,
    ]);

    $this->postJson('/api/v1/auth/email-otp/verify', [
        'email' => $otp->email,
        'otp' => '9999',
        'device_name' => 'Test Phone',
        'platform' => 'android',
        'device_id' => 'wrong-code-device',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('otp')
        ->assertJsonPath('errors.otp.0', 'The login code is invalid or has expired.');
    expect($otp->refresh()->attempts_remaining)->toBe(4);
    $this->assertDatabaseCount('personal_access_tokens', 0);
});

it('invalidates a code after its final failed attempt', function () {
    $otp = EmailLoginOtp::factory()->create([
        'email' => 'final-attempt@example.test',
        'otp_hash' => Hash::make('1234'),
        'attempts_remaining' => 1,
    ]);

    $this->postJson('/api/v1/auth/email-otp/verify', [
        'email' => $otp->email,
        'otp' => '9999',
        'device_name' => 'Test Phone',
        'platform' => 'android',
        'device_id' => 'final-attempt-device',
    ])->assertUnprocessable()->assertJsonValidationErrors('otp');

    $this->assertModelMissing($otp);
});

it('returns 422 and consumes a valid code when the account became inactive', function () {
    $user = User::factory()->create([
        'email' => 'became-inactive@example.test',
        'status' => 'inactive',
    ]);
    $otp = EmailLoginOtp::factory()->create([
        'email' => $user->email,
        'otp_hash' => Hash::make('1234'),
    ]);

    $this->postJson('/api/v1/auth/email-otp/verify', [
        'email' => $user->email,
        'otp' => '1234',
        'device_name' => 'Test Phone',
        'platform' => 'android',
        'device_id' => 'inactive-otp-device',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('email')
        ->assertJsonPath('errors.email.0', 'This Chess Mission account is not active.');

    $this->assertModelMissing($otp);
    $this->assertDatabaseCount('personal_access_tokens', 0);
});

it('returns 422 and removes an expired code', function () {
    $otp = EmailLoginOtp::factory()->create([
        'email' => 'expired@example.test',
        'otp_hash' => Hash::make('1234'),
        'expires_at' => now()->subSecond(),
    ]);

    $this->postJson('/api/v1/auth/email-otp/verify', [
        'email' => $otp->email,
        'otp' => '1234',
        'device_name' => 'Test Phone',
        'platform' => 'android',
        'device_id' => 'expired-otp-device',
    ])->assertUnprocessable()->assertJsonValidationErrors('otp');

    $this->assertModelMissing($otp);
});

it('returns 422 when the email OTP request contracts are invalid', function () {
    $this->postJson('/api/v1/auth/email-otp/request', [
        'email' => 'not-an-email',
    ])->assertUnprocessable()->assertJsonValidationErrors('email');

    $this->postJson('/api/v1/auth/email-otp/verify', [
        'email' => 'not-an-email',
        'otp' => '123456',
        'platform' => 'web',
    ])->assertUnprocessable()->assertJsonValidationErrors([
        'email',
        'otp',
        'device_name',
        'platform',
        'device_id',
    ]);
});

it('returns 429 after three email OTP requests in one minute', function () {
    Notification::fake();
    $payload = ['email' => 'rate-limited-otp@example.test'];

    foreach (range(1, 3) as $attempt) {
        $this->postJson('/api/v1/auth/email-otp/request', $payload)->assertAccepted();
    }

    $this->postJson('/api/v1/auth/email-otp/request', $payload)->assertTooManyRequests();
    Notification::assertSentOnDemandTimes(EmailLoginOtpNotification::class, 1);
});
