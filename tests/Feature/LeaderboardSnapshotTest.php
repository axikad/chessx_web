<?php

use App\Models\CompetitionRegion;
use App\Models\CompetitionTier;
use App\Models\LeaderboardSnapshot;
use App\Models\Season;
use App\Models\User;

test('a leaderboard snapshot captures a player standing', function () {
    $season = Season::factory()->create();
    $tier = CompetitionTier::factory()->create();
    $user = User::factory()->create();

    $snapshot = LeaderboardSnapshot::factory()
        ->for($season)
        ->for($tier, 'tier')
        ->for($user)
        ->create([
            'rating' => 1450,
            'rank' => 3,
            'games_played' => 24,
            'calculated_at' => '2027-02-01 12:00:00',
        ]);

    expect($snapshot->season->is($season))->toBeTrue()
        ->and($snapshot->tier->is($tier))->toBeTrue()
        ->and($snapshot->user->is($user))->toBeTrue()
        ->and($snapshot->region)->toBeNull()
        ->and($snapshot->rating)->toBe(1450)
        ->and($snapshot->rank)->toBe(3)
        ->and($snapshot->games_played)->toBe(24)
        ->and($snapshot->calculated_at->toDateTimeString())->toBe('2027-02-01 12:00:00');
});

test('a regional snapshot accepts a region from the selected tier', function () {
    $tier = CompetitionTier::factory()->create();
    $region = CompetitionRegion::factory()->for($tier, 'tier')->create();

    $snapshot = LeaderboardSnapshot::factory()
        ->for($tier, 'tier')
        ->for($region, 'region')
        ->create();

    expect($snapshot->region->is($region))->toBeTrue();
});

test('a snapshot rejects a region from another competition tier', function () {
    $cityTier = CompetitionTier::factory()->create();
    $stateTier = CompetitionTier::factory()->stateLeague()->create();
    $cityRegion = CompetitionRegion::factory()->for($cityTier, 'tier')->create();

    expect(fn () => LeaderboardSnapshot::factory()
        ->for($stateTier, 'tier')
        ->for($cityRegion, 'region')
        ->create())
        ->toThrow(LogicException::class, 'The leaderboard region must belong to the selected competition tier.');

    $this->assertDatabaseCount('leaderboard_snapshots', 0);
});

test('multiple calculation batches preserve leaderboard history', function () {
    $season = Season::factory()->create();
    $tier = CompetitionTier::factory()->create();
    $user = User::factory()->create();

    LeaderboardSnapshot::factory()->for($season)->for($tier, 'tier')->for($user)->create([
        'rating' => 1300,
        'calculated_at' => '2027-01-01 12:00:00',
    ]);
    LeaderboardSnapshot::factory()->for($season)->for($tier, 'tier')->for($user)->create([
        'rating' => 1325,
        'calculated_at' => '2027-01-08 12:00:00',
    ]);

    expect($season->leaderboardSnapshots()->count())->toBe(2)
        ->and($season->leaderboardSnapshots()->latest('calculated_at')->value('rating'))->toBe(1325);
});
