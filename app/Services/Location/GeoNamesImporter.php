<?php

namespace App\Services\Location;

use App\Models\City;
use App\Models\Country;
use App\Models\State;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use JsonException;
use RuntimeException;
use ZipArchive;

class GeoNamesImporter
{
    /**
     * @param  list<string>  $countryCodes
     * @param  (callable(string, int, int): void)|null  $progress
     * @return array{countries: int, states: int, cities: int, cities_without_coordinates: int}
     */
    public function import(
        string $locationArchivePath,
        string $sourceDirectory,
        array $countryCodes,
        ?callable $progress = null,
    ): array {
        $this->assertReadableFile($locationArchivePath);

        $countryInfo = $this->countryInfo($sourceDirectory.DIRECTORY_SEPARATOR.'countryInfo.txt');
        $adminRegions = $this->adminRegions($sourceDirectory.DIRECTORY_SEPARATOR.'admin1CodesASCII.txt');
        $coordinates = $this->cityCoordinates($sourceDirectory);
        $archive = $this->openArchive($locationArchivePath);
        $entries = $this->locationEntries($archive, $countryCodes);
        $counts = [
            'countries' => 0,
            'states' => 0,
            'cities' => 0,
            'cities_without_coordinates' => 0,
        ];

        foreach ($entries as $index => $entry) {
            $document = $this->decodeLocationDocument($archive, $entry);
            $iso2 = strtoupper((string) ($document['c'] ?? ''));
            $sourceCountry = $countryInfo[$iso2] ?? null;

            if ($sourceCountry === null) {
                throw new RuntimeException("GeoNames country metadata is missing for {$iso2}.");
            }

            DB::transaction(function () use (
                $document,
                $iso2,
                $sourceCountry,
                $adminRegions,
                $coordinates,
                &$counts,
            ): void {
                $country = Country::query()->updateOrCreate(
                    ['iso2' => $iso2],
                    [
                        'geonames_id' => $sourceCountry['geonames_id'],
                        'iso3' => $sourceCountry['iso3'],
                        'name' => $sourceCountry['name'],
                        'status' => 'active',
                    ],
                );
                $counts['countries']++;

                foreach ($document['s'] ?? [] as $stateRow) {
                    $this->importState(
                        $country,
                        $iso2,
                        $stateRow,
                        $adminRegions,
                        $coordinates,
                        $counts,
                    );
                }
            }, 3);

            if ($progress !== null) {
                $progress($iso2, $index + 1, count($entries));
            }
        }

        $archive->close();

        return $counts;
    }

    /**
     * @param  array<int, mixed>  $stateRow
     * @param  array<string, array{geonames_id: int, name: string}>  $adminRegions
     * @param  array<int, string>  $coordinates
     * @param  array{countries: int, states: int, cities: int, cities_without_coordinates: int}  $counts
     */
    private function importState(
        Country $country,
        string $iso2,
        array $stateRow,
        array $adminRegions,
        array $coordinates,
        array &$counts,
    ): void {
        $geonamesCode = (string) ($stateRow[0] ?? '00');
        $stateName = $stateRow[1] === null
            ? 'No state or region listed'
            : Str::limit((string) $stateRow[1], 150, '');
        $adminRegion = $adminRegions[$iso2.'.'.$geonamesCode] ?? null;
        $state = $this->findState($country, $stateName, $geonamesCode, $adminRegion['geonames_id'] ?? null);
        $state->fill([
            'country_id' => $country->getKey(),
            'geonames_id' => $adminRegion['geonames_id'] ?? null,
            'name' => $stateName,
            'code' => $state->code ?? $geonamesCode,
            'geonames_code' => $geonamesCode,
            'status' => 'active',
        ])->save();
        $counts['states']++;

        $unmappedCities = $state->cities()
            ->whereNull('geonames_id')
            ->get()
            ->groupBy('normalized_name');
        $mappedCities = $state->cities()
            ->whereNotNull('geonames_id')
            ->get()
            ->keyBy('geonames_id');
        $claimedExistingIds = [];
        $cityRows = [];

        foreach ($stateRow[2] ?? [] as $cityRow) {
            $geonamesId = (int) ($cityRow[0] ?? 0);
            $name = Str::limit((string) ($cityRow[1] ?? ''), 200, '');
            $normalizedName = Str::of($name)->ascii()->lower()->squish()->toString();
            $district = isset($cityRow[3]) && $cityRow[3] !== ''
                ? Str::limit((string) $cityRow[3], 200, '')
                : null;
            $coordinate = isset($coordinates[$geonamesId])
                ? explode("\t", $coordinates[$geonamesId], 3)
                : null;

            if ($coordinate === null) {
                $counts['cities_without_coordinates']++;
            }

            $mappedCity = $mappedCities->get($geonamesId);

            $attributes = [
                'geonames_id' => $geonamesId,
                'state_id' => $state->getKey(),
                'name' => $name,
                'normalized_name' => $normalizedName,
                'district' => $district,
                'latitude' => $coordinate[0] ?? $mappedCity?->latitude,
                'longitude' => $coordinate[1] ?? $mappedCity?->longitude,
                'timezone' => $coordinate[2] ?? $mappedCity?->timezone,
                'status' => 'active',
                'updated_at' => now(),
            ];

            $existing = $unmappedCities->get($normalizedName)?->first(
                fn (City $city): bool => ! isset($claimedExistingIds[$city->getKey()]),
            );

            if ($existing instanceof City) {
                $existing->forceFill($attributes)->saveQuietly();
                $claimedExistingIds[$existing->getKey()] = true;
            } else {
                $cityRows[] = [...$attributes, 'created_at' => now()];
            }

            $counts['cities']++;
        }

        foreach (array_chunk($cityRows, 1000) as $chunk) {
            City::query()->upsert(
                $chunk,
                ['geonames_id'],
                [
                    'state_id',
                    'name',
                    'normalized_name',
                    'district',
                    'latitude',
                    'longitude',
                    'timezone',
                    'status',
                    'updated_at',
                ],
            );
        }
    }

