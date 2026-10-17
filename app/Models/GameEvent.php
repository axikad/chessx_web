<?php

namespace App\Models;

use Database\Factories\GameEventFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameEvent extends Model
{
    /** @use HasFactory<GameEventFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    /** @var list<string> */
    protected $fillable = ['game_id', 'actor_user_id', 'sequence_number', 'event_type', 'payload_json'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['sequence_number' => 'integer', 'payload_json' => 'array'];
    }

    /** @return BelongsTo<Game, $this> */
    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    /** @return BelongsTo<User, $this> */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
