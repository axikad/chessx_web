<?php

namespace App\Models;

use App\Enums\SystemSettingType;
use Database\Factories\SystemSettingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;
use JsonException;

class SystemSetting extends Model
{
    /** @use HasFactory<SystemSettingFactory> */
    use HasFactory;

    public const CACHE_KEY = 'system-settings.values.v1';

    /** @var list<string> */
    protected $fillable = ['key', 'group', 'value', 'type', 'description', 'updated_by'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['type' => SystemSettingType::class];
    }

    protected static function booted(): void
    {
        static::saved(function (): void {
            Cache::forget(self::CACHE_KEY);
        });
        static::deleted(function (): void {
            Cache::forget(self::CACHE_KEY);
        });
    }

    /** @throws JsonException */
    public function typedValue(): mixed
    {
        return match ($this->type) {
            SystemSettingType::String => $this->value,
            SystemSettingType::Integer => (int) $this->value,
            SystemSettingType::Float => (float) $this->value,
            SystemSettingType::Boolean => filter_var($this->value, FILTER_VALIDATE_BOOL),
            SystemSettingType::Json => json_decode($this->value, true, 512, JSON_THROW_ON_ERROR),
        };
    }

    /** @return BelongsTo<User, $this> */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
