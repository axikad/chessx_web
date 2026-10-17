<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Exceptions\EmailOtpException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\VerifyEmailOtpRequest;
use App\Http\Resources\Api\V1\MobileTokenResource;
use App\Services\Auth\EmailOtpService;
use App\Services\Auth\MobileTokenService;
use App\Support\ApiResponse;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class VerifyEmailOtpController extends Controller
{
    public function __invoke(
        VerifyEmailOtpRequest $request,
        EmailOtpService $emailOtps,
        MobileTokenService $mobileTokens,
    ): JsonResponse {
        try {
            $result = $emailOtps->verifyCode(
                $request->validated('email'),
                $request->validated('otp'),
            );
        } catch (EmailOtpException $exception) {
            if ($exception->status === 422) {
                throw ValidationException::withMessages([
                    $exception->field => $exception->getMessage(),
                ]);
            }

            return ApiResponse::error($exception->getMessage(), $exception->errorCode, $exception->status);
        }

        $tokens = $mobileTokens->issue(
            $result['user'],
            $request->safe()->only(['device_name', 'platform', 'device_id']),
            $request->ip(),
            $request->userAgent(),
        );
        $tokens['is_new_user'] = $result['is_new_player'];

        if ($result['is_new_player']) {
            event(new Registered($result['user']));
        }

        return ApiResponse::success(
            (new MobileTokenResource($tokens))->resolve($request),
            'Authentication successful.',
        );
    }
}
