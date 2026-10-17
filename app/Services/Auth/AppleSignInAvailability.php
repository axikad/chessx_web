<?php

namespace App\Services\Auth;

final class AppleSignInAvailability
{
    public function nativeEnabled(): bool
    {
        if (! config('services.apple.enabled', false)) {
            return false;
        }

        $clientIds = config('services.apple.native_client_ids', []);

        return is_array($clientIds) && collect($clientIds)
            ->contains(fn (mixed $clientId): bool => is_string($clientId) && trim($clientId) !== '');
    }
}
