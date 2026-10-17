<?php

use App\Enums\PlayerCompetitionStatus;
use App\Enums\PromotionStatus;
use App\Models\AuditLog;
use App\Models\CompetitionTier;
use App\Models\Permission;
use App\Models\PlayerCompetition;
use App\Models\PromotionRecord;
use App\Models\PromotionRule;
use App\Models\Role;
use App\Models\Season;
use App\Models\User;
use App\Services\RolePermissionService;

function promotionAdministrator(): User
{
    return User::factory()->for(Role::factory()->superAdmin())->create();
}

it('returns promotion rules and records to authorized administrators', function () {
    $rule = PromotionRule::factory()->create();
    $record = PromotionRecord::factory()->create([
        'promotion_rule_id' => $rule->id,
        'from_tier_id' => $rule->from_tier_id,
        'to_tier_id' => $rule->to_tier_id,
        'status' => PromotionStatus::Qualified,
        'qualified_at' => now(),
    ]);

    $this->actingAs(promotionAdministrator())
        ->getJson(route('management.promotion-rules.index'))
        ->assertOk()
        ->assertJsonPath('data.0.id', $rule->id)
        ->assertJsonPath('data.0.minGames', 20);

    $this->getJson(route('management.promotion-records.index', ['status' => 'qualified']))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $record->id)
        ->assertJsonPath('data.0.status', 'qualified');
});

it('updates a promotion rule and records the previous and current configuration', function () {
    $actor = promotionAdministrator();
    $rule = PromotionRule::factory()->create();

    $this->actingAs($actor)
        ->patchJson(route('management.promotion-rules.update', $rule), [
            'min_rating' => 1450,
            'min_games' => 25,
            'rating_threshold_enabled' => true,
            'qualification_required' => false,
            'effective_from' => '2027-01-01 00:00:00',
            'effective_until' => '2027-12-31 23:59:59',
            'is_active' => true,
        ])
        ->assertOk()
        ->assertJsonPath('data.minGames', 25)
        ->assertJsonPath('data.minRating', 1450)
        ->assertJsonPath('data.ratingThresholdEnabled', true);

    $this->assertDatabaseHas('promotion_rules', [
        'id' => $rule->id,
        'min_rating' => 1450,
        'min_games' => 25,
        'qualification_required' => false,
    ]);

    $audit = AuditLog::query()->where('action', 'promotion.rule_updated')->firstOrFail();
    expect($audit->actor_user_id)->toBe($actor->id)
        ->and($audit->metadata['previous']['min_games'])->toBe(20)
        ->and($audit->metadata['current']['min_games'])->toBe(25);
});

it('approves a qualified promotion and unlocks the target league', function () {
    $actor = promotionAdministrator();
    $player = User::factory()->create();
    $season = Season::factory()->create();
    $fromTier = CompetitionTier::factory()->create();
    $toTier = CompetitionTier::factory()->stateLeague()->create();
    $rule = PromotionRule::factory()->create([
        'from_tier_id' => $fromTier->id,
        'to_tier_id' => $toTier->id,
    ]);
    $record = PromotionRecord::factory()->create([
        'user_id' => $player->id,
        'season_id' => $season->id,
        'promotion_rule_id' => $rule->id,
        'from_tier_id' => $fromTier->id,
        'to_tier_id' => $toTier->id,
        'status' => PromotionStatus::Qualified,
        'qualified_at' => now(),
    ]);
    PlayerCompetition::factory()->create([
        'user_id' => $player->id,
        'tier_id' => $toTier->id,
        'season_id' => $season->id,
        'status' => PlayerCompetitionStatus::Locked,
        'unlocked_at' => null,
    ]);

    $this->actingAs($actor)
        ->patchJson(route('management.promotion-records.update', $record), [
            'decision' => 'approved',
            'review_reason' => 'Player completed every verified requirement.',
        ])
        ->assertOk()
        ->assertJsonPath('data.status', 'approved');

    $this->assertDatabaseHas('promotion_records', ['id' => $record->id, 'status' => 'approved']);
    $this->assertDatabaseHas('player_competitions', [
        'user_id' => $player->id,
        'tier_id' => $toTier->id,
        'season_id' => $season->id,
        'status' => 'eligible',
    ]);
    $this->assertDatabaseHas('audit_logs', [
        'actor_user_id' => $actor->id,
        'action' => 'promotion.approved',
        'entity_id' => $record->id,
    ]);
});

it('rejects a qualified promotion without unlocking the target league', function () {
    $actor = promotionAdministrator();
    $record = PromotionRecord::factory()->create([
        'status' => PromotionStatus::Qualified,
        'qualified_at' => now(),
    ]);

    $this->actingAs($actor)
        ->patchJson(route('management.promotion-records.update', $record), [
            'decision' => 'rejected',
            'review_reason' => 'Qualification evidence needs correction.',
        ])
        ->assertOk()
        ->assertJsonPath('data.status', 'rejected');

    $this->assertDatabaseHas('promotion_records', ['id' => $record->id, 'status' => 'rejected']);
    $this->assertDatabaseMissing('player_competitions', [
        'user_id' => $record->user_id,
        'tier_id' => $record->to_tier_id,
        'season_id' => $record->season_id,
        'status' => 'eligible',
    ]);
});

