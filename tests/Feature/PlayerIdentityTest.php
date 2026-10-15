<?php

use App\Models\User;
use App\Models\UserProfile;

test('new users receive unique identity values when none are supplied', function () {
    $firstUser = User::factory()->create(['uuid' => null, 'username' => null, 'name' => 'First Player']);
    $secondUser = User::factory()->create(['uuid' => null, 'username' => null, 'name' => 'First Player']);

    expect($firstUser->uuid)
        ->not->toBeNull()
        ->not->toBe($secondUser->uuid)
        ->and($firstUser->username)
        ->toStartWith('first_player_')
        ->not->toBe($secondUser->username);
});

test('a user has one player profile with a cast date of birth', function () {
    $user = User::factory()->create();
    $profile = UserProfile::factory()->for($user)->create([
        'display_name' => 'Chess Player',
        'date_of_birth' => '2000-05-10',
    ]);

    expect($user->profile->is($profile))->toBeTrue()
        ->and($profile->user->is($user))->toBeTrue()
        ->and($profile->date_of_birth->toDateString())->toBe('2000-05-10');
});

test('archiving a user preserves the player profile for account recovery', function () {
    $user = User::factory()->create();
    $profile = UserProfile::factory()->for($user)->create();

    $user->delete();

    $this->assertModelExists($profile);

    $user->forceDelete();

    $this->assertModelMissing($profile);
});
