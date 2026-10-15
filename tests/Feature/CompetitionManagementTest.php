<?php

use App\Enums\CompetitionTierCode;
use App\Enums\SeasonStatus;
use App\Models\City;
use App\Models\CompetitionRegion;
use App\Models\CompetitionTier;
use App\Models\LeaderboardSnapshot;
use App\Models\Permission;
use App\Models\PlayerCompetition;
use App\Models\PlayerRating;
use App\Models\Role;
use App\Models\Season;
use App\Models\User;
use App\Models\UserLocation;
use App\Services\RolePermissionService;
use Database\Seeders\CompetitionRegionSeeder;
use Database\Seeders\CompetitionTierSeeder;
use Database\Seeders\GeographySeeder;

function competitionManager(): User
{
    return User::factory()->for(Role::factory()->superAdmin())->create();
}

test('authorized administrators can view the competition hierarchy', function () {
    $this->seed([GeographySeeder::class, CompetitionTierSeeder::class, CompetitionRegionSeeder::class]);

    $this->actingAs(competitionManager())
        ->getJson(route('management.competitions.index'))
        ->assertOk()
        ->assertJsonCount(4, 'data')
        ->assertJsonPath('data.0.code', 'city')
        ->assertJsonPath('data.0.regionCount', 41)
        ->assertJsonPath('data.3.code', 'world');
});

test('authorized administrators can create update and delete seasons', function () {
    $actor = competitionManager();

    $created = $this->actingAs($actor)->postJson(route('management.seasons.store'), [
        'name' => 'ChessX Spring 2027',
        'starts_at' => '2027-01-01 00:00:00',
        'ends_at' => '2027-03-31 23:59:59',
        'status' => SeasonStatus::Scheduled->value,
    ])->assertCreated()->assertJsonPath('data.status', 'scheduled');
    $season = Season::query()->findOrFail($created->json('data.id'));

    $this->putJson(route('management.seasons.update', $season), [
        'name' => 'ChessX Spring Championship 2027',
        'starts_at' => '2027-01-01 00:00:00',
        'ends_at' => '2027-03-31 23:59:59',
        'status' => SeasonStatus::Scheduled->value,
    ])->assertOk()->assertJsonPath('data.status', 'scheduled');

    $this->deleteJson(route('management.seasons.destroy', $season))->assertOk();
    $this->assertDatabaseMissing('seasons', ['id' => $season->id]);
});

test('season date validation and linked eligibility deletion protection are enforced', function () {
    $actor = competitionManager();
    $season = Season::factory()->create();
    PlayerCompetition::factory()->for($season)->create();

    $this->actingAs($actor)->postJson(route('management.seasons.store'), [
        'name' => 'Invalid Season',
        'starts_at' => '2027-04-01 00:00:00',
        'ends_at' => '2027-03-01 00:00:00',
        'status' => SeasonStatus::Scheduled->value,
    ])->assertUnprocessable()->assertJsonValidationErrors('ends_at');

    $this->deleteJson(route('management.seasons.destroy', $season))->assertUnprocessable();
    $this->assertModelExists($season);
});

test('authorized administrators can update a rating without lowering its peak', function () {
    $rating = PlayerRating::factory()->established()->create(['highest_rating' => 1500]);

    $this->actingAs(competitionManager())
        ->patchJson(route('management.ratings.update', $rating), [
            'rating' => 1420,
            'provisional_rating' => false,
        ])->assertOk()
        ->assertJsonPath('data.rating', 1420)
        ->assertJsonPath('data.highestRating', 1500);

    $this->assertDatabaseHas('player_ratings', ['id' => $rating->id, 'rating' => 1420, 'highest_rating' => 1500]);
});

test('leaderboard generation ranks only players in the selected region', function () {
    $this->seed([GeographySeeder::class, CompetitionTierSeeder::class, CompetitionRegionSeeder::class]);
    $actor = competitionManager();
    $season = Season::factory()->create();
    $tier = CompetitionTier::query()->where('code', CompetitionTierCode::City)->firstOrFail();
    $ahmedabad = City::query()->where('name', 'Ahmedabad')->firstOrFail();
    $surat = City::query()->where('name', 'Surat')->firstOrFail();
    $region = CompetitionRegion::query()->where('city_id', $ahmedabad->id)->firstOrFail();
    $first = User::factory()->create();
    $second = User::factory()->create();
    $outside = User::factory()->create();
    UserLocation::factory()->for($first)->for($ahmedabad)->create();
    UserLocation::factory()->for($second)->for($ahmedabad)->create();
    UserLocation::factory()->for($outside)->for($surat)->create();
    PlayerRating::factory()->for($first)->for($tier, 'tier')->create(['rating' => 1400, 'games_played' => 8]);
    PlayerRating::factory()->for($second)->for($tier, 'tier')->create(['rating' => 1500, 'games_played' => 6]);
    PlayerRating::factory()->for($outside)->for($tier, 'tier')->create(['rating' => 1600, 'games_played' => 10]);

    $this->actingAs($actor)->postJson(route('management.leaderboards.generate'), [
        'season_id' => $season->id,
        'tier_id' => $tier->id,
        'region_id' => $region->id,
    ])->assertCreated()->assertJsonPath('data.created', 2);

    $snapshots = LeaderboardSnapshot::query()->orderBy('rank')->get();
    expect($snapshots)->toHaveCount(2)
        ->and($snapshots->pluck('user_id')->all())->toBe([$second->id, $first->id])
        ->and($snapshots->pluck('rank')->all())->toBe([1, 2]);
});

test('management endpoints enforce each domain read permission', function () {
    $role = Role::factory()->create();
    $actor = User::factory()->for($role)->create();
    $permission = Permission::factory()->create(['slug' => 'seasons.read']);
    app(RolePermissionService::class)->assign($role, $permission, $actor);

    $this->actingAs($actor)->getJson(route('management.seasons.index'))->assertOk();
    $this->getJson(route('management.competitions.index'))->assertForbidden();
    $this->getJson(route('management.ratings.index'))->assertForbidden();
    $this->getJson(route('management.leaderboards.index'))->assertForbidden();
    $this->postJson(route('management.seasons.store'), [])->assertForbidden();
});
