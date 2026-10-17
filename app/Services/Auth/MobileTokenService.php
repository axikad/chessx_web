<?php

namespace App\Services\Auth;

use App\Exceptions\InvalidRefreshTokenException;
use App\Models\MobileSession;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

class MobileTokenService
{
    public const ACCESS_TOKEN_MINUTES = 15;

    public const REFRESH_TOKEN_DAYS = 30;

    /**
     * @param  array{device_name: string, platform: string, device_id: string}  $device
     * @return array{access_token: string, access_token_expires_at: CarbonInterface, refresh_token: string, refresh_token_expires_at: CarbonInterface, session: MobileSession, user: User}
     */
    public function issue(User $user, array $device, ?string $ipAddress, ?string $userAgent): array
    {
        return DB::transaction(function () use ($user, $device, $ipAddress, $userAgent): array {
            $deviceIdentifierHash = hash('sha256', $device['device_id']);
            $session = MobileSession::query()
                ->whereBelongsTo($user)
                ->where('device_identifier_hash', $deviceIdentifierHash)
                ->lockForUpdate()
                ->first();

            $session?->accessToken()->delete();

            $issuedTokens = $this->createTokens($user, $device['device_name']);
            $attributes = [
                'access_token_id' => $issuedTokens['access_token_id'],
                'device_name' => $device['device_name'],
                'platform' => $device['platform'],
                'device_identifier_hash' => $deviceIdentifierHash,
                'refresh_token_hash' => hash('sha256', $issuedTokens['refresh_token']),
                'refresh_token_expires_at' => $issuedTokens['refresh_token_expires_at'],
                'last_refreshed_at' => now(),
                'last_ip_address' => $ipAddress,
                'user_agent' => $userAgent,
                'revoked_at' => null,
            ];

            if ($session === null) {
                $session = $user->mobileSessions()->create($attributes);
            } else {
                $session->update($attributes);
            }

            $user->forceFill(['last_login_at' => now()])->save();
            $user->loadMissing(['profile', 'role', 'currentLocation']);

            return [
                'access_token' => $issuedTokens['access_token'],
                'access_token_expires_at' => $issuedTokens['access_token_expires_at'],
                'refresh_token' => $issuedTokens['refresh_token'],
                'refresh_token_expires_at' => $issuedTokens['refresh_token_expires_at'],
                'session' => $session,
                'user' => $user,
            ];
        });
    }

    /**
     * @return array{access_token: string, access_token_expires_at: CarbonInterface, refresh_token: string, refresh_token_expires_at: CarbonInterface, session: MobileSession, user: User}
     */
    public function rotate(string $refreshToken, ?string $ipAddress, ?string $userAgent): array
    {
        return DB::transaction(function () use ($refreshToken, $ipAddress, $userAgent): array {
            $session = MobileSession::query()
                ->where('refresh_token_hash', hash('sha256', $refreshToken))
                ->lockForUpdate()
                ->first();

            if ($session === null || $session->revoked_at !== null || $session->refresh_token_expires_at->isPast()) {
                throw new InvalidRefreshTokenException;
            }

            $session->load(['user.profile', 'user.role', 'user.currentLocation', 'accessToken']);
            $user = $session->user;

            if ($user === null || $user->status !== 'active') {
                throw new InvalidRefreshTokenException;
            }

            $session->accessToken?->delete();
            $issuedTokens = $this->createTokens($user, $session->device_name);

            $session->update([
                'access_token_id' => $issuedTokens['access_token_id'],
                'refresh_token_hash' => hash('sha256', $issuedTokens['refresh_token']),
                'refresh_token_expires_at' => $issuedTokens['refresh_token_expires_at'],
                'last_refreshed_at' => now(),
                'last_ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);

            return [
                'access_token' => $issuedTokens['access_token'],
                'access_token_expires_at' => $issuedTokens['access_token_expires_at'],
                'refresh_token' => $issuedTokens['refresh_token'],
                'refresh_token_expires_at' => $issuedTokens['refresh_token_expires_at'],
                'session' => $session,
                'user' => $user,
            ];
        });
    }

    public function revoke(User $user, int $sessionId): ?MobileSession
    {
        return DB::transaction(function () use ($user, $sessionId): ?MobileSession {
            $session = MobileSession::query()
                ->whereBelongsTo($user)
                ->whereKey($sessionId)
                ->whereNull('revoked_at')
                ->lockForUpdate()
                ->first();

            if ($session === null) {
                return null;
            }

            $session->accessToken()->delete();
            $session->update(['revoked_at' => now()]);

            return $session;
        });
    }

    public function revokeAll(User $user): int
    {
        return DB::transaction(function () use ($user): int {
            $sessions = MobileSession::query()
                ->whereBelongsTo($user)
                ->whereNull('revoked_at')
                ->lockForUpdate()
                ->get(['id', 'access_token_id']);

            if ($sessions->isEmpty()) {
                return 0;
            }

            $accessTokenIds = $sessions->pluck('access_token_id')->filter()->values();

            MobileSession::query()
                ->whereKey($sessions->modelKeys())
                ->update(['revoked_at' => now()]);

            if ($accessTokenIds->isNotEmpty()) {
                $user->tokens()->whereKey($accessTokenIds)->delete();
            }

            return $sessions->count();
        });
    }

    /**
     * @return array{access_token_id: int, access_token: string, access_token_expires_at: CarbonInterface, refresh_token: string, refresh_token_expires_at: CarbonInterface}
     */
    private function createTokens(User $user, string $deviceName): array
    {
        $accessTokenExpiresAt = now()->addMinutes(self::ACCESS_TOKEN_MINUTES);
        $refreshTokenExpiresAt = now()->addDays(self::REFRESH_TOKEN_DAYS);
        $accessToken = $user->createToken($deviceName, ['mobile'], $accessTokenExpiresAt);

        return [
            'access_token_id' => $accessToken->accessToken->getKey(),
            'access_token' => $accessToken->plainTextToken,
            'access_token_expires_at' => $accessTokenExpiresAt,
            'refresh_token' => bin2hex(random_bytes(32)),
            'refresh_token_expires_at' => $refreshTokenExpiresAt,
        ];
    }
}
