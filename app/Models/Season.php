<?php

namespace App\Models;

use App\Enums\SeasonStatus;
use Database\Factories\SeasonFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use InvalidArgumentException;

class Season extends Model
{
    /** @use HasFactory<SeasonFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['name', 'starts_at', 'ends_at', 'status'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'status' => SeasonStatus::class,
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Season $season): void {
            if ($season->ends_at->lessThanOrEqualTo($season->starts_at)) {
                throw new InvalidArgumentException('A season must end after it starts.');
            }

            if ($season->status === SeasonStatus::Active
                && Season::query()->where('status', SeasonStatus::Active)->whereKeyNot($season->getKey())->exists()
            ) {
                throw new InvalidArgumentException('Only one season can be active at a time.');
            }
        });
    }

    /** @return HasMany<PlayerCompetition, $this> */
    public function playerCompetitions(): HasMany
    {
        return $this->hasMany(PlayerCompetition::class);
    }

    /** @return HasMany<LeaderboardSnapshot, $this> */
    public function leaderboardSnapshots(): HasMany
    {
        return $this->hasMany(LeaderboardSnapshot::class);
    }

    /** @return HasMany<Game, $this> */
    public function games(): HasMany
    {
        return $this->hasMany(Game::class);
    }

    /** @return HasMany<Tournament, $this> */
    public function tournaments(): HasMany
    {
        return $this->hasMany(Tournament::class);
    }
}
