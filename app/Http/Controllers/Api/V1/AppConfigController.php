<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Auth\AppleSignInAvailability;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class AppConfigController extends Controller
{
    public function __invoke(AppleSignInAvailability $appleSignIn): JsonResponse
    {
        return ApiResponse::success([
            'auth' => [
                'apple' => [
                    'enabled' => $appleSignIn->nativeEnabled(),
                ],
            ],
        ], 'Application configuration retrieved successfully.');
    }
}
