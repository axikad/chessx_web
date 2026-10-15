<?php

namespace Database\Seeders;

use App\Enums\CompetitionTierCode;
use App\Models\CompetitionTier;
use Illuminate\Database\Seeder;

class CompetitionTierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tiers = [
            ['code' => CompetitionTierCode::City, 'name' => 'City League', 'scope_type' => 'city', 'sequence_number' => 1],
            ['code' => CompetitionTierCode::State, 'name' => 'State League', 'scope_type' => 'state', 'sequence_number' => 2],
            ['code' => CompetitionTierCode::National, 'name' => 'National League', 'scope_type' => 'country', 'sequence_number' => 3],
            ['code' => CompetitionTierCode::World, 'name' => 'World League', 'scope_type' => 'global', 'sequence_number' => 4],
        ];

        foreach ($tiers as $tier) {
            CompetitionTier::query()->updateOrCreate(
                ['code' => $tier['code']],
                [...$tier, 'is_active' => true],
            );
        }
    }
}
