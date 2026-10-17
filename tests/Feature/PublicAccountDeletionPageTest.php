<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('renders account deletion instructions publicly', function () {
    $this->get(route('account-deletion'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/account-deletion')
            ->where('auth.user', null));
});

it('shows account deletion instructions to authenticated users', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('account-deletion'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/account-deletion')
            ->where('auth.user.id', $user->id));
});
