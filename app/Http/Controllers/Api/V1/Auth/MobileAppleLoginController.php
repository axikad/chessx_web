<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Actions\FindOrLinkAppleUser;
use App\Exceptions\AppleAccountException;
use App\Exceptions\AppleTokenVerificationException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\MobileAppleLoginRequest;
use App\Http\Resources\Api\V1\MobileTokenResource;
use App\Services\Auth\MobileTokenService;
use App\Services\Auth\VerifiesAppleIdToken;
use App\Support\ApiResponse;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class MobileAppleLoginController extends Controller
{
    public function __invoke(
        MobileAppleLoginRequest $request,
        VerifiesAppleIdToken $appleTokens,
        FindOrLinkAppleUser $findOrLinkAppleUser,
        MobileTokenService $mobileTokens,
    ): JsonResponse {
        try {
            $identity = $appleTokens->verify(
                $request->string('id_token')->toString(),
                $request->string('nonce')->toString(),
            );
            $identity['name'] = $this->displayName(
                $request->validated('first_name'),
                $request->validated('last_name'),
            );
            $user = $findOrLinkAppleUser->handle($identity);
        } catch (AppleTokenVerificationException $exception) {
            return ApiResponse::error($exception->getMessage(), $exception->errorCode, $exception->status);
        } catch (AppleAccountException $exception) {
            throw ValidationException::withMessages(['apple' => $exception->getMessage()]);
        }

        $isNewPlayer = $user->wasRecentlyCreated;

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

    private function displayName(?string $firstName, ?string $lastName): ?string
    {
        $name = Str::of(implode(' ', array_filter([$firstName, $lastName])))
            ->squish()
            ->limit(255, '')
            ->value();

        return $name !== '' ? $name : null;
    }
}
