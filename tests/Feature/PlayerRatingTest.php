<?php

use App\Models\CompetitionTier;
use App\Models\PlayerRating;
use App\Models\User;
use Illuminate\Database\QueryException;

test('a player starts with a provisional rating for a competition tier', function () {
    $user = User::factory()->create();
    $tier = CompetitionTier::factory()->create();

    $rating = PlayerRating::factory()->for($user)->for($tier, 'tier')->create();

    expect($rating->user->is($user))->toBeTrue()
        ->and($rating->tier->is($tier))->toBeTrue()
        ->and($rating->rating)->toBe(1200)
        ->and($rating->highest_rating)->toBe(1200)
        ->and($rating->provisional_rating)->toBeTrue()
        ->and($rating->games_played)->toBe(0)
        ->and($rating->wins)->toBe(0)
        ->and($rating->draws)->toBe(0)
        ->and($rating->losses)->toBe(0)
        ->and($rating->last_game_at)->toBeNull();
});

test('new player ratings use the configured starting value', function () {
    config()->set('chess.starting_rating', 1500);
    $user = User::factory()->create();
    $tier = CompetitionTier::factory()->create();

    $rating = PlayerRating::query()->create([
        'user_id' => $user->id,
        'tier_id' => $tier->id,
    ]);

    expect($rating->rating)->toBe(1500)
        ->and($rating->highest_rating)->toBe(1500)
        ->and($rating->provisional_rating)->toBeTrue();
});

test('an explicit initial rating also becomes the initial highest rating', function () {
    config()->set('chess.starting_rating', 1500);
    $user = User::factory()->create();
    $tier = CompetitionTier::factory()->create();

    $rating = PlayerRating::query()->create([
        'user_id' => $user->id,
        'tier_id' => $tier->id,
        'rating' => 1650,
    ]);

    expect($rating->rating)->toBe(1650)
        ->and($rating->highest_rating)->toBe(1650);
});

test('the database rejects a duplicate rating for the same player tier', function () {
    $user = User::factory()->create();
    $tier = CompetitionTier::factory()->create();
    PlayerRating::factory()->for($user)->for($tier, 'tier')->create();

    expect(fn () => PlayerRating::factory()->for($user)->for($tier, 'tier')->create())
        ->toThrow(QueryException::class);

    expect(PlayerRating::query()->count())->toBe(1);
});

test('a player can hold separate ratings across competition tiers', function () {
    $user = User::factory()->create();
    $cityTier = CompetitionTier::factory()->create();
    $stateTier = CompetitionTier::factory()->stateLeague()->create();

    PlayerRating::factory()->for($user)->for($cityTier, 'tier')->create();
    PlayerRating::factory()->for($user)->for($stateTier, 'tier')->create();

    expect($user->playerRatings()->count())->toBe(2);
});

test('an established rating stores performance statistics', function () {
    $rating = PlayerRating::factory()->established()->create();

    expect($rating->rating)->toBe(1384)
        ->and($rating->provisional_rating)->toBeFalse()
        ->and($rating->games_played)->toBe(20)
        ->and($rating->wins)->toBe(12)
        ->and($rating->draws)->toBe(3)
        ->and($rating->losses)->toBe(5)
        ->and($rating->highest_rating)->toBe(1412)
        ->and($rating->last_game_at)->not->toBeNull();
});

test('a rating becomes established after ten rated games', function () {
    config()->set('chess.provisional_games', 10);
    $rating = PlayerRating::factory()->create(['games_played' => 9]);

    expect($rating->provisional_rating)->toBeTrue()
        ->and($rating->provisionalGamesRemaining())->toBe(1);

    $rating->update(['games_played' => 10]);

    expect($rating->refresh()->provisional_rating)->toBeFalse()
        ->and($rating->provisionalGamesRemaining())->toBe(0);
});
