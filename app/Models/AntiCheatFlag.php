<?php

namespace App\Models;

use App\Enums\AntiCheatSeverity;
use App\Enums\AntiCheatStatus;
use Database\Factories\AntiCheatFlagFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AntiCheatFlag extends Model
{
    /** @use HasFactory<AntiCheatFlagFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['user_id', 'game_id', 'flag_type', 'severity', 'evidence_json', 'status', 'reviewed_by', 'reviewed_at'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['severity' => AntiCheatSeverity::class, 'evidence_json' => 'array', 'status' => AntiCheatStatus::class, 'reviewed_at' => 'datetime'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Game, $this> */
    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    /** @return BelongsTo<User, $this> */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
