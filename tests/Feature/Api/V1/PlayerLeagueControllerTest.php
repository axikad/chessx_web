<?php

use App\Enums\CompetitionTierCode;
use App\Enums\PlayerCompetitionStatus;
use App\Enums\SeasonStatus;
use App\Models\City;
use App\Models\CompetitionRegion;
use App\Models\CompetitionTier;
use App\Models\Country;
use App\Models\PlayerCompetition;
use App\Models\PlayerRating;
use App\Models\Season;
use App\Models\State;
use App\Models\User;
use App\Models\UserLocation;
use Database\Seeders\CompetitionTierSeeder;
use Database\Seeders\PromotionRuleSeeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    config()->set('filesystems.disks.public.url', 'https://api.chessx.test/storage');
});

/**
 * @return array{user: User, tiers: Collection<string, CompetitionTier>, city: City}
 */
function playerLeagueApiFoundation(): array
{
    test()->seed(CompetitionTierSeeder::class);
    test()->seed(PromotionRuleSeeder::class);
    $tiers = CompetitionTier::query()->get()->keyBy(fn (CompetitionTier $tier): string => $tier->code->value);
    $country = Country::factory()->create(['name' => 'India', 'iso2' => 'IN', 'iso3' => 'IND']);
    $state = State::factory()->for($country)->create(['name' => 'Gujarat', 'code' => 'GJ']);
    $city = City::factory()->for($state)->create(['name' => 'Surat']);

    CompetitionRegion::query()->create([
        'tier_id' => $tiers[CompetitionTierCode::City->value]->getKey(),
        'city_id' => $city->getKey(),
        'name' => 'Surat City League',
        'status' => 'active',
    ]);
    CompetitionRegion::query()->create([
        'tier_id' => $tiers[CompetitionTierCode::State->value]->getKey(),
        'state_id' => $state->getKey(),
        'name' => 'Gujarat State League',
        'status' => 'active',
    ]);
    CompetitionRegion::query()->create([
        'tier_id' => $tiers[CompetitionTierCode::National->value]->getKey(),
        'country_id' => $country->getKey(),
        'name' => 'India National League',
        'status' => 'active',
    ]);
    CompetitionRegion::query()->create([
        'tier_id' => $tiers[CompetitionTierCode::World->value]->getKey(),
        'name' => 'World League',
        'status' => 'active',
    ]);

    $user = User::factory()->create(['status' => 'active']);
    UserLocation::factory()->for($user)->for($city)->create();

    foreach ($tiers as $tier) {
        PlayerCompetition::factory()->for($user)->for($tier, 'tier')->create([
            'status' => $tier->code === CompetitionTierCode::City
                ? PlayerCompetitionStatus::Eligible
                : PlayerCompetitionStatus::Locked,
            'unlocked_at' => $tier->code === CompetitionTierCode::City ? now() : null,
        ]);
        PlayerRating::factory()->for($user)->for($tier, 'tier')->create([
            'rating' => $tier->code === CompetitionTierCode::City ? 1250 : 1200,
            'games_played' => $tier->code === CompetitionTierCode::City ? 5 : 0,
            'wins' => $tier->code === CompetitionTierCode::City ? 3 : 0,
            'draws' => 1,
            'losses' => $tier->code === CompetitionTierCode::City ? 1 : 0,
            'highest_rating' => $tier->code === CompetitionTierCode::City ? 1260 : 1200,
        ]);
    }

    return compact('user', 'tiers', 'city');
}

it('returns 401 when a player requests leagues without an access token', function () {
    $this->getJson('/api/v1/leagues')->assertUnauthorized();
});

