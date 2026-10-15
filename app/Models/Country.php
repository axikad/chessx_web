<?php

namespace App\Models;

use Database\Factories\CountryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Country extends Model
{
    /** @use HasFactory<CountryFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['iso2', 'iso3', 'name', 'status'];

    /** @return HasMany<State, $this> */
    public function states(): HasMany
    {
        return $this->hasMany(State::class);
    }
}