    /** @param array{geonames_id: int, name: string}|null $adminRegion */
    private function findState(Country $country, string $name, string $geonamesCode, ?int $geonamesId): State
    {
        $state = $geonamesId === null
            ? null
            : State::query()->where('geonames_id', $geonamesId)->first();

        $state ??= State::query()
            ->whereBelongsTo($country)
            ->where('geonames_code', $geonamesCode)
            ->first();
        $state ??= State::query()
            ->whereBelongsTo($country)
            ->where('name', $name)
            ->first();

        return $state ?? new State;
    }

    /** @return array<string, array{iso3: string, name: string, geonames_id: int}> */
    private function countryInfo(string $path): array
    {
        $this->assertReadableFile($path);
        $countries = [];
        $stream = fopen($path, 'rb');

        if ($stream === false) {
            throw new RuntimeException("Unable to open {$path}.");
        }

        while (($line = fgets($stream)) !== false) {
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            $fields = explode("\t", rtrim($line, "\r\n"));

            if (count($fields) < 17) {
                continue;
            }

            $countries[strtoupper($fields[0])] = [
                'iso3' => strtoupper($fields[1]),
                'name' => Str::limit($fields[4], 100, ''),
                'geonames_id' => (int) $fields[16],
            ];
        }

        fclose($stream);

        return $countries;
    }

    /** @return array<string, array{geonames_id: int, name: string}> */
    private function adminRegions(string $path): array
    {
        $this->assertReadableFile($path);
        $regions = [];
        $stream = fopen($path, 'rb');

        if ($stream === false) {
            throw new RuntimeException("Unable to open {$path}.");
        }

        while (($line = fgets($stream)) !== false) {
            $fields = explode("\t", rtrim($line, "\r\n"));

            if (count($fields) < 4) {
                continue;
            }

            $regions[$fields[0]] = [
                'name' => $fields[1],
                'geonames_id' => (int) $fields[3],
            ];
        }

        fclose($stream);

        return $regions;
    }

    /** @return array<int, string> */
    private function cityCoordinates(string $sourceDirectory): array
    {
        $coordinates = [];

        /** @var array<string, string> $coordinateArchives */
        $coordinateArchives = config('geography.geonames.coordinate_archives');

        foreach ($coordinateArchives as $archiveName => $entryName) {
            $path = $sourceDirectory.DIRECTORY_SEPARATOR.$archiveName;
            $this->assertReadableFile($path);
            $archive = $this->openArchive($path);

            if ($archive->locateName($entryName) === false) {
                throw new RuntimeException("{$archiveName} does not contain {$entryName}.");
            }

            $stream = $archive->getStream($entryName);

            if ($stream === false) {
                throw new RuntimeException("Unable to read {$entryName}.");
            }

            while (($line = fgets($stream)) !== false) {
                $fields = explode("\t", rtrim($line, "\r\n"));

                if (count($fields) < 18) {
                    continue;
                }

                $coordinates[(int) $fields[0]] = $fields[4]."\t".$fields[5]."\t".$fields[17];
            }

            fclose($stream);
            $archive->close();
        }

        return $coordinates;
    }

    /**
     * @param  list<string>  $countryCodes
     * @return list<string>
     */
    private function locationEntries(ZipArchive $archive, array $countryCodes): array
    {
        $entries = [];
        $allowedCountryCodes = array_fill_keys(
            array_map(static fn (string $code): string => strtolower($code), $countryCodes),
            true,
        );

        for ($index = 0; $index < $archive->numFiles; $index++) {
            $name = $archive->getNameIndex($index);

            if (
                is_string($name)
                && preg_match('#^assets/locations/([a-z]{2})\.geodata$#', $name, $matches) === 1
                && isset($allowedCountryCodes[$matches[1]])
            ) {
                $entries[] = $name;
            }
        }

        sort($entries);

        if ($entries === []) {
            throw new RuntimeException('The location archive does not contain data for the selected countries.');
        }

        return $entries;
    }

    /** @return array{c: string, s: array<int, array<int, mixed>>} */
    private function decodeLocationDocument(ZipArchive $archive, string $entry): array
    {
        $contents = $archive->getFromName($entry);

        if (! is_string($contents)) {
            throw new RuntimeException("Unable to read {$entry}.");
        }

        try {
            $document = json_decode($contents, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw new RuntimeException("Invalid JSON in {$entry}.", previous: $exception);
        }

        if (! is_array($document) || ! isset($document['c']) || ! is_array($document['s'] ?? null)) {
            throw new RuntimeException("Invalid location data structure in {$entry}.");
        }

        return $document;
    }

    private function openArchive(string $path): ZipArchive
    {
        $archive = new ZipArchive;
        $result = $archive->open($path);

        if ($result !== true) {
            throw new RuntimeException("Unable to open ZIP archive {$path}; error code {$result}.");
        }

        return $archive;
    }

    private function assertReadableFile(string $path): void
    {
        if (! is_file($path) || ! is_readable($path)) {
            throw new RuntimeException("Required file is not readable: {$path}");
        }
    }
}
