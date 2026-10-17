<?php

namespace App\Services\Auth;

use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Support\Facades\Cache;

final class AppleNonceService
{
    private const CACHE_PREFIX = 'auth.apple.nonce.';

    private const EXPIRES_IN_SECONDS = 600;

    /** @return array{nonce: string, expires_in: int} */
    public function issue(): array
    {
        $nonce = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');

        Cache::put($this->cacheKey($nonce), true, self::EXPIRES_IN_SECONDS);

        return [
            'nonce' => $nonce,
            'expires_in' => self::EXPIRES_IN_SECONDS,
        ];
    }

    public function consume(#[\SensitiveParameter] string $nonce): bool
    {
        $key = $this->cacheKey($nonce);

        try {
            return Cache::lock($key.'.lock', 5)->block(
                2,
                fn (): bool => Cache::pull($key, false) === true,
            );
        } catch (LockTimeoutException) {
            return false;
        }
    }

    private function cacheKey(#[\SensitiveParameter] string $nonce): string
    {
        return self::CACHE_PREFIX.hash('sha256', $nonce);
    }
}