it('returns personalized staged leagues and promotion progress', function () {
    ['user' => $user, 'tiers' => $tiers, 'city' => $city] = playerLeagueApiFoundation();
    $otherPlayer = User::factory()->create(['status' => 'active']);
    UserLocation::factory()->for($otherPlayer)->for($city)->create();
    PlayerCompetition::factory()
        ->for($otherPlayer)
        ->for($tiers[CompetitionTierCode::City->value], 'tier')
        ->eligible()
        ->create();
    Season::factory()->create([
        'name' => 'Season 01',
        'status' => SeasonStatus::Active,
        'starts_at' => now()->subDay(),
        'ends_at' => now()->addMonth(),
    ]);
    Sanctum::actingAs($user, ['mobile']);

    $response = $this->getJson('/api/v1/leagues');

    $response->assertOk()
        ->assertJsonCount(4, 'data.leagues')
        ->assertJsonPath('data.current_season.name', 'Season 01')
        ->assertJsonPath('data.leagues.0.code', 'city')
        ->assertJsonPath('data.leagues.0.image_url', 'https://api.chessx.test/storage/leagues/Lcity.png')
        ->assertJsonPath('data.leagues.0.status', 'eligible')
        ->assertJsonPath('data.leagues.0.is_unlocked', true)
        ->assertJsonPath('data.leagues.0.region.name', 'Surat City League')
        ->assertJsonPath('data.leagues.0.players_count', 2)
        ->assertJsonPath('data.leagues.0.rating.rating', 1250)
        ->assertJsonPath('data.leagues.0.rating.games_played', 5)
        ->assertJsonPath('data.leagues.0.promotion.next_tier.code', 'state')
        ->assertJsonPath('data.leagues.0.promotion.requirements.minimum_games', 20)
        ->assertJsonPath('data.leagues.0.promotion.requirements.games_remaining', 15)
        ->assertJsonPath('data.leagues.0.promotion.requirements.minimum_rating', null)
        ->assertJsonPath('data.leagues.0.promotion.ready', false)
        ->assertJsonPath('data.leagues.0.promotion.blocked_reason', 'minimum_games_not_met')
        ->assertJsonPath('data.leagues.1.code', 'state')
        ->assertJsonPath('data.leagues.1.image_url', 'https://api.chessx.test/storage/leagues/Lstate.png')
        ->assertJsonPath('data.leagues.1.status', 'locked')
        ->assertJsonPath('data.leagues.1.promotion.requirements.minimum_games', 30)
        ->assertJsonPath('data.leagues.2.image_url', 'https://api.chessx.test/storage/leagues/Lnational.png')
        ->assertJsonPath('data.leagues.3.code', 'world')
        ->assertJsonPath('data.leagues.3.image_url', 'https://api.chessx.test/storage/leagues/Lworld.png')
        ->assertJsonPath('data.leagues.3.promotion', null);
});

it('returns one personalized league by tier code', function () {
    ['user' => $user] = playerLeagueApiFoundation();
    Sanctum::actingAs($user, ['mobile']);

    $response = $this->getJson('/api/v1/leagues/national');

    $response->assertOk()
        ->assertJsonPath('data.league.code', 'national')
        ->assertJsonPath('data.league.image_url', 'https://api.chessx.test/storage/leagues/Lnational.png')
        ->assertJsonPath('data.league.region.name', 'India National League')
        ->assertJsonPath('data.league.status', 'locked')
        ->assertJsonPath('data.league.promotion.next_tier.code', 'world')
        ->assertJsonPath('data.league.promotion.requirements.minimum_games', 40);
});

it('returns 404 for an inactive league', function () {
    ['user' => $user, 'tiers' => $tiers] = playerLeagueApiFoundation();
    $tiers[CompetitionTierCode::State->value]->update(['is_active' => false]);
    Sanctum::actingAs($user, ['mobile']);

    $this->getJson('/api/v1/leagues/state')->assertNotFound();
});

it('returns null local regions when the player has not confirmed a location', function () {
    test()->seed(CompetitionTierSeeder::class);
    test()->seed(PromotionRuleSeeder::class);
    $worldTier = CompetitionTier::query()->where('code', CompetitionTierCode::World)->firstOrFail();
    CompetitionRegion::query()->create([
        'tier_id' => $worldTier->getKey(),
        'name' => 'World League',
        'status' => 'active',
    ]);
    $user = User::factory()->create(['status' => 'active']);
    Sanctum::actingAs($user, ['mobile']);

    $response = $this->getJson('/api/v1/leagues');

    $response->assertOk()
        ->assertJsonPath('data.leagues.0.region', null)
        ->assertJsonPath('data.leagues.0.status', 'locked')
        ->assertJsonPath('data.leagues.3.region.name', 'World League');
});

it('ships every configured league artwork file on the public disk', function (string $artwork) {
    Storage::disk('public')->assertExists('leagues/'.$artwork);
})->with([
    'city' => 'Lcity.png',
    'state' => 'Lstate.png',
    'national' => 'Lnational.png',
    'world' => 'Lworld.png',
]);
