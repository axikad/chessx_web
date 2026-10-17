<?php

use App\Enums\SystemSettingType;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\SystemSettingService;
use Database\Seeders\SystemSettingSeeder;
use Illuminate\Database\Eloquent\ModelNotFoundException;

it('seeds typed defaults for ratings location games and matchmaking', function () {
    $this->seed(SystemSettingSeeder::class);

    $settings = app(SystemSettingService::class);

    expect(SystemSetting::query()->count())->toBe(15)
        ->and($settings->integer('ratings.starting_rating', 0))->toBe(1200)
        ->and($settings->float('location.resolve_radius_km', 0))->toBe(75.0)
        ->and($settings->integer('games.default_time_control_seconds', 0))->toBe(600)
        ->and($settings->integer('matchmaking.initial_rating_range', 0))->toBe(100)
        ->and($settings->string('location.policy_version', ''))->toBe('1.0');
});

it('returns a safe fallback when a setting has not been stored', function () {
    expect(app(SystemSettingService::class)->integer('missing.setting', 42))->toBe(42);
});

it('stores the responsible user and invalidates the cached value', function () {
    $this->seed(SystemSettingSeeder::class);
    $user = User::factory()->create();
    $settings = app(SystemSettingService::class);
    expect($settings->integer('ratings.starting_rating', 0))->toBe(1200);

    $updated = $settings->set('ratings.starting_rating', 1350, $user);

    expect($updated->typedValue())->toBe(1350)
        ->and($updated->updated_by)->toBe($user->id)
        ->and($updated->updater->is($user))->toBeTrue()
        ->and($settings->integer('ratings.starting_rating', 0))->toBe(1350);
});

it('rejects values that do not match the declared setting type', function () {
    SystemSetting::factory()->create([
        'key' => 'games.default_increment_seconds',
        'type' => SystemSettingType::Integer,
    ]);

    expect(fn () => app(SystemSettingService::class)->set('games.default_increment_seconds', 'invalid'))
        ->toThrow(InvalidArgumentException::class, 'The setting value must be an integer.');
});

it('does not create arbitrary settings through the update service', function () {
    expect(fn () => app(SystemSettingService::class)->set('unknown.setting', true))
        ->toThrow(ModelNotFoundException::class);
});
