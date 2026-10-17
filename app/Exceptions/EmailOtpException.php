<?php

namespace App\Exceptions;

use RuntimeException;

final class EmailOtpException extends RuntimeException
{
    private function __construct(
        string $message,
        public readonly int $status,
        public readonly string $errorCode,
        public readonly string $field,
    ) {
        parent::__construct($message);
    }

    public static function invalid(): self
    {
        return new self('The login code is invalid or has expired.', 422, 'email_otp_invalid', 'otp');
    }

    public static function inactive(): self
    {
        return new self('This ChessX account is not active.', 422, 'account_inactive', 'email');
    }

    public static function unavailable(): self
    {
        return new self('Email login is temporarily unavailable.', 503, 'email_otp_unavailable', 'email');
    }

    public static function deliveryUnavailable(): self
    {
        return new self('Unable to send a login code right now. Please try again later.', 503, 'email_otp_delivery_unavailable', 'email');
    }
}
