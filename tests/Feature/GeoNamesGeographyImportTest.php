<?php

use App\Models\City;
use App\Models\Country;
use App\Models\State;
use App\Models\User;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

/** @return array{archive: string, source_directory: string} */
function createGeoNamesImportFixture(): array
{
    Storage::fake('local');
    $sourceDirectory = Storage::disk('local')->path('geonames-source');
    File::ensureDirectoryExists($sourceDirectory);

    $countryFields = array_fill(0, 19, '');
    $countryFields[0] = 'IN';
    $countryFields[1] = 'IND';
    $countryFields[4] = 'India';
    $countryFields[16] = '1269750';
    File::put($sourceDirectory.'/countryInfo.txt', implode("\t", $countryFields)."\n");
    File::put($sourceDirectory.'/admin1CodesASCII.txt', "IN.09\tGujarat\tGujarat\t1270770\n");

    $cityRows = collect([
        [1279233, 'Ahmedabad', '23.02579', '72.58727', 'Asia/Kolkata'],
        [1255364, 'Surat', '21.19594', '72.83023', 'Asia/Kolkata'],
        [999001, 'Twin City', '21.10000', '72.10000', 'Asia/Kolkata'],
        [999002, 'Twin City', '21.20000', '72.20000', 'Asia/Kolkata'],
    ])->map(function (array $city): string {
        $fields = array_fill(0, 19, '');
        $fields[0] = (string) $city[0];
        $fields[1] = $city[1];
        $fields[2] = $city[1];
        $fields[4] = $city[2];
        $fields[5] = $city[3];
        $fields[6] = 'P';
        $fields[7] = 'PPL';
        $fields[8] = 'IN';
        $fields[10] = '09';
        $fields[17] = $city[4];

        return implode("\t", $fields);
    })->implode("\n")."\n";

    $citiesArchive = new ZipArchive;
    $citiesArchive->open($sourceDirectory.'/cities1000.zip', ZipArchive::CREATE | ZipArchive::OVERWRITE);
    $citiesArchive->addFromString('cities1000.txt', $cityRows);
    $citiesArchive->close();

    $locationArchivePath = Storage::disk('local')->path('ChessX-Backend-Location-Data.zip');
    $locationArchive = new ZipArchive;
    $locationArchive->open($locationArchivePath, ZipArchive::CREATE | ZipArchive::OVERWRITE);
    $locationArchive->addFromString('assets/locations/in.geodata', json_encode([
        'v' => 1,
        'c' => 'IN',
        's' => [[
            '09',
            'Gujarat',
            [
                [1279233, 'Ahmedabad'],
                [1255364, 'Surat'],
                [999001, 'Twin City'],
                [999002, 'Twin City', 0, 'Second District'],
            ],
        ]],
    ], JSON_THROW_ON_ERROR));
    $locationArchive->addFromString('assets/locations/fr.geodata', json_encode([
        'v' => 1,
        'c' => 'FR',
        's' => [],
    ], JSON_THROW_ON_ERROR));
    $locationArchive->close();

    return [
        'archive' => $locationArchivePath,
        'source_directory' => $sourceDirectory,
    ];
}

it('imports GeoNames source IDs and coordinates while preserving matching local IDs', function () {
    $country = Country::factory()->create([
        'iso2' => 'IN',
        'iso3' => 'IND',
        'name' => 'India',
    ]);
    $state = State::factory()->for($country)->create([
        'name' => 'Gujarat',
        'code' => 'GJ',
    ]);
    $city = City::factory()->for($state)->create([
        'name' => 'Ahmedabad',
        'latitude' => null,
        'longitude' => null,
    ]);
    $fixture = createGeoNamesImportFixture();

    $this->artisan('geography:import-geonames', [
        'archive' => $fixture['archive'],
        '--source-dir' => $fixture['source_directory'],
    ])->assertSuccessful();
    $this->artisan('geography:import-geonames', [
        'archive' => $fixture['archive'],
        '--source-dir' => $fixture['source_directory'],
    ])->assertSuccessful();

    expect($country->refresh()->getKey())->toBe($country->getKey())
        ->and($country->geonames_id)->toBe(1269750)
        ->and($state->refresh()->getKey())->toBe($state->getKey())
        ->and($state->code)->toBe('GJ')
        ->and($state->geonames_code)->toBe('09')
        ->and($state->geonames_id)->toBe(1270770)
        ->and($city->refresh()->getKey())->toBe($city->getKey())
        ->and($city->geonames_id)->toBe(1279233)
        ->and($city->latitude)->toBe('23.0257900')
        ->and($city->longitude)->toBe('72.5872700')
        ->and(City::query()->count())->toBe(4)
        ->and(Country::query()->where('iso2', 'FR')->doesntExist())->toBeTrue()
        ->and(City::query()->where('name', 'Twin City')->count())->toBe(2)
        ->and(City::query()->where('geonames_id', 999002)->value('district'))->toBe('Second District');
});

it('returns local and GeoNames IDs with CC BY attribution from geography APIs', function () {
    $country = Country::factory()->create([
        'geonames_id' => 1269750,
        'iso2' => 'IN',
        'iso3' => 'IND',
        'name' => 'India',
    ]);
    $unsupportedCountry = Country::factory()->create([
        'iso2' => 'FR',
        'iso3' => 'FRA',
        'name' => 'France',
    ]);
    $state = State::factory()->for($country)->create([
        'geonames_id' => 1270770,
        'geonames_code' => '09',
    ]);
    $city = City::factory()->for($state)->create([
        'geonames_id' => 1279233,
        'district' => 'Ahmedabad',
    ]);
    Sanctum::actingAs(User::factory()->create(['status' => 'active']), ['mobile']);

    $countries = $this->getJson('/api/v1/geography/countries')->assertOk();
    $states = $this->getJson('/api/v1/geography/states?country_id='.$country->getKey())->assertOk();
    $cities = $this->getJson('/api/v1/geography/cities?state_id='.$state->getKey())->assertOk();

    $countries->assertJsonPath('data.0.id', $country->getKey())
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.geonames_id', 1269750)
        ->assertJsonPath('meta.source.name', 'GeoNames')
        ->assertJsonPath('meta.source.license', 'CC BY 4.0')
        ->assertJsonPath('meta.source.license_url', 'https://creativecommons.org/licenses/by/4.0/');
    $states->assertJsonPath('data.0.id', $state->getKey())
        ->assertJsonPath('data.0.geonames_id', 1270770)
        ->assertJsonPath('data.0.geonames_code', '09');
    $cities->assertJsonPath('data.0.id', $city->getKey())
        ->assertJsonPath('data.0.geonames_id', 1279233)
        ->assertJsonPath('data.0.district', 'Ahmedabad');
    $this->getJson('/api/v1/geography/states?country_id='.$unsupportedCountry->getKey())
        ->assertUnprocessable();
});
