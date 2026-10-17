<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\Auth\AppleWebAuthorizationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request, AppleWebAuthorizationService $appleWebAuthorization): Response
    {
        $appleClientId = config('services.apple.web_client_id');
        $appleRedirectUri = config('services.apple.web_redirect_uri');
        $appleAuthorization = null;

        if (is_string($appleClientId) && $appleClientId !== ''
            && is_string($appleRedirectUri) && $appleRedirectUri !== '') {
            $appleAuthorization = [
                'clientId' => $appleClientId,
                'redirectUri' => $appleRedirectUri,
                ...$appleWebAuthorization->issue($request->session()),
            ];
        }

        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'googleClientId' => config('services.google.web_client_id'),
            'appleAuthorization' => $appleAuthorization,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
