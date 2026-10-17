<?php

namespace App\Models;

use Database\Factories\MobileSessionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Sanctum\PersonalAccessToken;

class MobileSession extends Model
{
    /** @use HasFactory<MobileSessionFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'user_id',
        'access_token_id',
        'device_name',
        'platform',
        'device_identifier_hash',
        'refresh_token_hash',
        'refresh_token_expires_at',
        'last_refreshed_at',
        'last_ip_address',
        'user_agent',
        'revoked_at',
    ];

    /** @var list<string> */
    protected $hidden = ['device_identifier_hash', 'refresh_token_hash'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'refresh_token_expires_at' => 'datetime',
            'last_refreshed_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<PersonalAccessToken, $this> */
    public function accessToken(): BelongsTo
    {
        return $this->belongsTo(PersonalAccessToken::class);
    }
}
