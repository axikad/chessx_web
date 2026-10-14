<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests cannot access the user data endpoint', function () {
    $this->getJson('/users/data')->assertUnauthorized();
});

test('authenticated users can see database users', function () {
    $user = User::factory()->create([
        'name' => 'Database User',
        'email' => 'database@example.com',
    ]);

    $response = $this->actingAs($user)->getJson('/users/data');

    $response->assertOk()
        ->assertJsonPath('data.0.name', 'Database User')
        ->assertJsonPath('data.0.email', 'database@example.com')
        ->assertJsonPath('pagination.total', 1);
});
