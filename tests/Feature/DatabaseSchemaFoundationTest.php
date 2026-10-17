<?php

use App\Models\AdEvent;
use App\Models\AntiCheatFlag;
use App\Models\CompetitionTier;
use App\Models\DeviceToken;
use App\Models\Game;
use App\Models\GameDispute;
use App\Models\GameEvent;
use App\Models\GameMove;
use App\Models\GameState;
use App\Models\IdempotencyKey;
use App\Models\MatchmakingQueue;
use App\Models\RatingHistory;
use App\Models\Season;
use App\Models\Tournament;
use App\Models\TournamentEntry;
use App\Models\TournamentPairing;
use App\Models\TournamentQualifier;
use App\Models\TournamentRound;
use App\Models\User;
use App\Models\UserNotification;
use App\Models\UserReport;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Schema;

it('contains every planned database foundation table', function () {
    $tables = [
        'games',
        'game_states',
        'game_moves',
        'game_events',
        'game_disputes',
        'matchmaking_queue',
        'rating_histories',
        'tournaments',
        'tournament_entries',
        'tournament_rounds',
        'tournament_pairings',
        'tournament_qualifiers',
        'device_tokens',
        'notifications',
        'user_reports',
        'anti_cheat_flags',
        'idempotency_keys',
        'ad_events',
    ];

    expect(collect($tables)->every(fn (string $table): bool => Schema::hasTable($table)))->toBeTrue();
});

it('persists the complete authoritative game aggregate', function () {
    $tier = CompetitionTier::factory()->create();
    $whitePlayer = User::factory()->create();
    $blackPlayer = User::factory()->create();
    $game = Game::factory()->create([
        'tier_id' => $tier->id,
        'white_user_id' => $whitePlayer->id,
        'black_user_id' => $blackPlayer->id,
    ]);
    $state = GameState::factory()->create(['game_id' => $game->id]);
    $move = GameMove::factory()->create(['game_id' => $game->id, 'user_id' => $whitePlayer->id]);
    $event = GameEvent::factory()->create(['game_id' => $game->id]);
    $dispute = GameDispute::factory()->create(['game_id' => $game->id, 'reporting_user_id' => $whitePlayer->id]);
    $rating = RatingHistory::factory()->create([
        'game_id' => $game->id,
        'tier_id' => $tier->id,
        'user_id' => $whitePlayer->id,
    ]);

    expect($game->state->is($state))->toBeTrue()
        ->and($game->moves->first()->is($move))->toBeTrue()
        ->and($game->events->first()->is($event))->toBeTrue()
        ->and($game->disputes->first()->is($dispute))->toBeTrue()
        ->and($game->ratingHistories->first()->is($rating))->toBeTrue()
        ->and($state->white_time_ms)->toBeInt()
        ->and($event->payload_json)->toBeArray();
});

it('rejects duplicate game state move ply and rating result records', function () {
    $tier = CompetitionTier::factory()->create();
    $user = User::factory()->create();
    $game = Game::factory()->create(['tier_id' => $tier->id]);
    GameState::factory()->create(['game_id' => $game->id]);
    GameMove::factory()->create(['game_id' => $game->id, 'user_id' => $user->id, 'ply' => 1]);
    RatingHistory::factory()->create(['game_id' => $game->id, 'tier_id' => $tier->id, 'user_id' => $user->id]);

    expect(fn () => GameState::factory()->create(['game_id' => $game->id]))->toThrow(QueryException::class)
        ->and(fn () => GameMove::factory()->create(['game_id' => $game->id, 'user_id' => $user->id, 'ply' => 1]))->toThrow(QueryException::class)
        ->and(fn () => RatingHistory::factory()->create(['game_id' => $game->id, 'tier_id' => $tier->id, 'user_id' => $user->id]))->toThrow(QueryException::class);
});

it('allows only one queued matchmaking record per player', function () {
    $tier = CompetitionTier::factory()->create();
    $user = User::factory()->create();
    $entry = MatchmakingQueue::factory()->create(['tier_id' => $tier->id, 'user_id' => $user->id]);

    expect(fn () => MatchmakingQueue::factory()->create(['tier_id' => $tier->id, 'user_id' => $user->id]))
        ->toThrow(QueryException::class);

    $entry->update(['status' => 'cancelled']);
    $replacement = MatchmakingQueue::factory()->create(['tier_id' => $tier->id, 'user_id' => $user->id]);

    $this->assertModelExists($replacement);
});

it('persists tournament entries rounds pairings and qualifiers', function () {
    $tier = CompetitionTier::factory()->create();
    $season = Season::factory()->create();
    $whitePlayer = User::factory()->create();
    $blackPlayer = User::factory()->create();
    $tournament = Tournament::factory()->create(['season_id' => $season->id, 'tier_id' => $tier->id]);
    $entry = TournamentEntry::factory()->create(['tournament_id' => $tournament->id, 'user_id' => $whitePlayer->id]);
    $round = TournamentRound::factory()->create(['tournament_id' => $tournament->id]);
    $pairing = TournamentPairing::factory()->create([
        'round_id' => $round->id,
        'white_user_id' => $whitePlayer->id,
        'black_user_id' => $blackPlayer->id,
    ]);
    $qualifier = TournamentQualifier::factory()->create([
        'tournament_id' => $tournament->id,
        'user_id' => $whitePlayer->id,
        'destination_tier_id' => $tier->id,
    ]);

    expect($tournament->entries->first()->is($entry))->toBeTrue()
        ->and($tournament->rounds->first()->is($round))->toBeTrue()
        ->and($round->pairings->first()->is($pairing))->toBeTrue()
        ->and($tournament->qualifiers->first()->is($qualifier))->toBeTrue();
});

it('persists device notification moderation idempotency and advertising records', function () {
    $user = User::factory()->create();
    $reportedUser = User::factory()->create();
    $device = DeviceToken::factory()->create(['user_id' => $user->id]);
    $notification = UserNotification::factory()->create(['user_id' => $user->id]);
    $report = UserReport::factory()->create(['reporter_user_id' => $user->id, 'reported_user_id' => $reportedUser->id]);
    $flag = AntiCheatFlag::factory()->create(['user_id' => $reportedUser->id]);
    $idempotencyKey = IdempotencyKey::factory()->create(['user_id' => $user->id]);
    $adEvent = AdEvent::factory()->create(['user_id' => $user->id]);

    expect($user->deviceTokens->first()->is($device))->toBeTrue()
        ->and($user->chessNotifications->first()->is($notification))->toBeTrue()
        ->and($user->reportsFiled->first()->is($report))->toBeTrue()
        ->and($reportedUser->antiCheatFlags->first()->is($flag))->toBeTrue()
        ->and($user->idempotencyKeys->first()->is($idempotencyKey))->toBeTrue()
        ->and($user->adEvents->first()->is($adEvent))->toBeTrue()
        ->and($notification->data_json)->toBeArray()
        ->and($flag->evidence_json)->toBeArray();
});
