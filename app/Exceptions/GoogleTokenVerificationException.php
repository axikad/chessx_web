<?php

namespace App\Exceptions;

use RuntimeException;

final class GoogleTokenVerificationException extends RuntimeException
{
    private function __construct(
        string $message,
        public readonly int $status,
        public readonly string $errorCode,
    ) {
        parent::__construct($message);
    }

    public static function invalid(): self
    {
        return new self('The Google identity token is invalid.', 401, 'google_token_invalid');
    }

    public static function notConfigured(): self
    {
        return new self('Google authentication is not configured.', 503, 'google_auth_not_configured');
    }

    public static function unavailable(): self
    {
        return new self('Google authentication is temporarily unavailable.', 503, 'google_auth_unavailable');
    }
}
