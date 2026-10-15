<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Carbon\CarbonInterface;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'role_id',
        'name',
        'username',
        'email',
        'phone',
        'avatar_path',
        'password',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'username_changed_at' => 'datetime',
            'password' => 'hashed',
            'last_login_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Role, $this>
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * @return HasOne<UserProfile, $this>
     */
    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    /** @return HasMany<UserLocation, $this> */
    public function locations(): HasMany
    {
        return $this->hasMany(UserLocation::class);
    }

    /** @return HasOne<UserLocation, $this> */
    public function currentLocation(): HasOne
    {
        return $this->hasOne(UserLocation::class)->where('is_current', true);
    }

    /** @return HasMany<LocationChangeRequest, $this> */
    public function locationChangeRequests(): HasMany
    {
        return $this->hasMany(LocationChangeRequest::class);
    }

    /** @return HasMany<LocationChangeHistory, $this> */
    public function locationChangeHistory(): HasMany
    {
        return $this->hasMany(LocationChangeHistory::class);
    }

    /** @return HasMany<PlayerCompetition, $this> */
    public function playerCompetitions(): HasMany
    {
        return $this->hasMany(PlayerCompetition::class);
    }

    /** @return HasMany<PlayerRating, $this> */
    public function playerRatings(): HasMany
    {
        return $this->hasMany(PlayerRating::class);
    }

    /** @return HasMany<LeaderboardSnapshot, $this> */
    public function leaderboardSnapshots(): HasMany
    {
        return $this->hasMany(LeaderboardSnapshot::class);
    }

    protected static function booted(): void
    {
        static::creating(function (User $user): void {
            $user->uuid ??= (string) Str::uuid();

            if ($user->username === null || $user->username === '') {
                $base = Str::of($user->name)
                    ->lower()
                    ->ascii()
                    ->replaceMatches('/[^a-z0-9]+/', '_')
                    ->trim('_')
                    ->limit(20, '')
                    ->value();

                $user->username = ($base !== '' ? $base : 'user').'_'.Str::lower(Str::random(6));
            }
        });
    }

    public function isSuperAdmin(): bool
    {
        return $this->role?->slug === 'super_admin';
    }

    public function hasPermission(string $permission): bool
    {
        return $this->role?->hasPermission($permission) ?? false;
    }

    public function usernameChangeAvailableAt(): ?CarbonInterface
    {
        return $this->username_changed_at?->copy()->addDays(30);
    }

    public function canChangeUsername(): bool
    {
        $availableAt = $this->usernameChangeAvailableAt();

        return $availableAt === null || $availableAt->isPast();
    }
}
