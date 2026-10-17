<?php

return [
    'supported_countries' => ['IN', 'US', 'GB'],

    'geonames' => [
        'download_base_url' => 'https://download.geonames.org/export/dump',
        'source_files' => [
            'cities1000.zip',
            'admin1CodesASCII.txt',
            'countryInfo.txt',
        ],
        'coordinate_archives' => [
            'cities1000.zip' => 'cities1000.txt',
        ],
        'attribution' => [
            'name' => 'GeoNames',
            'url' => 'https://www.geonames.org/',
            'license' => 'CC BY 4.0',
            'license_url' => 'https://creativecommons.org/licenses/by/4.0/',
            'notice' => 'Location data from GeoNames (geonames.org), licensed under CC BY 4.0.',
            'changes' => 'Filtered to supported populated places, mapped to ChessX database IDs, and enriched with coordinates for nearby-city resolution.',
        ],
    ],
];
