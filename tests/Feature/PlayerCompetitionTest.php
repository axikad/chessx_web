<?php

use App\Enums\PlayerCompetitionStatus;
use App\Models\CompetitionTier;
use App\Models\PlayerCompetition;
use App\Models\Season;
use App\Models\User;
use Illuminate\Database\QueryException;

test('a standing eligibility record links a player and competition tier', function () {
    $user = User::factory()->create();
    $tier = CompetitionTier::factory()->create();

    $eligibility = PlayerCompetition::factory()->for($user)->for($tier, 'tier')->create();

    expect($eligibility->user->is($user))->toBeTrue()
        ->and($eligibility->tier->is($tier))->toBeTrue()
        ->and($eligibility->season)->toBeNull()
        ->and($eligibility->status)->toBe(PlayerCompetitionStatus::Locked)
        ->and($eligibility->unlocked_at)->toBeNull();
});

test('the database rejects duplicate standing eligibility for a player tier', function () {
    $user = User::factory()->create();
    $tier = CompetitionTier::factory()->create();
    PlayerCompetition::factory()->for($user)->for($tier, 'tier')->create();

    expect(fn () => PlayerCompetition::factory()->for($user)->for($tier, 'tier')->create())
        ->toThrow(QueryException::class);

    expect(PlayerCompetition::query()->count())->toBe(1);
});

test('the database allows one eligibility record per season', function () {
    $user = User::factory()->create();
    $tier = CompetitionTier::factory()->create();
    $firstSeason = Season::factory()->create();
    $secondSeason = Season::factory()->create();

    PlayerCompetition::factory()->for($user)->for($tier, 'tier')->for($firstSeason)->create();
    PlayerCompetition::factory()->for($user)->for($tier, 'tier')->for($secondSeason)->create();

    expect(PlayerCompetition::query()->count())->toBe(2);
});

test('the database rejects duplicate eligibility within the same season', function () {
    $user = User::factory()->create();
    $tier = CompetitionTier::factory()->create();
    $season = Season::factory()->create();
    PlayerCompetition::factory()->for($user)->for($tier, 'tier')->for($season)->create();

    expect(fn () => PlayerCompetition::factory()->for($user)->for($tier, 'tier')->for($season)->create())
        ->toThrow(QueryException::class);

    expect(PlayerCompetition::query()->count())->toBe(1);
});

test('eligibility lifecycle states cast status and unlock time', function () {
    $tier = CompetitionTier::factory()->create();
    $eligible = PlayerCompetition::factory()->for($tier, 'tier')->eligible()->create();
    $active = PlayerCompetition::factory()->for($tier, 'tier')->active()->create();
    $suspended = PlayerCompetition::factory()->for($tier, 'tier')->suspended()->create();

    expect($eligible->status)->toBe(PlayerCompetitionStatus::Eligible)
        ->and($eligible->unlocked_at)->not->toBeNull()
        ->and($active->status)->toBe(PlayerCompetitionStatus::Active)
        ->and($active->unlocked_at)->not->toBeNull()
        ->and($suspended->status)->toBe(PlayerCompetitionStatus::Suspended)
        ->and($suspended->unlocked_at)->not->toBeNull();
});
