<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('renders the public landing page for guests', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/home')
            ->where('auth.user', null)
            ->where('site.name', 'Chess Mission'));
});

it('keeps the Apex application on the authenticated dashboard', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->where('auth.user.id', $user->id));
});
