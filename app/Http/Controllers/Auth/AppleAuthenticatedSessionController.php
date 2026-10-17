<?php

namespace App\Http\Controllers\Auth;

use App\Actions\FindOrLinkAppleUser;
use App\Exceptions\AppleAccountException;
use App\Exceptions\AppleTokenVerificationException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\AppleLoginRequest;
use App\Services\Auth\AppleWebAuthorizationService;
use App\Services\Auth\VerifiesAppleIdToken;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AppleAuthenticatedSessionController extends Controller
{
    public function __invoke(
        AppleLoginRequest $request,
        AppleWebAuthorizationService $webAuthorization,
        VerifiesAppleIdToken $appleTokens,
        FindOrLinkAppleUser $findOrLinkAppleUser,
    ): RedirectResponse {
        if (! $webAuthorization->consumeState($request->session(), $request->string('state')->toString())) {
            throw ValidationException::withMessages([
                'apple' => 'The Apple sign-in session is invalid or has expired. Please try again.',
            ]);
        }

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
        } catch (AppleTokenVerificationException|AppleAccountException $exception) {
            throw ValidationException::withMessages([
                'apple' => $exception->getMessage(),
            ]);
        }

        $isNewPlayer = $user->wasRecentlyCreated;

        if ($isNewPlayer) {
            event(new Registered($user));
        }

        Auth::guard('web')->login($user);
        $request->session()->regenerate();
        $user->forceFill(['last_login_at' => now()])->save();

        if ($isNewPlayer) {
            return to_route('onboarding');
        }

        return redirect()->intended(route('dashboard', absolute: false));
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
