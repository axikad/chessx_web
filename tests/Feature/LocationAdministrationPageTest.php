<?php

use App\Models\Role;
use App\Models\User;

it('requires authentication to view location administration routes', function (string $path) {
    $this->get($path)->assertRedirect(route('login'));
})->with([
    'geography' => '/location-management/geography',
    'location reviews' => '/location-management/reviews',
]);

it('renders location administration routes inside the ChessX application shell', function (string $path) {
    $administrator = User::factory()->for(Role::factory()->superAdmin())->create();

    $this->actingAs($administrator)
        ->get($path)
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('welcome')
            ->where('auth.permissions.0', '*'));
})->with([
    'geography' => '/location-management/geography',
    'location reviews' => '/location-management/reviews',
]);
