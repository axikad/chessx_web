<?php

use App\Enums\GameMode;
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
    $event = GameEvent::factory()->create([
        'game_id' => $game->id,
        'actor_user_id' => $whitePlayer->id,
        'sequence_number' => 1,
    ]);
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
        ->and($state->fullmove_number)->toBe(4)
        ->and(Schema::hasColumn('game_states', 'move_number'))->toBeFalse()
        ->and($move->piece_color)->toBe('white')
        ->and($move->piece_type)->toBe('pawn')
        ->and($move->from_square)->toBe('e2')
        ->and($move->to_square)->toBe('e4')
        ->and($move->captured_piece_type)->toBeNull()
        ->and($move->promotion_piece)->toBeNull()
        ->and($move->is_capture)->toBeFalse()
        ->and($move->is_castling)->toBeFalse()
        ->and($move->is_en_passant)->toBeFalse()
        ->and($move->uci_move)->toBe('e2e4')
        ->and($move->san_move)->toBe('e4')
        ->and($event->actor->is($whitePlayer))->toBeTrue()
        ->and($event->sequence_number)->toBe(1)
        ->and($event->payload_json)->toBeArray();
});

it('rejects duplicate game state move ply event sequence and rating result records', function () {
    $tier = CompetitionTier::factory()->create();
    $user = User::factory()->create();
    $game = Game::factory()->create(['tier_id' => $tier->id]);
    GameState::factory()->create(['game_id' => $game->id]);
    GameMove::factory()->create(['game_id' => $game->id, 'user_id' => $user->id, 'ply' => 1]);
    GameEvent::factory()->create(['game_id' => $game->id, 'sequence_number' => 1]);
    RatingHistory::factory()->create(['game_id' => $game->id, 'tier_id' => $tier->id, 'user_id' => $user->id]);

    expect(fn () => GameState::factory()->create(['game_id' => $game->id]))->toThrow(QueryException::class)
        ->and(fn () => GameMove::factory()->create(['game_id' => $game->id, 'user_id' => $user->id, 'ply' => 1]))->toThrow(QueryException::class)
        ->and(fn () => GameEvent::factory()->create(['game_id' => $game->id, 'sequence_number' => 1]))->toThrow(QueryException::class)
        ->and(fn () => RatingHistory::factory()->create(['game_id' => $game->id, 'tier_id' => $tier->id, 'user_id' => $user->id]))->toThrow(QueryException::class);
});

it('allows only one queued matchmaking record per player', function () {
    $tier = CompetitionTier::factory()->create();
    $user = User::factory()->create();
    $entry = MatchmakingQueue::factory()->create([
        'tier_id' => $tier->id,
        'user_id' => $user->id,
        'game_mode' => 'casual',
        'time_control_seconds' => 300,
        'increment_seconds' => 3,
        'rating_tolerance' => 150,
    ]);

    expect($entry->game_mode)->toBe(GameMode::Casual)
        ->and($entry->time_control_seconds)->toBe(300)
        ->and($entry->increment_seconds)->toBe(3)
        ->and($entry->rating_tolerance)->toBe(150);

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
