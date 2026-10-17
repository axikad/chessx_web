<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Exceptions\EmailOtpException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\RequestEmailOtpRequest;
use App\Services\Auth\EmailOtpService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class RequestEmailOtpController extends Controller
{
    public function __invoke(RequestEmailOtpRequest $request, EmailOtpService $emailOtps): JsonResponse
    {
        try {
            $emailOtps->sendCode($request->validated('email'), $request->ip());
        } catch (EmailOtpException $exception) {
            return ApiResponse::error($exception->getMessage(), $exception->errorCode, $exception->status);
        }

        return ApiResponse::success(
            [
                'expires_in' => max(1, (int) config('auth.email_otp.expires', 10)) * 60,
                'resend_after' => max(1, (int) config('auth.email_otp.resend_after', 60)),
            ],
            'If this email can use Chess Mission, a login code has been sent.',
            Response::HTTP_ACCEPTED,
        );
    }
}
