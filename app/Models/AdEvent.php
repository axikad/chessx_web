<?php

namespace App\Models;

use App\Enums\AdEventType;
use Database\Factories\AdEventFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdEvent extends Model
{
    /** @use HasFactory<AdEventFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    /** @var list<string> */
    protected $fillable = ['user_id', 'placement', 'event_type', 'provider', 'session_id', 'provider_event_id'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['event_type' => AdEventType::class];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
