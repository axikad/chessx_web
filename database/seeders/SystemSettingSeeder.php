<?php

namespace Database\Seeders;

use App\Enums\SystemSettingType;
use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            ['key' => 'ratings.starting_rating', 'group' => 'ratings', 'value' => config('chess.starting_rating'), 'type' => SystemSettingType::Integer, 'description' => 'Rating assigned when a player enters a competition tier.'],
            ['key' => 'ratings.provisional_games', 'group' => 'ratings', 'value' => config('chess.provisional_games'), 'type' => SystemSettingType::Integer, 'description' => 'Completed games required before a rating stops being provisional.'],
            ['key' => 'location.resolve_radius_km', 'group' => 'location', 'value' => config('chess.location_resolve_radius_km'), 'type' => SystemSettingType::Float, 'description' => 'Maximum GPS distance used to suggest a supported city.'],
            ['key' => 'location.resolution_token_minutes', 'group' => 'location', 'value' => config('chess.location_resolution_token_minutes'), 'type' => SystemSettingType::Integer, 'description' => 'Lifetime of a signed location-resolution token.'],
            ['key' => 'location.candidate_limit', 'group' => 'location', 'value' => config('chess.location_candidate_limit'), 'type' => SystemSettingType::Integer, 'description' => 'Maximum cities returned for GPS location resolution.'],
            ['key' => 'location.change_cooldown_days', 'group' => 'location', 'value' => config('chess.location_change_cooldown_days'), 'type' => SystemSettingType::Integer, 'description' => 'Days a player must wait before requesting another location change.'],
            ['key' => 'location.policy_version', 'group' => 'location', 'value' => config('chess.location_policy_version'), 'type' => SystemSettingType::String, 'description' => 'Location policy version stored with confirmations.'],
            ['key' => 'games.default_time_control_seconds', 'group' => 'games', 'value' => config('chess.default_time_control_seconds'), 'type' => SystemSettingType::Integer, 'description' => 'Default initial clock time for each player.'],
            ['key' => 'games.default_increment_seconds', 'group' => 'games', 'value' => config('chess.default_increment_seconds'), 'type' => SystemSettingType::Integer, 'description' => 'Default clock increment added after an accepted move.'],
            ['key' => 'games.reconnect_grace_seconds', 'group' => 'games', 'value' => config('chess.reconnect_grace_seconds'), 'type' => SystemSettingType::Integer, 'description' => 'Grace period allowed for a disconnected player to reconnect.'],
            ['key' => 'games.abandonment_timeout_seconds', 'group' => 'games', 'value' => config('chess.abandonment_timeout_seconds'), 'type' => SystemSettingType::Integer, 'description' => 'Disconnect duration after which a game may be abandoned.'],
            ['key' => 'matchmaking.initial_rating_range', 'group' => 'matchmaking', 'value' => config('chess.matchmaking_initial_rating_range'), 'type' => SystemSettingType::Integer, 'description' => 'Initial rating difference allowed when finding an opponent.'],
            ['key' => 'matchmaking.rating_range_step', 'group' => 'matchmaking', 'value' => config('chess.matchmaking_rating_range_step'), 'type' => SystemSettingType::Integer, 'description' => 'Rating range added at each matchmaking expansion.'],
            ['key' => 'matchmaking.rating_range_step_seconds', 'group' => 'matchmaking', 'value' => config('chess.matchmaking_rating_range_step_seconds'), 'type' => SystemSettingType::Integer, 'description' => 'Seconds between matchmaking rating-range expansions.'],
            ['key' => 'matchmaking.queue_timeout_seconds', 'group' => 'matchmaking', 'value' => config('chess.matchmaking_queue_timeout_seconds'), 'type' => SystemSettingType::Integer, 'description' => 'Maximum time a matchmaking queue entry remains active.'],
        ];

        foreach ($settings as $setting) {
            SystemSetting::query()->firstOrCreate(
                ['key' => $setting['key']],
                [
                    'group' => $setting['group'],
                    'value' => (string) $setting['value'],
                    'type' => $setting['type'],
                    'description' => $setting['description'],
                ],
            );
        }
    }
}
