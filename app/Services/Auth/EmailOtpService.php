<?php

namespace App\Services\Auth;

use App\Actions\OnboardPlayer;
use App\Exceptions\EmailOtpException;
use App\Models\EmailLoginOtp;
use App\Models\Role;
use App\Models\User;
use App\Notifications\EmailLoginOtpNotification;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Throwable;

final class EmailOtpService
{
    public function __construct(private OnboardPlayer $onboardPlayer) {}

    public function sendCode(string $email, ?string $ipAddress): void
    {
        $existingUser = User::query()->withTrashed()->where('email', $email)->first();

        if ($existingUser !== null && ($existingUser->trashed() || $existingUser->status !== 'active')) {
            return;
        }

        $code = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        $otpHash = Hash::make($code);
        $expiresInMinutes = $this->expiresInMinutes();

        try {
            $otp = DB::transaction(function () use ($email, $ipAddress, $otpHash, $expiresInMinutes): ?EmailLoginOtp {
                $otp = EmailLoginOtp::query()->where('email', $email)->lockForUpdate()->first();

                if ($otp?->resend_available_at?->isFuture()) {
                    return null;
                }

                $attributes = [
                    'otp_hash' => $otpHash,
                    'attempts_remaining' => $this->maxAttempts(),
                    'expires_at' => now()->addMinutes($expiresInMinutes),
                    'resend_available_at' => now()->addSeconds($this->resendAfterSeconds()),
                    'requested_ip' => $ipAddress,
                ];

                if ($otp === null) {
                    return EmailLoginOtp::query()->create([
                        'email' => $email,
                        ...$attributes,
                    ]);
                }

                $otp->update($attributes);

                return $otp;
            });
        } catch (UniqueConstraintViolationException) {
            return;
        }

        if ($otp === null) {
            return;
        }

        try {
            Notification::route('mail', $email)->notify(
                new EmailLoginOtpNotification($code, $expiresInMinutes),
            );
        } catch (Throwable $exception) {
            EmailLoginOtp::query()
                ->whereKey($otp->getKey())
                ->where('otp_hash', $otpHash)
                ->delete();

            Log::warning('Unable to deliver a Chess Mission email login code.', [
                'email_hash' => hash('sha256', $email),
                'exception' => $exception::class,
            ]);

            throw EmailOtpException::deliveryUnavailable();
        }
    }

    /**
     * @return array{user: User, is_new_player: bool}
     */
    public function verifyCode(string $email, #[\SensitiveParameter] string $code): array
    {
        try {
            $result = $this->resolveVerification($email, $code);
        } catch (UniqueConstraintViolationException) {
            $result = $this->resolveVerification($email, $code);
        }

        if ($result === 'invalid') {
            throw EmailOtpException::invalid();
        }

        if ($result === 'inactive') {
            throw EmailOtpException::inactive();
        }

        return $result;
    }

    /**
     * @return array{user: User, is_new_player: bool}|'inactive'|'invalid'
     */
    private function resolveVerification(string $email, #[\SensitiveParameter] string $code): array|string
    {
        return DB::transaction(function () use ($email, $code): array|string {
            $otp = EmailLoginOtp::query()->where('email', $email)->lockForUpdate()->first();

            if ($otp === null) {
                return 'invalid';
            }

            if ($otp->expires_at->isPast() || $otp->attempts_remaining < 1) {
                $otp->delete();

                return 'invalid';
            }

            if (! Hash::check($code, $otp->otp_hash)) {
                $remainingAttempts = $otp->attempts_remaining - 1;

                if ($remainingAttempts < 1) {
                    $otp->delete();
                } else {
                    $otp->update(['attempts_remaining' => $remainingAttempts]);
                }

                return 'invalid';
            }

            $user = User::query()->withTrashed()->where('email', $email)->lockForUpdate()->first();

            if ($user !== null && ($user->trashed() || $user->status !== 'active')) {
                $otp->delete();

                return 'inactive';
            }

            $isNewPlayer = $user === null;

            if ($user === null) {
                $role = Role::query()->where('slug', 'user')->first();

                if ($role === null) {
                    throw EmailOtpException::unavailable();
                }

                $user = User::query()->create([
                    'role_id' => $role->getKey(),
                    'name' => $this->nameFromEmail($email),
                    'email' => $email,
                    'password' => Hash::make(Str::random(64)),
                    'status' => 'active',
                ]);
                $user->forceFill(['email_verified_at' => now()])->save();
            } elseif ($user->email_verified_at === null) {
                $user->forceFill(['email_verified_at' => now()])->save();
            }

            $this->onboardPlayer->handle($user);
            $otp->delete();

            return [
                'user' => $user,
                'is_new_player' => $isNewPlayer,
            ];
        });
    }

    private function nameFromEmail(string $email): string
    {
        $name = Str::of($email)
            ->before('@')
            ->replace(['.', '_', '-'], ' ')
            ->squish()
            ->title()
            ->limit(255, '')
            ->value();

        return $name !== '' ? $name : 'Chess Mission Player';
    }

    private function expiresInMinutes(): int
    {
        return max(1, (int) config('auth.email_otp.expires', 10));
    }

    private function resendAfterSeconds(): int
    {
        return max(1, (int) config('auth.email_otp.resend_after', 60));
    }

    private function maxAttempts(): int
    {
        return max(1, min(255, (int) config('auth.email_otp.max_attempts', 5)));
    }
}
