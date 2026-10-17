<?php

namespace App\Exceptions;

use RuntimeException;

final class AppleTokenVerificationException extends RuntimeException
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
        return new self('The Apple identity token is invalid.', 401, 'apple_token_invalid');
    }

    public static function notConfigured(): self
    {
        return new self('Apple authentication is not configured.', 503, 'apple_auth_not_configured');
    }

    public static function unavailable(): self
    {
        return new self('Apple authentication is temporarily unavailable.', 503, 'apple_auth_unavailable');
    }
}
