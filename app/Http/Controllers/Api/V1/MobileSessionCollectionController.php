<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Auth\MobileTokenService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MobileSessionCollectionController extends Controller
{
    public function __invoke(Request $request, MobileTokenService $tokens): JsonResponse
    {
        $user = $request->user();

        if (! $user instanceof User) {
            return ApiResponse::error('Authentication is required.', 'unauthenticated', Response::HTTP_UNAUTHORIZED);
        }

        return ApiResponse::success(
            ['revoked_sessions' => $tokens->revokeAll($user)],
            'All mobile sessions revoked successfully.',
        );
    }
}
