<?php

namespace Database\Seeders;

use App\Enums\CompetitionTierCode;
use App\Models\City;
use App\Models\CompetitionRegion;
use App\Models\CompetitionTier;
use App\Models\Country;
use App\Models\State;
use Illuminate\Database\Seeder;

class CompetitionRegionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tiers = CompetitionTier::query()->get()->keyBy(fn (CompetitionTier $tier): string => $tier->code->value);

        City::query()->where('status', 'active')->each(function (City $city) use ($tiers): void {
            $this->seedRegion($tiers[CompetitionTierCode::City->value], ['city_id' => $city->getKey()], $city->name.' City League');
        });

        State::query()->where('status', 'active')->each(function (State $state) use ($tiers): void {
            $this->seedRegion($tiers[CompetitionTierCode::State->value], ['state_id' => $state->getKey()], $state->name.' State League');
        });

        Country::query()->where('status', 'active')->each(function (Country $country) use ($tiers): void {
            $this->seedRegion($tiers[CompetitionTierCode::National->value], ['country_id' => $country->getKey()], $country->name.' National League');
        });

        $this->seedRegion($tiers[CompetitionTierCode::World->value], [], 'World League');
    }

    /** @param array<string, int> $scope */
    private function seedRegion(CompetitionTier $tier, array $scope, string $name): void
    {
        CompetitionRegion::query()->updateOrCreate(
            ['tier_id' => $tier->getKey(), ...$scope],
            ['name' => $name, 'status' => 'active'],
        );
    }
}
