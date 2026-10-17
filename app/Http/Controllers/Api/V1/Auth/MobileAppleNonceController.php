<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\AppleNonceService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class MobileAppleNonceController extends Controller
{
    public function __invoke(AppleNonceService $nonces): JsonResponse
    {
        return ApiResponse::success(
            $nonces->issue(),
            'Apple sign-in nonce created successfully.',
        );
    }
}
