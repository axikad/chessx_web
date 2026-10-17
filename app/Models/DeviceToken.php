<?php

namespace App\Models;

use App\Enums\DevicePlatform;
use Database\Factories\DeviceTokenFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeviceToken extends Model
{
    /** @use HasFactory<DeviceTokenFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['user_id', 'platform', 'push_token', 'last_seen_at'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['platform' => DevicePlatform::class, 'last_seen_at' => 'datetime'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