it('does not downgrade an active target league when approving a promotion', function () {
    $player = User::factory()->create();
    $season = Season::factory()->create();
    $fromTier = CompetitionTier::factory()->create();
    $toTier = CompetitionTier::factory()->stateLeague()->create();
    $rule = PromotionRule::factory()->create([
        'from_tier_id' => $fromTier->id,
        'to_tier_id' => $toTier->id,
    ]);
    $record = PromotionRecord::factory()->create([
        'user_id' => $player->id,
        'season_id' => $season->id,
        'promotion_rule_id' => $rule->id,
        'from_tier_id' => $fromTier->id,
        'to_tier_id' => $toTier->id,
        'status' => PromotionStatus::Qualified,
        'qualified_at' => now(),
    ]);
    $eligibility = PlayerCompetition::factory()->create([
        'user_id' => $player->id,
        'tier_id' => $toTier->id,
        'season_id' => $season->id,
        'status' => PlayerCompetitionStatus::Active,
        'unlocked_at' => now()->subDay(),
    ]);

    $this->actingAs(promotionAdministrator())
        ->patchJson(route('management.promotion-records.update', $record), [
            'decision' => 'approved',
            'review_reason' => 'Player already entered the promoted competition.',
        ])
        ->assertOk();

    expect($eligibility->fresh()->status)->toBe(PlayerCompetitionStatus::Active);
});

it('returns 409 when approval would override a target league suspension', function () {
    $player = User::factory()->create();
    $season = Season::factory()->create();
    $fromTier = CompetitionTier::factory()->create();
    $toTier = CompetitionTier::factory()->stateLeague()->create();
    $rule = PromotionRule::factory()->create([
        'from_tier_id' => $fromTier->id,
        'to_tier_id' => $toTier->id,
    ]);
    $record = PromotionRecord::factory()->create([
        'user_id' => $player->id,
        'season_id' => $season->id,
        'promotion_rule_id' => $rule->id,
        'from_tier_id' => $fromTier->id,
        'to_tier_id' => $toTier->id,
        'status' => PromotionStatus::Qualified,
        'qualified_at' => now(),
    ]);
    PlayerCompetition::factory()->create([
        'user_id' => $player->id,
        'tier_id' => $toTier->id,
        'season_id' => $season->id,
        'status' => PlayerCompetitionStatus::Suspended,
    ]);

    $this->actingAs(promotionAdministrator())
        ->patchJson(route('management.promotion-records.update', $record), [
            'decision' => 'approved',
            'review_reason' => 'This action must not override suspension.',
        ])
        ->assertConflict();

    $this->assertDatabaseHas('promotion_records', ['id' => $record->id, 'status' => 'qualified']);
    $this->assertDatabaseMissing('audit_logs', ['entity_id' => $record->id, 'action' => 'promotion.approved']);
});

it('returns 409 when reviewing a promotion that is not qualified', function () {
    $record = PromotionRecord::factory()->create(['status' => PromotionStatus::Pending]);

    $this->actingAs(promotionAdministrator())
        ->patchJson(route('management.promotion-records.update', $record), [
            'decision' => 'approved',
            'review_reason' => 'This action must not be accepted.',
        ])
        ->assertConflict();

    $this->assertDatabaseHas('promotion_records', ['id' => $record->id, 'status' => 'pending']);
    $this->assertDatabaseMissing('audit_logs', ['entity_id' => $record->id, 'action' => 'promotion.approved']);
});

it('enforces promotion read and update permissions independently', function () {
    $role = Role::factory()->create();
    $actor = User::factory()->for($role)->create();
    $readPermission = Permission::factory()->create(['slug' => 'promotions.read']);
    app(RolePermissionService::class)->assign($role, $readPermission, $actor);
    $rule = PromotionRule::factory()->create();

    $this->actingAs($actor)
        ->getJson(route('management.promotion-rules.index'))
        ->assertOk();

    $this->patchJson(route('management.promotion-rules.update', $rule), [
        'min_rating' => 1300,
        'min_games' => 20,
        'rating_threshold_enabled' => true,
        'qualification_required' => true,
        'effective_from' => now()->toDateTimeString(),
        'effective_until' => null,
        'is_active' => true,
    ])->assertForbidden();

    $this->assertDatabaseHas('promotion_rules', ['id' => $rule->id, 'min_rating' => 1200]);
});

it('renders promotion management inside the ChessX application shell', function () {
    $this->actingAs(promotionAdministrator())
        ->get('/promotion-management/rules')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('welcome')
            ->where('auth.permissions.0', '*'));
});
