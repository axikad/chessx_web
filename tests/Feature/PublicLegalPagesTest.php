<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('renders each legal page publicly', function (string $routeName, string $component) {
    $this->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component($component)
            ->where('auth.user', null)
            ->where('site.name', 'Chess Mission'));
})->with([
    'privacy policy' => ['privacy-policy', 'public/privacy-policy'],
    'terms of service' => ['terms', 'public/terms'],
]);

it('keeps legal pages available to authenticated users', function (string $routeName) {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.user.id', $user->id));
})->with(['privacy-policy', 'terms']);
