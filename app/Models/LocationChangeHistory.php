<?php

namespace App\Models;

use Database\Factories\LocationChangeHistoryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LocationChangeHistory extends Model
{
    /** @use HasFactory<LocationChangeHistoryFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    /** @var list<string> */
    protected $fillable = ['user_id', 'old_city_id', 'new_city_id', 'change_request_id', 'changed_at'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['changed_at' => 'datetime'];
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

    /** @return BelongsTo<LocationChangeRequest, $this> */
    public function changeRequest(): BelongsTo
    {
        return $this->belongsTo(LocationChangeRequest::class);
    }
}
