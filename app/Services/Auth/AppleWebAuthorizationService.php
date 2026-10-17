<?php

namespace App\Services\Auth;

use Illuminate\Contracts\Session\Session;

class AppleWebAuthorizationService
{
    private const STATE_SESSION_KEY = 'auth.apple.web_state';

    public function __construct(private AppleNonceService $nonces) {}

    /** @return array{nonce: string, nonce_hash: string, state: string} */
    public function issue(Session $session): array
    {
        $nonce = $this->nonces->issue()['nonce'];
        $state = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');

        $session->put(self::STATE_SESSION_KEY, hash('sha256', $state));

        return [
            'nonce' => $nonce,
            'nonce_hash' => hash('sha256', $nonce),
            'state' => $state,
        ];
    }

    public function consumeState(Session $session, #[\SensitiveParameter] string $state): bool
    {
        $expectedState = $session->pull(self::STATE_SESSION_KEY);

        return is_string($expectedState)
            && hash_equals($expectedState, hash('sha256', $state));
    }
}
