<?php

namespace App\Exceptions;

use RuntimeException;

final class GoogleAccountException extends RuntimeException
{
    public static function notLinked(): self
    {
        return new self('No ChessX account exists for this verified Google email yet.');
    }

    public static function emailNotVerified(): self
    {
        return new self('Google must verify your email before ChessX can link this account.');
    }

    public static function conflictingLink(): self
    {
        return new self('This ChessX account is already linked to another Google account.');
    }

    public static function inactive(): self
    {
        return new self('This ChessX account is not active.');
    }

    public static function unavailable(): self
    {
        return new self('Google sign-in is temporarily unavailable. Please try again later.');
    }
}
