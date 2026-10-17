<?php

use App\Exceptions\GoogleTokenVerificationException;
use App\Services\Auth\VerifiesGoogleIdToken;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

const GOOGLE_CERTIFICATES_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const GOOGLE_TEST_CLIENT_ID = 'chessx-web.apps.googleusercontent.com';
const GOOGLE_TEST_TIMESTAMP = 1792142400;

function googleTestBase64UrlEncode(string $value): string
{
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

/**
 * @return array<string, int|string>
 */
function googleTestOpenSslOptions(): array
{
    $options = [
        'private_key_bits' => 2048,
        'private_key_type' => OPENSSL_KEYTYPE_RSA,
    ];

    $configurationPaths = [
        dirname(PHP_BINARY).'/extras/ssl/openssl.cnf',
        dirname(PHP_BINARY).'/extras/openssl/openssl.cnf',
        dirname(PHP_BINARY).'/../apache/conf/openssl.cnf',
    ];

    foreach ($configurationPaths as $configurationPath) {
        if (is_file($configurationPath)) {
            $options['config'] = $configurationPath;

            break;
        }
    }

    return $options;
}

/**
 * @return array{private_key: OpenSSLAsymmetricKey, jwk: array<string, string>}
 */
function createGoogleTestKeyPair(string $keyId): array
{
    $privateKey = openssl_pkey_new(googleTestOpenSslOptions());

    if (! $privateKey instanceof OpenSSLAsymmetricKey) {
        throw new RuntimeException('Unable to generate the test RSA key.');
    }

    $details = openssl_pkey_get_details($privateKey);

    if (! is_array($details) || ! isset($details['rsa']['n'], $details['rsa']['e'])) {
        throw new RuntimeException('Unable to read the test RSA public key.');
    }

    return [
        'private_key' => $privateKey,
        'jwk' => [
            'alg' => 'RS256',
            'e' => googleTestBase64UrlEncode($details['rsa']['e']),
            'kid' => $keyId,
            'kty' => 'RSA',
            'n' => googleTestBase64UrlEncode($details['rsa']['n']),
            'use' => 'sig',
        ],
    ];
}

/**
 * @param  array<string, mixed>  $overrides
 */
function createGoogleTestToken(OpenSSLAsymmetricKey $privateKey, string $keyId, array $overrides = []): string
{
    $claims = array_replace([
        'aud' => GOOGLE_TEST_CLIENT_ID,
        'email' => ' PLAYER@Example.com ',
        'email_verified' => true,
        'exp' => GOOGLE_TEST_TIMESTAMP + 3600,
        'iat' => GOOGLE_TEST_TIMESTAMP,
        'iss' => 'https://accounts.google.com',
        'name' => ' Chess Player ',
        'picture' => ' https://example.com/player.png ',
        'sub' => 'google-player-123',
    ], $overrides);

    return JWT::encode($claims, $privateKey, 'RS256', $keyId);
}

beforeEach(function () {
    Cache::forget('auth.google.certificates');
    Http::preventStrayRequests();
    config()->set('services.google.client_ids', [GOOGLE_TEST_CLIENT_ID]);
    JWT::$timestamp = GOOGLE_TEST_TIMESTAMP;

    $this->keyPair = createGoogleTestKeyPair('google-test-key');
});

afterEach(function () {
    Cache::forget('auth.google.certificates');
    JWT::$timestamp = null;
    JWT::$leeway = 0;
});

test('a valid Google identity token is verified and normalized', function () {
    Http::fake([
        GOOGLE_CERTIFICATES_URL => Http::response(['keys' => [$this->keyPair['jwk']]]),
    ]);

    $identity = app(VerifiesGoogleIdToken::class)->verify(
        createGoogleTestToken($this->keyPair['private_key'], 'google-test-key'),
    );

    expect($identity)->toBe([
        'sub' => 'google-player-123',
        'email' => 'player@example.com',
        'email_verified' => true,
        'name' => 'Chess Player',
        'picture' => 'https://example.com/player.png',
    ]);
    Http::assertSentCount(1);
});

test('Google signing keys are reused from the cache', function () {
    Http::fake([
        GOOGLE_CERTIFICATES_URL => Http::response(['keys' => [$this->keyPair['jwk']]]),
    ]);

    $verifier = app(VerifiesGoogleIdToken::class);
    $token = createGoogleTestToken($this->keyPair['private_key'], 'google-test-key');

    $verifier->verify($token);
    $verifier->verify($token);

    Http::assertSentCount(1);
});

test('a rotated Google signing key refreshes the cached key set once', function () {
    $oldKeyPair = createGoogleTestKeyPair('old-google-key');
    Cache::put('auth.google.certificates', ['keys' => [$oldKeyPair['jwk']]], 3600);
    Http::fake([
        GOOGLE_CERTIFICATES_URL => Http::response(['keys' => [$this->keyPair['jwk']]]),
    ]);

    $identity = app(VerifiesGoogleIdToken::class)->verify(
        createGoogleTestToken($this->keyPair['private_key'], 'google-test-key'),
    );

    expect($identity['sub'])->toBe('google-player-123');
    Http::assertSentCount(1);
});

test('a Google identity token for another client is rejected', function () {
    Http::fake([
        GOOGLE_CERTIFICATES_URL => Http::response(['keys' => [$this->keyPair['jwk']]]),
    ]);
    $token = createGoogleTestToken($this->keyPair['private_key'], 'google-test-key', [
        'aud' => 'another-client.apps.googleusercontent.com',
    ]);

    expect(fn () => app(VerifiesGoogleIdToken::class)->verify($token))
        ->toThrow(GoogleTokenVerificationException::class, 'The Google identity token is invalid.');
});

test('a Google identity token from another issuer is rejected', function () {
    Http::fake([
        GOOGLE_CERTIFICATES_URL => Http::response(['keys' => [$this->keyPair['jwk']]]),
    ]);
    $token = createGoogleTestToken($this->keyPair['private_key'], 'google-test-key', [
        'iss' => 'https://attacker.example.com',
    ]);

    expect(fn () => app(VerifiesGoogleIdToken::class)->verify($token))
        ->toThrow(GoogleTokenVerificationException::class, 'The Google identity token is invalid.');
});

test('an expired Google identity token is rejected', function () {
    Http::fake([
        GOOGLE_CERTIFICATES_URL => Http::response(['keys' => [$this->keyPair['jwk']]]),
    ]);
    $token = createGoogleTestToken($this->keyPair['private_key'], 'google-test-key', [
        'exp' => GOOGLE_TEST_TIMESTAMP - 61,
        'iat' => GOOGLE_TEST_TIMESTAMP - 3600,
    ]);

    expect(fn () => app(VerifiesGoogleIdToken::class)->verify($token))
        ->toThrow(GoogleTokenVerificationException::class, 'The Google identity token is invalid.');
    Http::assertSentCount(1);
});

test('a malformed token is rejected without requesting Google signing keys', function () {
    Http::fake();

    expect(fn () => app(VerifiesGoogleIdToken::class)->verify('not-a-jwt'))
        ->toThrow(GoogleTokenVerificationException::class, 'The Google identity token is invalid.');
    Http::assertNothingSent();
});

test('verification fails safely when Google authentication is not configured', function () {
    config()->set('services.google.client_ids', []);
    Http::fake();

    expect(fn () => app(VerifiesGoogleIdToken::class)->verify('not-a-jwt'))
        ->toThrow(GoogleTokenVerificationException::class, 'Google authentication is not configured.');
    Http::assertNothingSent();
});

test('verification fails safely when Google signing keys are unavailable', function () {
    Http::fake([
        GOOGLE_CERTIFICATES_URL => Http::response([], 503),
    ]);
    $token = createGoogleTestToken($this->keyPair['private_key'], 'google-test-key');

    expect(fn () => app(VerifiesGoogleIdToken::class)->verify($token))
        ->toThrow(GoogleTokenVerificationException::class, 'Google authentication is temporarily unavailable.');
});
