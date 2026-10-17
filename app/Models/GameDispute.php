<?php

namespace App\Models;

use App\Enums\GameDisputeStatus;
use Database\Factories\GameDisputeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameDispute extends Model
{
    /** @use HasFactory<GameDisputeFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['game_id', 'reporting_user_id', 'reason', 'description', 'status', 'resolution', 'reviewed_by', 'reviewed_at'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['status' => GameDisputeStatus::class, 'reviewed_at' => 'datetime'];
    }

    /** @return BelongsTo<Game, $this> */
    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    /** @return BelongsTo<User, $this> */
    public function reportingUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporting_user_id');
    }

    /** @return BelongsTo<User, $this> */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
