<?php

namespace App\Console\Commands;

use App\Services\Location\GeoNamesImporter;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Throwable;

class ImportGeoNamesGeography extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'geography:import-geonames
                            {archive : Path to ChessX-Backend-Location-Data.zip}
                            {--source-dir= : Directory containing official GeoNames source files}
                            {--countries= : Comma-separated ISO country codes; defaults to configured supported countries}
                            {--download : Download missing official GeoNames source files}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import GeoNames countries, regions, cities, source IDs, and coordinates';

    /**
     * Execute the console command.
     */
    public function handle(GeoNamesImporter $importer): int
    {
        $archivePath = realpath((string) $this->argument('archive'));

        if ($archivePath === false) {
            $this->error('The supplied ChessX location archive does not exist.');

            return self::FAILURE;
        }

        $sourceDirectory = $this->option('source-dir')
            ? (string) $this->option('source-dir')
            : storage_path('app/private/geonames');
        File::ensureDirectoryExists($sourceDirectory);
        $countryCodes = $this->countryCodes();

        try {
            $this->prepareSources($sourceDirectory);
            $this->info('Importing GeoNames geography data...');
            $counts = $importer->import(
                $archivePath,
                $sourceDirectory,
                $countryCodes,
                fn (string $iso2, int $current, int $total) => $this->output->write("\r{$current}/{$total} {$iso2}"),
            );
        } catch (Throwable $exception) {
            $this->newLine();
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        $this->newLine(2);
        $this->table(['Record type', 'Imported'], [
            ['Countries', $counts['countries']],
            ['States/regions', $counts['states']],
            ['Cities', $counts['cities']],
            ['Cities without coordinates', $counts['cities_without_coordinates']],
        ]);
        $this->info('GeoNames import completed. Local database IDs were preserved where existing records matched.');

        return self::SUCCESS;
    }

    /** @return list<string> */
    private function countryCodes(): array
    {
        $configuredCountries = $this->option('countries')
            ? explode(',', (string) $this->option('countries'))
            : config('geography.supported_countries', []);

        return collect($configuredCountries)
            ->map(fn (string $code): string => strtoupper(trim($code)))
            ->filter(fn (string $code): bool => preg_match('/^[A-Z]{2}$/', $code) === 1)
            ->unique()
            ->values()
            ->all();
    }

    private function prepareSources(string $sourceDirectory): void
    {
        /** @var list<string> $sourceFiles */
        $sourceFiles = config('geography.geonames.source_files');
        $missingFiles = array_values(array_filter(
            $sourceFiles,
            fn (string $filename): bool => ! File::isFile($sourceDirectory.DIRECTORY_SEPARATOR.$filename),
        ));

        if ($missingFiles === []) {
            return;
        }

        if (! $this->option('download')) {
            throw new \RuntimeException(
                'Missing GeoNames source files: '.implode(', ', $missingFiles).'. Re-run with --download.',
            );
        }

        $baseUrl = rtrim((string) config('geography.geonames.download_base_url'), '/');

        foreach ($missingFiles as $filename) {
            $this->line("Downloading {$filename}...");
            $path = $sourceDirectory.DIRECTORY_SEPARATOR.$filename;
            $response = Http::connectTimeout(10)
                ->timeout(180)
                ->retry([500, 1000])
                ->sink($path)
                ->get($baseUrl.'/'.$filename);

            if (! $response->successful()) {
                File::delete($path);
                $response->throw();
            }
        }
    }
}
