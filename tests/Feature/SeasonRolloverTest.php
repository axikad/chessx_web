<?php

use App\Enums\PlayerCompetitionStatus;
use App\Enums\SeasonStatus;
use App\Models\CompetitionTier;
use App\Models\PlayerCompetition;
use App\Models\PlayerRating;
use App\Models\Role;
use App\Models\Season;
use App\Models\User;

test('rollover completes the active season and carries standing eligibility forward', function () {
    $actor = User::factory()->for(Role::factory()->superAdmin())->create();
    $tier = CompetitionTier::factory()->create();
    $firstPlayer = User::factory()->create();
    $secondPlayer = User::factory()->create();
    $currentSeason = Season::factory()->active()->create();
    $nextSeason = Season::factory()->create();
    $firstStanding = PlayerCompetition::factory()->for($firstPlayer)->for($tier, 'tier')->eligible()->create();
    $secondStanding = PlayerCompetition::factory()->for($secondPlayer)->for($tier, 'tier')->create();
    $rating = PlayerRating::factory()->for($firstPlayer)->for($tier, 'tier')->established()->create();

    $this->actingAs($actor)
        ->postJson(route('management.seasons.rollover', $nextSeason))
        ->assertOk()
        ->assertJsonPath('data.completed_seasons', 1)
        ->assertJsonPath('data.created_eligibilities', 2);

    expect($currentSeason->refresh()->status)->toBe(SeasonStatus::Completed)
        ->and($nextSeason->refresh()->status)->toBe(SeasonStatus::Active)
        ->and($rating->refresh()->rating)->toBe(1384)
        ->and($rating->games_played)->toBe(20);

    $this->assertDatabaseHas('player_competitions', [
        'user_id' => $firstPlayer->id,
        'tier_id' => $tier->id,
        'season_id' => $nextSeason->id,
        'status' => PlayerCompetitionStatus::Eligible->value,
        'unlocked_at' => $firstStanding->unlocked_at,
    ]);
    $this->assertDatabaseHas('player_competitions', [
        'user_id' => $secondPlayer->id,
        'tier_id' => $tier->id,
        'season_id' => $nextSeason->id,
        'status' => PlayerCompetitionStatus::Locked->value,
        'unlocked_at' => $secondStanding->unlocked_at,
    ]);
});

test('season rollover is idempotent and preserves season-specific eligibility changes', function () {
    $actor = User::factory()->for(Role::factory()->superAdmin())->create();
    $tier = CompetitionTier::factory()->create();
    $player = User::factory()->create();
    $season = Season::factory()->create();
    PlayerCompetition::factory()->for($player)->for($tier, 'tier')->eligible()->create();

    $this->actingAs($actor)->postJson(route('management.seasons.rollover', $season))->assertOk();
    $seasonEligibility = PlayerCompetition::query()->where('season_id', $season->id)->firstOrFail();
    $seasonEligibility->update(['status' => PlayerCompetitionStatus::Suspended]);

    $this->postJson(route('management.seasons.rollover', $season))
        ->assertOk()
        ->assertJsonPath('data.completed_seasons', 0)
        ->assertJsonPath('data.created_eligibilities', 0);

    expect($seasonEligibility->refresh()->status)->toBe(PlayerCompetitionStatus::Suspended)
        ->and(PlayerCompetition::query()->where('season_id', $season->id)->count())->toBe(1);
});

test('completed or cancelled seasons cannot be activated by rollover', function (SeasonStatus $status) {
    $actor = User::factory()->for(Role::factory()->superAdmin())->create();
    $season = Season::factory()->create(['status' => $status]);

    $this->actingAs($actor)
        ->postJson(route('management.seasons.rollover', $season))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('season');
})->with([
    'completed' => SeasonStatus::Completed,
    'cancelled' => SeasonStatus::Cancelled,
]);

test('a second active season cannot be created outside rollover', function () {
    Season::factory()->active()->create();

    expect(fn () => Season::factory()->active()->create())
        ->toThrow(InvalidArgumentException::class, 'Only one season can be active at a time.');
});
