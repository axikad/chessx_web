<?php

namespace App\Services\Auth;

use App\Exceptions\AppleTokenVerificationException;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;
use UnexpectedValueException;

final class AppleIdTokenVerifier implements VerifiesAppleIdToken
{
    private const CERTIFICATES_URL = 'https://appleid.apple.com/auth/keys';

    private const CERTIFICATES_CACHE_KEY = 'auth.apple.certificates';

    private const CERTIFICATES_CACHE_SECONDS = 3600;

    private const ISSUER = 'https://appleid.apple.com';

    public function __construct(private AppleNonceService $nonces) {}

    /**
     * @return array{sub: string, email: ?string, email_verified: bool, is_private_email: bool}
     */
    public function verify(#[\SensitiveParameter] string $idToken, #[\SensitiveParameter] string $nonce): array
    {
        $clientIds = $this->configuredClientIds();

        if ($clientIds === []) {
            throw AppleTokenVerificationException::notConfigured();
        }

        $idToken = trim($idToken);
        $nonce = trim($nonce);

        if ($idToken === '' || substr_count($idToken, '.') !== 2 || $nonce === '') {
            throw AppleTokenVerificationException::invalid();
        }

        $previousLeeway = JWT::$leeway;
        JWT::$leeway = 60;

        try {
            $claims = $this->decodeWithKeyRefresh($idToken);
            $this->validateClaims($claims, $clientIds, $nonce);

            if (! $this->nonces->consume($nonce)) {
                throw AppleTokenVerificationException::invalid();
            }

            return [
                'sub' => trim($claims->sub),
                'email' => $this->nullableString($claims->email ?? null, lowercase: true),
                'email_verified' => filter_var($claims->email_verified ?? false, FILTER_VALIDATE_BOOL),
                'is_private_email' => filter_var($claims->is_private_email ?? false, FILTER_VALIDATE_BOOL),
            ];
        } catch (AppleTokenVerificationException $exception) {
            throw $exception;
        } catch (ExpiredException) {
            throw AppleTokenVerificationException::invalid();
        } catch (Throwable $exception) {
            Log::notice('Apple identity token verification failed.', ['exception' => $exception::class]);

            throw AppleTokenVerificationException::invalid();
        } finally {
            JWT::$leeway = $previousLeeway;
        }
    }

    /** @return list<string> */
    private function configuredClientIds(): array
    {
        $clientIds = config('services.apple.client_ids', []);

        if (! is_array($clientIds)) {
            return [];
        }

        return array_values(array_filter(
            array_map(static fn (mixed $clientId): string => trim((string) $clientId), $clientIds),
        ));
    }

    private function decodeWithKeyRefresh(#[\SensitiveParameter] string $idToken): object
    {
        try {
            return JWT::decode($idToken, $this->signingKeys());
        } catch (ExpiredException $exception) {
            throw $exception;
        } catch (UnexpectedValueException) {
            Cache::forget(self::CERTIFICATES_CACHE_KEY);

            return JWT::decode($idToken, $this->signingKeys());
        }
    }

    /** @return array<string, Key> */
    private function signingKeys(): array
    {
        $keySet = Cache::remember(
            self::CERTIFICATES_CACHE_KEY,
            self::CERTIFICATES_CACHE_SECONDS,
            fn (): array => $this->fetchKeySet(),
        );

        try {
            return JWK::parseKeySet($keySet, 'RS256');
        } catch (Throwable $exception) {
            Log::warning('Apple returned an invalid signing key set.', ['exception' => $exception::class]);

            throw AppleTokenVerificationException::unavailable();
        }
    }

    /** @return array{keys: array<int, array<string, mixed>>} */
    private function fetchKeySet(): array
    {
        try {
            $keySet = Http::acceptJson()
                ->connectTimeout(2)
                ->timeout(5)
                ->get(self::CERTIFICATES_URL)
                ->throw()
                ->json();
        } catch (ConnectionException|RequestException $exception) {
            Log::warning('Unable to retrieve Apple signing keys.', ['exception' => $exception::class]);

            throw AppleTokenVerificationException::unavailable();
        }

        if (! is_array($keySet) || ! isset($keySet['keys']) || ! is_array($keySet['keys'])) {
            throw AppleTokenVerificationException::unavailable();
        }

        return $keySet;
    }

    /** @param list<string> $clientIds */
    private function validateClaims(object $claims, array $clientIds, #[\SensitiveParameter] string $nonce): void
    {
        $audiences = is_array($claims->aud ?? null) ? $claims->aud : [$claims->aud ?? null];
        $hasAllowedAudience = false;

        foreach ($audiences as $audience) {
            if (is_string($audience) && in_array($audience, $clientIds, true)) {
                $hasAllowedAudience = true;

                break;
            }
        }

        if (! $hasAllowedAudience
            || ($claims->iss ?? null) !== self::ISSUER
            || ! is_string($claims->sub ?? null)
            || trim($claims->sub) === ''
            || ! is_string($claims->nonce ?? null)
            || ! hash_equals(hash('sha256', $nonce), $claims->nonce)) {
            throw AppleTokenVerificationException::invalid();
        }
    }

    private function nullableString(mixed $value, bool $lowercase = false): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        $value = trim($value);

        return $lowercase ? mb_strtolower($value) : $value;
    }
}
