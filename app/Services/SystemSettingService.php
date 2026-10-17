<?php

namespace App\Services;

use App\Enums\SystemSettingType;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use InvalidArgumentException;
use JsonException;

class SystemSettingService
{
    /** @return array<string, mixed> */
    public function all(): array
    {
        return Cache::rememberForever(SystemSetting::CACHE_KEY, fn (): array => SystemSetting::query()
            ->orderBy('key')
            ->get()
            ->mapWithKeys(fn (SystemSetting $setting): array => [$setting->key => $setting->typedValue()])
            ->all());
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->all()[$key] ?? $default;
    }

    public function integer(string $key, int $default): int
    {
        return (int) $this->get($key, $default);
    }

    public function float(string $key, float $default): float
    {
        return (float) $this->get($key, $default);
    }

    public function boolean(string $key, bool $default): bool
    {
        return (bool) $this->get($key, $default);
    }

    public function string(string $key, string $default): string
    {
        return (string) $this->get($key, $default);
    }

    public function set(string $key, mixed $value, ?User $updatedBy = null): SystemSetting
    {
        $setting = SystemSetting::query()->where('key', $key)->firstOrFail();

        $setting->forceFill([
            'value' => $this->serialize($setting->type, $value),
            'updated_by' => $updatedBy?->getKey(),
        ])->save();

        return $setting->refresh();
    }

    private function serialize(SystemSettingType $type, mixed $value): string
    {
        return match ($type) {
            SystemSettingType::String => $this->serializeString($value),
            SystemSettingType::Integer => $this->serializeInteger($value),
            SystemSettingType::Float => $this->serializeFloat($value),
            SystemSettingType::Boolean => $this->serializeBoolean($value),
            SystemSettingType::Json => $this->serializeJson($value),
        };
    }

    private function serializeString(mixed $value): string
    {
        if (! is_string($value)) {
            throw new InvalidArgumentException('The setting value must be a string.');
        }

        return $value;
    }

    private function serializeInteger(mixed $value): string
    {
        $integer = filter_var($value, FILTER_VALIDATE_INT);

        if ($integer === false) {
            throw new InvalidArgumentException('The setting value must be an integer.');
        }

        return (string) $integer;
    }

    private function serializeFloat(mixed $value): string
    {
        if (! is_numeric($value)) {
            throw new InvalidArgumentException('The setting value must be numeric.');
        }

        return (string) ((float) $value);
    }

    private function serializeBoolean(mixed $value): string
    {
        $boolean = filter_var($value, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE);

        if ($boolean === null) {
            throw new InvalidArgumentException('The setting value must be boolean.');
        }

        return $boolean ? 'true' : 'false';
    }

    /** @throws JsonException */
    private function serializeJson(mixed $value): string
    {
        if (! is_array($value)) {
            throw new InvalidArgumentException('The setting value must be an array.');
        }

        return json_encode($value, JSON_THROW_ON_ERROR);
    }
}
