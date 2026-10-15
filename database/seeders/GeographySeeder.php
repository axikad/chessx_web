<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Country;
use App\Models\State;
use Illuminate\Database\Seeder;

class GeographySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /** @var array<string, mixed> $countryData */
        $countryData = require __DIR__.'/india_geography.php';

        $country = Country::query()->updateOrCreate(
            ['iso2' => $countryData['iso2']],
            ['iso3' => $countryData['iso3'], 'name' => $countryData['name'], 'status' => 'active'],
        );

        foreach ($countryData['states'] as $stateData) {
            $state = State::query()->updateOrCreate(
                ['country_id' => $country->getKey(), 'name' => $stateData['name']],
                ['code' => $stateData['code'], 'status' => 'active'],
            );

            foreach ($stateData['cities'] as $cityData) {
                City::query()->updateOrCreate(
                    ['state_id' => $state->getKey(), 'normalized_name' => str($cityData['name'])->ascii()->lower()->squish()->toString()],
                    [...$cityData, 'status' => 'active'],
                );
            }
        }
    }
}
