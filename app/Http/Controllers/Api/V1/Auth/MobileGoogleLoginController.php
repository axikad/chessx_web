<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Actions\FindOrLinkGoogleUser;
use App\Actions\ImportGoogleProfile;
use App\Exceptions\GoogleAccountException;
use App\Exceptions\GoogleTokenVerificationException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\MobileGoogleLoginRequest;
use App\Http\Resources\Api\V1\MobileTokenResource;
use App\Services\Auth\MobileTokenService;
use App\Services\Auth\VerifiesGoogleIdToken;
use App\Support\ApiResponse;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class MobileGoogleLoginController extends Controller
{
    public function __invoke(
        MobileGoogleLoginRequest $request,
        VerifiesGoogleIdToken $googleTokens,
        FindOrLinkGoogleUser $findOrLinkGoogleUser,
        ImportGoogleProfile $importGoogleProfile,
        MobileTokenService $mobileTokens,
    ): JsonResponse {
        try {
            $identity = $googleTokens->verify($request->string('id_token')->toString());
            $user = $findOrLinkGoogleUser->handle($identity);
        } catch (GoogleTokenVerificationException $exception) {
            return ApiResponse::error($exception->getMessage(), $exception->errorCode, $exception->status);
        } catch (GoogleAccountException $exception) {
            throw ValidationException::withMessages([
                'google' => $exception->getMessage(),
            ]);
        }

        $isNewPlayer = $user->wasRecentlyCreated;
        $importGoogleProfile->handle($user, $identity);

        if ($isNewPlayer) {
            event(new Registered($user));
        }

        $result = $mobileTokens->issue(
            $user,
            $request->safe()->only(['device_name', 'platform', 'device_id']),
            $request->ip(),
            $request->userAgent(),
        );
        $result['is_new_user'] = $isNewPlayer;

        return ApiResponse::success(
            (new MobileTokenResource($result))->resolve($request),
            'Authentication successful.',
        );
    }
}
