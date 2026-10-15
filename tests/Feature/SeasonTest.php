<?php

use App\Enums\SeasonStatus;
use App\Models\Season;

test('a season stores its lifecycle and date window', function () {
    $season = Season::factory()->create([
        'name' => 'ChessX 2027',
        'starts_at' => '2027-01-01 00:00:00',
        'ends_at' => '2027-03-31 23:59:59',
        'status' => SeasonStatus::Scheduled,
    ]);

    expect($season->name)->toBe('ChessX 2027')
        ->and($season->starts_at->toDateTimeString())->toBe('2027-01-01 00:00:00')
        ->and($season->ends_at->toDateTimeString())->toBe('2027-03-31 23:59:59')
        ->and($season->status)->toBe(SeasonStatus::Scheduled);

    $this->assertModelExists($season);
});

test('a season rejects an invalid date window', function () {
    expect(fn () => Season::factory()->create([
        'starts_at' => '2027-04-01 00:00:00',
        'ends_at' => '2027-03-31 23:59:59',
    ]))->toThrow(InvalidArgumentException::class, 'A season must end after it starts.');

    $this->assertDatabaseCount('seasons', 0);
});

test('season factory states represent supported lifecycle statuses', function () {
    $activeSeason = Season::factory()->active()->create();
    $completedSeason = Season::factory()->completed()->create();
    $cancelledSeason = Season::factory()->cancelled()->create();

    expect($activeSeason->status)->toBe(SeasonStatus::Active)
        ->and($completedSeason->status)->toBe(SeasonStatus::Completed)
        ->and($cancelledSeason->status)->toBe(SeasonStatus::Cancelled);
});
