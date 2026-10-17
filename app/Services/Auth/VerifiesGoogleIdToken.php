<?php

namespace App\Services\Auth;

interface VerifiesGoogleIdToken
{
    /**
     * @return array{sub: string, email: ?string, email_verified: bool, name: ?string, picture: ?string}
     */
    public function verify(#[\SensitiveParameter] string $idToken): array;
}
