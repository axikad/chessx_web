<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\MobileSessionResource;
use App\Models\MobileSession;
use App\Models\User;
use App\Services\Auth\MobileTokenService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MobileSessionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user instanceof User) {
            return ApiResponse::error('Authentication is required.', 'unauthenticated', Response::HTTP_UNAUTHORIZED);
        }

        $sessions = $user->mobileSessions()
            ->whereNull('revoked_at')
            ->where('refresh_token_expires_at', '>', now())
            ->orderByDesc('last_refreshed_at')
            ->orderByDesc('id')
            ->get();

        return ApiResponse::success(
            MobileSessionResource::collection($sessions)->resolve($request),
            'Mobile sessions retrieved successfully.',
        );
    }

    public function destroy(Request $request, int $mobileSession, MobileTokenService $tokens): JsonResponse
    {
        $user = $request->user();

        if (! $user instanceof User) {
            return ApiResponse::error('Authentication is required.', 'unauthenticated', Response::HTTP_UNAUTHORIZED);
        }

        $session = $tokens->revoke($user, $mobileSession);

        if (! $session instanceof MobileSession) {
            return ApiResponse::error(
                'The mobile session was not found.',
                'mobile_session_not_found',
                Response::HTTP_NOT_FOUND,
            );
        }

        return ApiResponse::success(
            ['session_id' => $session->getKey()],
            'Mobile session revoked successfully.',
        );
    }
}
