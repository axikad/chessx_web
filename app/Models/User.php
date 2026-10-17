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
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

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
        'onboarding_completed_at',
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
            'onboarding_completed_at' => 'datetime',
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

    /** @return HasMany<UserAuthProvider, $this> */
    public function authProviders(): HasMany
    {
        return $this->hasMany(UserAuthProvider::class);
    }

    /** @return HasMany<MobileSession, $this> */
    public function mobileSessions(): HasMany
    {
        return $this->hasMany(MobileSession::class);
    }

    /** @return HasMany<LeaderboardSnapshot, $this> */
    public function leaderboardSnapshots(): HasMany
    {
        return $this->hasMany(LeaderboardSnapshot::class);
    }

    /** @return HasMany<Game, $this> */
    public function whiteGames(): HasMany
    {
        return $this->hasMany(Game::class, 'white_user_id');
    }

    /** @return HasMany<Game, $this> */
    public function blackGames(): HasMany
    {
        return $this->hasMany(Game::class, 'black_user_id');
    }

    /** @return HasMany<GameMove, $this> */
    public function gameMoves(): HasMany
    {
        return $this->hasMany(GameMove::class);
    }

    /** @return HasMany<MatchmakingQueue, $this> */
    public function matchmakingEntries(): HasMany
    {
        return $this->hasMany(MatchmakingQueue::class);
    }

    /** @return HasMany<RatingHistory, $this> */
    public function ratingHistories(): HasMany
    {
        return $this->hasMany(RatingHistory::class);
    }

    /** @return HasMany<TournamentEntry, $this> */
    public function tournamentEntries(): HasMany
    {
        return $this->hasMany(TournamentEntry::class);
    }

    /** @return HasMany<TournamentQualifier, $this> */
    public function tournamentQualifiers(): HasMany
    {
        return $this->hasMany(TournamentQualifier::class);
    }

    /** @return HasMany<DeviceToken, $this> */
    public function deviceTokens(): HasMany
    {
        return $this->hasMany(DeviceToken::class);
    }

    /** @return HasMany<UserNotification, $this> */
    public function chessNotifications(): HasMany
    {
        return $this->hasMany(UserNotification::class);
    }

    /** @return HasMany<UserReport, $this> */
    public function reportsFiled(): HasMany
    {
        return $this->hasMany(UserReport::class, 'reporter_user_id');
    }

    /** @return HasMany<UserReport, $this> */
    public function reportsReceived(): HasMany
    {
        return $this->hasMany(UserReport::class, 'reported_user_id');
    }

    /** @return HasMany<AntiCheatFlag, $this> */
    public function antiCheatFlags(): HasMany
    {
        return $this->hasMany(AntiCheatFlag::class);
    }

    /** @return HasMany<IdempotencyKey, $this> */
    public function idempotencyKeys(): HasMany
    {
        return $this->hasMany(IdempotencyKey::class);
    }

    /** @return HasMany<AdEvent, $this> */
    public function adEvents(): HasMany
    {
        return $this->hasMany(AdEvent::class);
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

    /**
     * @return array{
     *     required: bool,
     *     next_step: 'location'|'profile'|'complete',
     *     completed_at: string|null,
     *     steps: array{location_completed: bool, profile_completed: bool}
     * }
     */
    public function onboardingStatus(): array
    {
        $this->loadMissing(['role', 'currentLocation']);

        $isPlayer = $this->role?->slug === 'user';
        $locationCompleted = ! $isPlayer || $this->currentLocation !== null;
        $profileCompleted = ! $isPlayer || $this->onboarding_completed_at !== null;
        $required = ! $locationCompleted || ! $profileCompleted;

        return [
            'required' => $required,
            'next_step' => ! $locationCompleted ? 'location' : (! $profileCompleted ? 'profile' : 'complete'),
            'completed_at' => $this->onboarding_completed_at?->toIso8601String(),
            'steps' => [
                'location_completed' => $locationCompleted,
                'profile_completed' => $profileCompleted,
            ],
        ];
    }
}
