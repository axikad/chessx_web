<?php

use App\Http\Controllers\Api\V1\AppConfigController;
use App\Http\Controllers\Api\V1\Auth\MobileAppleLoginController;
use App\Http\Controllers\Api\V1\Auth\MobileAppleNonceController;
use App\Http\Controllers\Api\V1\Auth\MobileGoogleLoginController;
use App\Http\Controllers\Api\V1\Auth\MobileLoginController;
use App\Http\Controllers\Api\V1\Auth\RefreshMobileTokenController;
use App\Http\Controllers\Api\V1\Auth\RequestEmailOtpController;
use App\Http\Controllers\Api\V1\Auth\VerifyEmailOtpController;
use App\Http\Controllers\Api\V1\CurrentUserController;
use App\Http\Controllers\Api\V1\GeographyController;
use App\Http\Controllers\Api\V1\MobileSessionCollectionController;
use App\Http\Controllers\Api\V1\MobileSessionController;
use App\Http\Controllers\Api\V1\PlayerLeagueController;
use App\Http\Controllers\Api\V1\PlayerLocationController;
use App\Http\Controllers\Api\V1\PlayerProfileController;
use App\Http\Controllers\Api\V1\UsernameAvailabilityController;
use App\Http\Middleware\EnsureActiveApiUser;
use App\Http\Middleware\EnsureMobileAppleSignInIsEnabled;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpFoundation\Response;

Route::prefix('v1')->name('api.v1.')->group(function (): void {
    Route::get('app-config', AppConfigController::class)->name('app-config.show');

    Route::prefix('auth')->name('auth.')->group(function (): void {
        Route::post('login', MobileLoginController::class)->middleware('throttle:mobile-login')->name('login');
        Route::post('google', MobileGoogleLoginController::class)->middleware('throttle:mobile-google-login')->name('google');
        Route::post('apple', MobileAppleLoginController::class)
            ->middleware([EnsureMobileAppleSignInIsEnabled::class, 'throttle:mobile-apple-login'])
            ->name('apple');
        Route::post('apple/nonce', MobileAppleNonceController::class)
            ->middleware([EnsureMobileAppleSignInIsEnabled::class, 'throttle:mobile-apple-nonce'])
            ->name('apple.nonce');
        Route::post('email-otp/request', RequestEmailOtpController::class)->middleware('throttle:email-otp-request')->name('email-otp.request');
        Route::post('email-otp/verify', VerifyEmailOtpController::class)->middleware('throttle:email-otp-verify')->name('email-otp.verify');
        Route::post('refresh', RefreshMobileTokenController::class)->middleware('throttle:mobile-refresh')->name('refresh');
    });

    Route::middleware(['auth:sanctum', EnsureActiveApiUser::class])->group(function (): void {
        Route::get('me', CurrentUserController::class)->name('me.show');
        Route::match(['post', 'patch'], 'me/profile', PlayerProfileController::class)->name('me.profile.update');
        Route::get('me/sessions', [MobileSessionController::class, 'index'])->name('me.sessions.index');
        Route::delete('me/sessions/{mobileSession}', [MobileSessionController::class, 'destroy'])
            ->whereNumber('mobileSession')
            ->name('me.sessions.destroy');
        Route::delete('me/sessions', MobileSessionCollectionController::class)->name('me.sessions.destroy-all');
        Route::get('usernames/check', UsernameAvailabilityController::class)->name('usernames.check');
        Route::get('leagues', [PlayerLeagueController::class, 'index'])->name('leagues.index');
        Route::get('leagues/{competitionTier:code}', [PlayerLeagueController::class, 'show'])->name('leagues.show');

        Route::prefix('player/location')->name('player.location.')->controller(PlayerLocationController::class)->group(function (): void {
            Route::get('/', 'show')->name('show');
            Route::post('resolve', 'resolve')->name('resolve');
            Route::post('confirm', 'confirm')->name('confirm');
            Route::post('change-requests', 'requestChange')->name('change-requests.store');
        });

        Route::prefix('geography')->name('geography.')->controller(GeographyController::class)->group(function (): void {
            Route::get('countries', 'countries')->name('countries');
            Route::get('states', 'states')->name('states');
            Route::get('cities', 'cities')->name('cities');
        });
    });
});

Route::any('v1/{path}', fn () => ApiResponse::error(
    'The requested resource was not found.',
    'not_found',
    Response::HTTP_NOT_FOUND,
))->where('path', '.*');
