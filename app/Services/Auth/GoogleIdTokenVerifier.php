<?php

namespace App\Services\Auth;

use App\Exceptions\GoogleTokenVerificationException;
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

final class GoogleIdTokenVerifier implements VerifiesGoogleIdToken
{
    private const CERTIFICATES_URL = 'https://www.googleapis.com/oauth2/v3/certs';

    private const CERTIFICATES_CACHE_KEY = 'auth.google.certificates';

    private const CERTIFICATES_CACHE_SECONDS = 3600;

    private const ALLOWED_ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];

    /**
     * @return array{sub: string, email: ?string, email_verified: bool, name: ?string, picture: ?string}
     */
    public function verify(#[\SensitiveParameter] string $idToken): array
    {
        $clientIds = $this->configuredClientIds();

        if ($clientIds === []) {
            throw GoogleTokenVerificationException::notConfigured();
        }

        $idToken = trim($idToken);

        if ($idToken === '' || substr_count($idToken, '.') !== 2) {
            throw GoogleTokenVerificationException::invalid();
        }

        $previousLeeway = JWT::$leeway;
        JWT::$leeway = 60;

        try {
            $claims = $this->decodeWithKeyRefresh($idToken);
            $this->validateClaims($claims, $clientIds);

            return [
                'sub' => trim($claims->sub),
                'email' => $this->nullableString($claims->email ?? null, lowercase: true),
                'email_verified' => filter_var($claims->email_verified ?? false, FILTER_VALIDATE_BOOL),
                'name' => $this->nullableString($claims->name ?? null),
                'picture' => $this->nullableString($claims->picture ?? null),
            ];
        } catch (GoogleTokenVerificationException $exception) {
            throw $exception;
        } catch (ExpiredException) {
            throw GoogleTokenVerificationException::invalid();
        } catch (Throwable $exception) {
            Log::notice('Google identity token verification failed.', [
                'exception' => $exception::class,
            ]);

            throw GoogleTokenVerificationException::invalid();
        } finally {
            JWT::$leeway = $previousLeeway;
        }
    }

    /**
     * @return list<string>
     */
    private function configuredClientIds(): array
    {
        $clientIds = config('services.google.client_ids', []);

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

    /**
     * @return array<string, Key>
     */
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
            Log::warning('Google returned an invalid signing key set.', [
                'exception' => $exception::class,
            ]);

            throw GoogleTokenVerificationException::unavailable();
        }
    }

    /**
     * @return array{keys: array<int, array<string, mixed>>}
     */
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
            Log::warning('Unable to retrieve Google signing keys.', [
                'exception' => $exception::class,
            ]);

            throw GoogleTokenVerificationException::unavailable();
        }

        if (! is_array($keySet) || ! isset($keySet['keys']) || ! is_array($keySet['keys'])) {
            throw GoogleTokenVerificationException::unavailable();
        }

        return $keySet;
    }

    /**
     * @param  list<string>  $clientIds
     */
    private function validateClaims(object $claims, array $clientIds): void
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
            || ! is_string($claims->iss ?? null)
            || ! in_array($claims->iss, self::ALLOWED_ISSUERS, true)
            || ! is_string($claims->sub ?? null)
            || trim($claims->sub) === '') {
            throw GoogleTokenVerificationException::invalid();
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
