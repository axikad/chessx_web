<?php

use App\Http\Controllers\CompetitionController;
use App\Http\Controllers\CompetitionRegionController;
use App\Http\Controllers\GeographyController;
use App\Http\Controllers\GeographyManagementController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\LocationChangeRequestController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PlayerLocationController;
use App\Http\Controllers\PlayerProfileController;
use App\Http\Controllers\PlayerRatingController;
use App\Http\Controllers\PromotionRecordController;
use App\Http\Controllers\PromotionRuleController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SeasonController;
use App\Http\Controllers\SiteSettingController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::get('/', function () {
        return Inertia::render('welcome');
    })->name('home');

    Route::get('dashboard', function () {
        return Inertia::render('welcome');
    })->name('dashboard');

    Route::get('onboarding', function () {
        return Inertia::render('welcome');
    })->name('onboarding');

    Route::get('users/data', [UserController::class, 'legacyIndex'])->name('users.data');
    Route::get('player/location', [PlayerLocationController::class, 'show'])->name('player.location.show');
    Route::post('player/location/resolve', [PlayerLocationController::class, 'resolve'])->name('player.location.resolve');
    Route::post('player/location/confirm', [PlayerLocationController::class, 'confirm'])->name('player.location.confirm');
    Route::post('player/location/change-requests', [PlayerLocationController::class, 'requestChange'])->name('player.location.change-requests.store');
    Route::get('geography/countries', [GeographyController::class, 'countries'])->name('geography.countries');
    Route::get('geography/states', [GeographyController::class, 'states'])->name('geography.states');
    Route::get('geography/cities', [GeographyController::class, 'cities'])->name('geography.cities');

    Route::prefix('management')->name('management.')->group(function () {
        Route::get('branding', [SiteSettingController::class, 'show'])->name('branding.show');
        Route::post('branding', [SiteSettingController::class, 'update'])->name('branding.update');
        Route::get('user-role-options', [UserController::class, 'roleOptions'])->name('users.role-options');
        Route::get('location-change-requests', [LocationChangeRequestController::class, 'index'])->name('location-change-requests.index');
        Route::patch('location-change-requests/{locationChangeRequest}', [LocationChangeRequestController::class, 'update'])->name('location-change-requests.update');
        Route::get('geography/countries', [GeographyManagementController::class, 'countries'])->name('geography.countries.index');
        Route::post('geography/countries', [GeographyManagementController::class, 'storeCountry'])->name('geography.countries.store');
        Route::put('geography/countries/{country}', [GeographyManagementController::class, 'updateCountry'])->name('geography.countries.update');
        Route::delete('geography/countries/{country}', [GeographyManagementController::class, 'destroyCountry'])->name('geography.countries.destroy');
        Route::get('geography/states', [GeographyManagementController::class, 'states'])->name('geography.states.index');
        Route::post('geography/states', [GeographyManagementController::class, 'storeState'])->name('geography.states.store');
        Route::put('geography/states/{state}', [GeographyManagementController::class, 'updateState'])->name('geography.states.update');
        Route::delete('geography/states/{state}', [GeographyManagementController::class, 'destroyState'])->name('geography.states.destroy');
        Route::get('geography/cities', [GeographyManagementController::class, 'cities'])->name('geography.cities.index');
        Route::post('geography/cities', [GeographyManagementController::class, 'storeCity'])->name('geography.cities.store');
        Route::put('geography/cities/{city}', [GeographyManagementController::class, 'updateCity'])->name('geography.cities.update');
        Route::delete('geography/cities/{city}', [GeographyManagementController::class, 'destroyCity'])->name('geography.cities.destroy');
        Route::get('competitions', [CompetitionController::class, 'index'])->name('competitions.index');
        Route::post('competitions/{competitionTier}/artwork', [CompetitionController::class, 'updateArtwork'])->name('competitions.artwork.update');
        Route::apiResource('competition-regions', CompetitionRegionController::class)
            ->parameters(['competition-regions' => 'competitionRegion'])
            ->except('show');
        Route::post('seasons/{season}/rollover', [SeasonController::class, 'rollover'])->name('seasons.rollover');
        Route::apiResource('seasons', SeasonController::class);
        Route::get('ratings', [PlayerRatingController::class, 'index'])->name('ratings.index');
        Route::patch('ratings/{playerRating}', [PlayerRatingController::class, 'update'])->name('ratings.update');
        Route::get('leaderboards', [LeaderboardController::class, 'index'])->name('leaderboards.index');
        Route::post('leaderboards/generate', [LeaderboardController::class, 'generate'])->name('leaderboards.generate');
        Route::get('promotion-rules', [PromotionRuleController::class, 'index'])->name('promotion-rules.index');
        Route::patch('promotion-rules/{promotionRule}', [PromotionRuleController::class, 'update'])->name('promotion-rules.update');
        Route::get('promotion-records', [PromotionRecordController::class, 'index'])->name('promotion-records.index');
        Route::patch('promotion-records/{promotionRecord}', [PromotionRecordController::class, 'update'])->name('promotion-records.update');
        Route::put('users/{user}/restore', [UserController::class, 'restore'])->name('users.restore');
        Route::get('users/{user}/profile', [PlayerProfileController::class, 'show'])->name('users.profile.show');
        Route::patch('users/{user}/profile', [PlayerProfileController::class, 'update'])->name('users.profile.update');
        Route::apiResource('users', UserController::class);
        Route::put('roles/{role}/permissions', [RoleController::class, 'syncPermissions'])->name('roles.permissions.update');
        Route::apiResource('roles', RoleController::class);
        Route::apiResource('permissions', PermissionController::class);
    });

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

Route::middleware(['auth'])->get('/{any}', function () {
    return Inertia::render('welcome');
})->where('any', '.*');
