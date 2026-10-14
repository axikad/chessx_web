<?php

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

    Route::get('users/data', [UserController::class, 'index'])->name('users.data');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

Route::middleware(['auth'])->get('/{any}', function () {
    return Inertia::render('welcome');
})->where('any', '.*');
