<?php

namespace App\Exceptions;

use RuntimeException;

final class AppleAccountException extends RuntimeException
{
    public static function notLinked(): self
    {
        return new self('This Apple identity is not linked to a ChessX account.');
    }

    public static function emailNotVerified(): self
    {
        return new self('Apple must verify your email before ChessX can link this account.');
    }

    public static function emailUnavailable(): self
    {
        return new self('Apple did not provide an email for this new ChessX account.');
    }

    public static function conflictingLink(): self
    {
        return new self('This ChessX account is already linked to another Apple account.');
    }

    public static function inactive(): self
    {
        return new self('This ChessX account is not active.');
    }

    public static function unavailable(): self
    {
        return new self('Apple sign-in is temporarily unavailable. Please try again later.');
    }
}
