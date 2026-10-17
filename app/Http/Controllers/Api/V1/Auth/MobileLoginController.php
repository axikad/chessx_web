<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\MobileLoginRequest;
use App\Http\Resources\Api\V1\MobileTokenResource;
use App\Models\User;
use App\Services\Auth\MobileTokenService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class MobileLoginController extends Controller
{
    public function __invoke(MobileLoginRequest $request, MobileTokenService $tokens): JsonResponse
    {
        if (! Auth::validate([
            'email' => $request->validated('email'),
            'password' => $request->validated('password'),
            'status' => 'active',
        ])) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        $user = Auth::getLastAttempted();

        if (! $user instanceof User) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        $result = $tokens->issue(
            $user,
            $request->safe()->only(['device_name', 'platform', 'device_id']),
            $request->ip(),
            $request->userAgent(),
        );
        $result['is_new_user'] = false;

        return ApiResponse::success(
            (new MobileTokenResource($result))->resolve($request),
            'Authentication successful.',
        );
    }
}
