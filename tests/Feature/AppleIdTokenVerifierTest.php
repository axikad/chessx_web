<?php

use App\Exceptions\AppleTokenVerificationException;
use App\Services\Auth\VerifiesAppleIdToken;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

const APPLE_CERTIFICATES_URL = 'https://appleid.apple.com/auth/keys';
const APPLE_TEST_CLIENT_ID = 'com.chessx.mobile';
const APPLE_TEST_TIMESTAMP = 1792142400;
const APPLE_TEST_NONCE = 'apple-test-raw-nonce-1234567890';

function appleTestBase64UrlEncode(string $value): string
{
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

/** @return array<string, int|string> */
function appleTestOpenSslOptions(): array
{
    $options = [
        'private_key_bits' => 2048,
        'private_key_type' => OPENSSL_KEYTYPE_RSA,
    ];

    foreach ([
        dirname(PHP_BINARY).'/extras/ssl/openssl.cnf',
        dirname(PHP_BINARY).'/extras/openssl/openssl.cnf',
        dirname(PHP_BINARY).'/../apache/conf/openssl.cnf',
    ] as $configurationPath) {
        if (is_file($configurationPath)) {
            $options['config'] = $configurationPath;

            break;
        }
    }

    return $options;
}

/** @return array{private_key: OpenSSLAsymmetricKey, jwk: array<string, string>} */
function createAppleTestKeyPair(string $keyId): array
{
    $privateKey = openssl_pkey_new(appleTestOpenSslOptions());

    if (! $privateKey instanceof OpenSSLAsymmetricKey) {
        throw new RuntimeException('Unable to generate the Apple test RSA key.');
    }

    $details = openssl_pkey_get_details($privateKey);

    if (! is_array($details) || ! isset($details['rsa']['n'], $details['rsa']['e'])) {
        throw new RuntimeException('Unable to read the Apple test RSA public key.');
    }

    return [
        'private_key' => $privateKey,
        'jwk' => [
            'alg' => 'RS256',
            'e' => appleTestBase64UrlEncode($details['rsa']['e']),
            'kid' => $keyId,
            'kty' => 'RSA',
            'n' => appleTestBase64UrlEncode($details['rsa']['n']),
            'use' => 'sig',
        ],
    ];
}

/** @param array<string, mixed> $overrides */
function createAppleTestToken(OpenSSLAsymmetricKey $privateKey, string $keyId, array $overrides = []): string
{
    $claims = array_replace([
        'aud' => APPLE_TEST_CLIENT_ID,
        'email' => ' PLAYER@privaterelay.appleid.com ',
        'email_verified' => 'true',
        'exp' => APPLE_TEST_TIMESTAMP + 3600,
        'iat' => APPLE_TEST_TIMESTAMP,
        'is_private_email' => 'true',
        'iss' => 'https://appleid.apple.com',
        'nonce' => hash('sha256', APPLE_TEST_NONCE),
        'sub' => 'apple-player-123',
    ], $overrides);

    return JWT::encode($claims, $privateKey, 'RS256', $keyId);
}

function rememberAppleTestNonce(string $nonce): void
{
    Cache::put('auth.apple.nonce.'.hash('sha256', $nonce), true, 600);
}

beforeEach(function () {
    Cache::forget('auth.apple.certificates');
    rememberAppleTestNonce(APPLE_TEST_NONCE);
    Http::preventStrayRequests();
    config()->set('services.apple.client_ids', [APPLE_TEST_CLIENT_ID]);
    JWT::$timestamp = APPLE_TEST_TIMESTAMP;

    $this->keyPair = createAppleTestKeyPair('apple-test-key');
});

afterEach(function () {
    Cache::forget('auth.apple.certificates');
    Cache::forget('auth.apple.nonce.'.hash('sha256', APPLE_TEST_NONCE));
    JWT::$timestamp = null;
    JWT::$leeway = 0;
});

test('a valid Apple identity token and nonce are verified and normalized', function () {
    Http::fake([
        APPLE_CERTIFICATES_URL => Http::response(['keys' => [$this->keyPair['jwk']]]),
    ]);

    $identity = app(VerifiesAppleIdToken::class)->verify(
        createAppleTestToken($this->keyPair['private_key'], 'apple-test-key'),
        APPLE_TEST_NONCE,
    );

    expect($identity)->toBe([
        'sub' => 'apple-player-123',
        'email' => 'player@privaterelay.appleid.com',
        'email_verified' => true,
        'is_private_email' => true,
    ]);
    Http::assertSentCount(1);
});

test('Apple signing keys are reused from the cache', function () {
    Http::fake([
        APPLE_CERTIFICATES_URL => Http::response(['keys' => [$this->keyPair['jwk']]]),
    ]);
    $verifier = app(VerifiesAppleIdToken::class);
    $token = createAppleTestToken($this->keyPair['private_key'], 'apple-test-key');
    $secondNonce = 'apple-test-second-raw-nonce-123456';
    rememberAppleTestNonce($secondNonce);
    $secondToken = createAppleTestToken($this->keyPair['private_key'], 'apple-test-key', [
        'nonce' => hash('sha256', $secondNonce),
    ]);

    $verifier->verify($token, APPLE_TEST_NONCE);
    $verifier->verify($secondToken, $secondNonce);

    Http::assertSentCount(1);
});

test('an Apple identity token cannot reuse a consumed nonce', function () {
    Http::fake([
        APPLE_CERTIFICATES_URL => Http::response(['keys' => [$this->keyPair['jwk']]]),
    ]);
    $verifier = app(VerifiesAppleIdToken::class);
    $token = createAppleTestToken($this->keyPair['private_key'], 'apple-test-key');

    $verifier->verify($token, APPLE_TEST_NONCE);

    expect(fn () => $verifier->verify($token, APPLE_TEST_NONCE))
        ->toThrow(AppleTokenVerificationException::class, 'The Apple identity token is invalid.');
});

test('a rotated Apple signing key refreshes the cached key set once', function () {
    $oldKeyPair = createAppleTestKeyPair('old-apple-key');
    Cache::put('auth.apple.certificates', ['keys' => [$oldKeyPair['jwk']]], 3600);
    Http::fake([
        APPLE_CERTIFICATES_URL => Http::response(['keys' => [$this->keyPair['jwk']]]),
    ]);

    $identity = app(VerifiesAppleIdToken::class)->verify(
        createAppleTestToken($this->keyPair['private_key'], 'apple-test-key'),
        APPLE_TEST_NONCE,
    );

    expect($identity['sub'])->toBe('apple-player-123');
    Http::assertSentCount(1);
});

test('an Apple identity token with a mismatched nonce is rejected', function () {
    Http::fake([
        APPLE_CERTIFICATES_URL => Http::response(['keys' => [$this->keyPair['jwk']]]),
    ]);
    $token = createAppleTestToken($this->keyPair['private_key'], 'apple-test-key');

    expect(fn () => app(VerifiesAppleIdToken::class)->verify($token, 'different-raw-nonce-123456'))
        ->toThrow(AppleTokenVerificationException::class, 'The Apple identity token is invalid.');
});

test('an Apple identity token for another client is rejected', function () {
    Http::fake([
        APPLE_CERTIFICATES_URL => Http::response(['keys' => [$this->keyPair['jwk']]]),
    ]);
    $token = createAppleTestToken($this->keyPair['private_key'], 'apple-test-key', [
        'aud' => 'com.attacker.mobile',
    ]);

    expect(fn () => app(VerifiesAppleIdToken::class)->verify($token, APPLE_TEST_NONCE))
        ->toThrow(AppleTokenVerificationException::class, 'The Apple identity token is invalid.');
});

test('an Apple identity token from another issuer is rejected', function () {
    Http::fake([
        APPLE_CERTIFICATES_URL => Http::response(['keys' => [$this->keyPair['jwk']]]),
    ]);
    $token = createAppleTestToken($this->keyPair['private_key'], 'apple-test-key', [
        'iss' => 'https://attacker.example.com',
    ]);

    expect(fn () => app(VerifiesAppleIdToken::class)->verify($token, APPLE_TEST_NONCE))
        ->toThrow(AppleTokenVerificationException::class, 'The Apple identity token is invalid.');
});

test('an expired Apple identity token is rejected', function () {
    Http::fake([
        APPLE_CERTIFICATES_URL => Http::response(['keys' => [$this->keyPair['jwk']]]),
    ]);
    $token = createAppleTestToken($this->keyPair['private_key'], 'apple-test-key', [
        'exp' => APPLE_TEST_TIMESTAMP - 61,
        'iat' => APPLE_TEST_TIMESTAMP - 3600,
    ]);

    expect(fn () => app(VerifiesAppleIdToken::class)->verify($token, APPLE_TEST_NONCE))
        ->toThrow(AppleTokenVerificationException::class, 'The Apple identity token is invalid.');
});

test('verification fails safely when Apple authentication is not configured', function () {
    config()->set('services.apple.client_ids', []);
    Http::fake();

    expect(fn () => app(VerifiesAppleIdToken::class)->verify('not-a-jwt', APPLE_TEST_NONCE))
        ->toThrow(AppleTokenVerificationException::class, 'Apple authentication is not configured.');
    Http::assertNothingSent();
});

test('a malformed Apple token is rejected without requesting signing keys', function () {
    Http::fake();

    expect(fn () => app(VerifiesAppleIdToken::class)->verify('not-a-jwt', APPLE_TEST_NONCE))
        ->toThrow(AppleTokenVerificationException::class, 'The Apple identity token is invalid.');
    Http::assertNothingSent();
});

test('verification fails safely when Apple signing keys are unavailable', function () {
    Http::fake([
        APPLE_CERTIFICATES_URL => Http::response([], 503),
    ]);
    $token = createAppleTestToken($this->keyPair['private_key'], 'apple-test-key');

    expect(fn () => app(VerifiesAppleIdToken::class)->verify($token, APPLE_TEST_NONCE))
        ->toThrow(AppleTokenVerificationException::class, 'Apple authentication is temporarily unavailable.');
});
