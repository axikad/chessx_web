<?php

namespace App\Models;

use App\Enums\AuthProvider;
use Database\Factories\UserAuthProviderFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserAuthProvider extends Model
{
    /** @use HasFactory<UserAuthProviderFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'user_id',
        'provider',
        'provider_user_id',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'provider' => AuthProvider::class,
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class)->withTrashed();
    }
}
