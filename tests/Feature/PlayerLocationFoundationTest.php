<?php

use App\Models\City;
use App\Models\LocationChangeHistory;
use App\Models\LocationChangeRequest;
use App\Models\User;
use App\Models\UserLocation;
use Illuminate\Database\QueryException;

test('a player can have one current location and multiple historical locations', function () {
    $user = User::factory()->create();
    $current = UserLocation::factory()->for($user)->create();
    $historical = UserLocation::factory()->count(2)->for($user)->state(['is_current' => false])->create();

    expect($user->currentLocation->is($current))->toBeTrue()
        ->and($user->locations()->count())->toBe(3)
        ->and($historical->every(fn (UserLocation $location): bool => ! $location->is_current))->toBeTrue();
});

test('the database rejects a second current location for the same player', function () {
    $user = User::factory()->create();
    UserLocation::factory()->for($user)->create();

    expect(fn () => UserLocation::factory()->for($user)->create())
        ->toThrow(QueryException::class);

    expect(UserLocation::query()->where('user_id', $user->id)->count())->toBe(1);
});

test('the database rejects a second pending location request for the same player', function () {
    $user = User::factory()->create();
    LocationChangeRequest::factory()->for($user)->create();

    expect(fn () => LocationChangeRequest::factory()->for($user)->create())
        ->toThrow(QueryException::class);

    expect(LocationChangeRequest::query()->where('user_id', $user->id)->count())->toBe(1);
});

test('completed location requests do not prevent a later pending request', function () {
    $user = User::factory()->create();
    LocationChangeRequest::factory()->for($user)->create(['status' => 'approved']);

    $pending = LocationChangeRequest::factory()->for($user)->create();

    $this->assertModelExists($pending);
});

test('location history links the player cities and change request', function () {
    $user = User::factory()->create();
    $oldCity = City::factory()->create();
    $newCity = City::factory()->create();
    $request = LocationChangeRequest::factory()->for($user)->create([
        'old_city_id' => $oldCity->id,
        'new_city_id' => $newCity->id,
        'status' => 'approved',
    ]);

    $history = LocationChangeHistory::factory()->for($user)->create([
        'old_city_id' => $oldCity->id,
        'new_city_id' => $newCity->id,
        'change_request_id' => $request->id,
    ]);

    expect($history->user->is($user))->toBeTrue()
        ->and($history->oldCity->is($oldCity))->toBeTrue()
        ->and($history->newCity->is($newCity))->toBeTrue()
        ->and($history->changeRequest->is($request))->toBeTrue();
});
