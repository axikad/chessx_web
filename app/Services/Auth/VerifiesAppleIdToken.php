<?php

namespace App\Services\Auth;

interface VerifiesAppleIdToken
{
    /**
     * @return array{sub: string, email: ?string, email_verified: bool, is_private_email: bool}
     */
    public function verify(#[\SensitiveParameter] string $idToken, #[\SensitiveParameter] string $nonce): array;
}
