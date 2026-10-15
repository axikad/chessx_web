<?php

use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RoleController;
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

    Route::get('users/data', [UserController::class, 'legacyIndex'])->name('users.data');

    Route::prefix('management')->name('management.')->group(function () {
        Route::get('branding', [SiteSettingController::class, 'show'])->name('branding.show');
        Route::post('branding', [SiteSettingController::class, 'update'])->name('branding.update');
        Route::get('user-role-options', [UserController::class, 'roleOptions'])->name('users.role-options');
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
