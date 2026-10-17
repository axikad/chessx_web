<?php

namespace App\Http\Middleware;

use App\Services\Auth\AppleSignInAvailability;
use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureMobileAppleSignInIsEnabled
{
    public function __construct(private AppleSignInAvailability $appleSignIn) {}

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->appleSignIn->nativeEnabled()) {
            return ApiResponse::error(
                'Apple authentication is not configured.',
                'apple_auth_not_configured',
                Response::HTTP_SERVICE_UNAVAILABLE,
            );
        }

        return $next($request);
    }
}
