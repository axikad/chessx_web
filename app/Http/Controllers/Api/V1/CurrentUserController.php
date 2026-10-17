<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\UserResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CurrentUserController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->loadMissing(['profile', 'role', 'currentLocation']);

        return ApiResponse::success(
            (new UserResource($user))->resolve($request),
            'Current user retrieved successfully.',
        );
    }
}
