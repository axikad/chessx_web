<?php

namespace App\Models;

use Database\Factories\LocationChangeRequestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LocationChangeRequest extends Model
{
    /** @use HasFactory<LocationChangeRequestFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['user_id', 'old_city_id', 'new_city_id', 'verification_method', 'status', 'requested_at', 'reviewed_at', 'reviewed_by', 'reason'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['requested_at' => 'datetime', 'reviewed_at' => 'datetime'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<City, $this> */
    public function oldCity(): BelongsTo
    {
        return $this->belongsTo(City::class, 'old_city_id');
    }

    /** @return BelongsTo<City, $this> */
    public function newCity(): BelongsTo
    {
        return $this->belongsTo(City::class, 'new_city_id');
    }

    /** @return BelongsTo<User, $this> */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
