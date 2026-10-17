<?php

namespace App\Models;

use App\Enums\CompetitionTierCode;
use Database\Factories\CompetitionRegionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use LogicException;

class CompetitionRegion extends Model
{
    /** @use HasFactory<CompetitionRegionFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['tier_id', 'country_id', 'state_id', 'city_id', 'name', 'status'];

    /** @return BelongsTo<CompetitionTier, $this> */
    public function tier(): BelongsTo
    {
        return $this->belongsTo(CompetitionTier::class, 'tier_id');
    }

    /** @return BelongsTo<Country, $this> */
    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    /** @return BelongsTo<State, $this> */
    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }

    /** @return BelongsTo<City, $this> */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /** @return HasMany<LeaderboardSnapshot, $this> */
    public function leaderboardSnapshots(): HasMany
    {
        return $this->hasMany(LeaderboardSnapshot::class, 'region_id');
    }

    /** @return HasMany<Game, $this> */
    public function games(): HasMany
    {
        return $this->hasMany(Game::class, 'region_id');
    }

    /** @return HasMany<MatchmakingQueue, $this> */
    public function matchmakingEntries(): HasMany
    {
        return $this->hasMany(MatchmakingQueue::class, 'region_id');
    }

    /** @return HasMany<Tournament, $this> */
    public function tournaments(): HasMany
    {
        return $this->hasMany(Tournament::class, 'region_id');
    }

    protected static function booted(): void
    {
        static::saving(function (CompetitionRegion $region): void {
            $code = $region->tier()->value('code');
            $codeValue = $code instanceof CompetitionTierCode ? $code->value : $code;
            $foreignKeys = [$region->country_id, $region->state_id, $region->city_id];

            $region->scope_key = match ($codeValue) {
                CompetitionTierCode::City->value => $region->city_id !== null && $region->country_id === null && $region->state_id === null
                    ? 'city:'.$region->city_id : throw new LogicException('City regions must reference only a city.'),
                CompetitionTierCode::State->value => $region->state_id !== null && $region->country_id === null && $region->city_id === null
                    ? 'state:'.$region->state_id : throw new LogicException('State regions must reference only a state.'),
                CompetitionTierCode::National->value => $region->country_id !== null && $region->state_id === null && $region->city_id === null
                    ? 'country:'.$region->country_id : throw new LogicException('National regions must reference only a country.'),
                CompetitionTierCode::World->value => collect($foreignKeys)->every(fn ($value): bool => $value === null)
                    ? 'global' : throw new LogicException('World regions cannot reference a geographic record.'),
                default => throw new LogicException('The competition tier is not supported.'),
            };
        });
    }
}
