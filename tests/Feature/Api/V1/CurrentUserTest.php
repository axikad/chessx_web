<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('returns 401 when the mobile access token is missing', function () {
    $this->getJson('/api/v1/me')->assertUnauthorized();
});

it('returns the authenticated active player profile', function () {
    $user = User::factory()->create([
        'name' => 'Mobile Player',
        'username' => 'mobile_player',
        'email' => 'mobile@example.test',
        'avatar_path' => null,
        'status' => 'active',
    ]);
    $user->profile()->create([
        'display_name' => 'Mobile Champion',
        'language' => 'en',
        'timezone' => 'Asia/Kolkata',
        'profile_visibility' => 'public',
    ]);
    Sanctum::actingAs($user, ['mobile']);

    $response = $this->getJson('/api/v1/me');

    $response->assertOk()->assertJson([
        'data' => [
            'id' => $user->uuid,
            'username' => 'mobile_player',
            'name' => 'Mobile Player',
            'email' => 'mobile@example.test',
            'avatar_url' => null,
            'status' => 'active',
            'profile' => [
                'display_name' => 'Mobile Champion',
                'language' => 'en',
                'timezone' => 'Asia/Kolkata',
                'date_of_birth' => null,
                'visibility' => 'public',
            ],
        ],
    ]);
});

it('returns 403 when an authenticated mobile account is inactive', function () {
    $user = User::factory()->create(['status' => 'inactive']);
    Sanctum::actingAs($user, ['mobile']);

    $response = $this->getJson('/api/v1/me');

    $response->assertForbidden()->assertExactJson([
        'success' => false,
        'message' => 'This Chess Mission account is not active.',
        'code' => 'account_inactive',
    ]);
});
