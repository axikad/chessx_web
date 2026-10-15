<?php

namespace App\Models;

use Database\Factories\UserLocationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserLocation extends Model
{
    /** @use HasFactory<UserLocationFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['user_id', 'city_id', 'verification_method', 'verified_at', 'policy_version', 'is_current'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['verified_at' => 'datetime', 'is_current' => 'boolean'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<City, $this> */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }
}
