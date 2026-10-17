<?php

namespace App\Models;

use Database\Factories\CityFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class City extends Model
{
    /** @use HasFactory<CityFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'geonames_id',
        'state_id',
        'name',
        'normalized_name',
        'district',
        'latitude',
        'longitude',
        'timezone',
        'status',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    /** @return BelongsTo<State, $this> */
    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }

    /** @return HasMany<UserLocation, $this> */
    public function userLocations(): HasMany
    {
        return $this->hasMany(UserLocation::class);
    }

    protected static function booted(): void
    {
        static::saving(function (City $city): void {
            if ($city->isDirty('name') || $city->normalized_name === null) {
                $city->normalized_name = Str::of($city->name)->ascii()->lower()->squish()->toString();
            }
        });
    }
}
