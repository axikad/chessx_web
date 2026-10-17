<?php

use App\Enums\AuthProvider;
use App\Models\User;
use App\Models\UserAuthProvider;
use Illuminate\Database\QueryException;

test('an external identity belongs to a user and casts its provider', function () {
    $user = User::factory()->create();

    $identity = UserAuthProvider::factory()->for($user)->create([
        'provider_user_id' => '115892432201863498315',
    ]);

    expect($identity->user->is($user))->toBeTrue()
        ->and($identity->provider)->toBe(AuthProvider::Google)
        ->and($user->authProviders()->first()?->is($identity))->toBeTrue();
});

test('the database rejects one provider subject linked to multiple users', function () {
    UserAuthProvider::factory()->create([
        'provider' => AuthProvider::Google,
        'provider_user_id' => 'google-subject-123',
    ]);

    expect(fn () => UserAuthProvider::factory()->create([
        'provider' => AuthProvider::Google,
        'provider_user_id' => 'google-subject-123',
    ]))->toThrow(QueryException::class);

    expect(UserAuthProvider::query()->count())->toBe(1);
});

test('the database rejects multiple accounts from one provider for a user', function () {
    $user = User::factory()->create();
    UserAuthProvider::factory()->for($user)->create([
        'provider_user_id' => 'first-google-subject',
    ]);

    expect(fn () => UserAuthProvider::factory()->for($user)->create([
        'provider_user_id' => 'second-google-subject',
    ]))->toThrow(QueryException::class);

    expect($user->authProviders()->count())->toBe(1);
});

test('a user can link different authentication providers', function () {
    $user = User::factory()->create();

    UserAuthProvider::factory()->for($user)->create(['provider_user_id' => 'shared-subject']);
    UserAuthProvider::factory()->for($user)->apple()->create(['provider_user_id' => 'shared-subject']);

    $providers = $user->authProviders()->get()->pluck('provider');

    expect($providers)->toHaveCount(2)
        ->toContain(AuthProvider::Google)
        ->toContain(AuthProvider::Apple);
});
