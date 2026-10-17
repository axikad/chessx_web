<?php

namespace App\Http\Controllers\Auth;

use App\Actions\FindOrLinkGoogleUser;
use App\Actions\ImportGoogleProfile;
use App\Exceptions\GoogleAccountException;
use App\Exceptions\GoogleTokenVerificationException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\GoogleLoginRequest;
use App\Services\Auth\VerifiesGoogleIdToken;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class GoogleAuthenticatedSessionController extends Controller
{
    public function __invoke(
        GoogleLoginRequest $request,
        VerifiesGoogleIdToken $googleTokens,
        FindOrLinkGoogleUser $findOrLinkGoogleUser,
        ImportGoogleProfile $importGoogleProfile,
    ): RedirectResponse {
        try {
            $identity = $googleTokens->verify($request->string('id_token')->toString());
            $user = $findOrLinkGoogleUser->handle($identity);
        } catch (GoogleTokenVerificationException|GoogleAccountException $exception) {
            throw ValidationException::withMessages([
                'google' => $exception->getMessage(),
            ]);
        }

        $isNewPlayer = $user->wasRecentlyCreated;
        $importGoogleProfile->handle($user, $identity);

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
}
