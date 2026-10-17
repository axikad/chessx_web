<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Exceptions\InvalidRefreshTokenException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\RefreshMobileTokenRequest;
use App\Http\Resources\Api\V1\MobileTokenResource;
use App\Services\Auth\MobileTokenService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class RefreshMobileTokenController extends Controller
{
    public function __invoke(RefreshMobileTokenRequest $request, MobileTokenService $tokens): JsonResponse
    {
        try {
            $result = $tokens->rotate(
                $request->validated('refresh_token'),
                $request->ip(),
                $request->userAgent(),
            );
        } catch (InvalidRefreshTokenException) {
            throw ValidationException::withMessages([
                'refresh_token' => 'The refresh token is invalid or has expired.',
            ]);
        }

        $result['is_new_user'] = false;

        return ApiResponse::success(
            (new MobileTokenResource($result))->resolve($request),
            'Tokens refreshed successfully.',
        );
    }
}
