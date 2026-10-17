<?php

namespace App\Providers;

use App\Models\SiteSetting;
use App\Models\User;
use App\Services\Auth\AppleIdTokenVerifier;
use App\Services\Auth\GoogleIdTokenVerifier;
use App\Services\Auth\VerifiesAppleIdToken;
use App\Services\Auth\VerifiesGoogleIdToken;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(VerifiesGoogleIdToken::class, GoogleIdTokenVerifier::class);
        $this->app->bind(VerifiesAppleIdToken::class, AppleIdTokenVerifier::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('mobile-login', function (Request $request): Limit {
            return Limit::perMinute(6)->by(Str::lower((string) $request->input('email')).'|'.$request->ip());
        });

        RateLimiter::for('mobile-refresh', function (Request $request): Limit {
            return Limit::perMinute(30)->by(hash('sha256', (string) $request->input('refresh_token')).'|'.$request->ip());
        });

        RateLimiter::for('mobile-google-login', function (Request $request): Limit {
            return Limit::perMinute(6)->by($request->ip());
        });

        RateLimiter::for('mobile-apple-login', function (Request $request): Limit {
            return Limit::perMinute(6)->by($request->ip());
        });

        RateLimiter::for('mobile-apple-nonce', function (Request $request): Limit {
            return Limit::perMinute(10)->by($request->ip());
        });

        RateLimiter::for('email-otp-request', function (Request $request): array {
            $email = Str::lower(trim((string) $request->input('email')));

            return [
                Limit::perMinute(3)->by('email-otp-request|'.$email.'|'.$request->ip()),
                Limit::perMinutes(10, 5)->by('email-otp-request-email|'.$email),
                Limit::perHour(10)->by('email-otp-request-ip|'.$request->ip()),
            ];
        });

        RateLimiter::for('email-otp-verify', function (Request $request): Limit {
            return Limit::perMinute(10)->by(
                'email-otp-verify|'.Str::lower(trim((string) $request->input('email'))).'|'.$request->ip(),
            );
        });

        Gate::before(function (User $user, string $ability): ?bool {
            if ($user->isSuperAdmin()) {
                return true;
            }

            return $user->hasPermission($ability) ? true : null;
        });

        View::composer('app', function ($view): void {
            $site = Schema::hasTable('site_settings') ? SiteSetting::current() : null;

            $view->with(['siteName' => $site?->name ?? config('app.name'), 'faviconUrl' => $site?->faviconUrl()]);
        });
    }
}
