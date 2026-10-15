<?php

namespace App\Models;

use Database\Factories\RoleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class Role extends Model
{
    /** @use HasFactory<RoleFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'slug',
    ];

    /**
     * @return HasMany<User, $this>
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /** @return BelongsToMany<Permission, $this> */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class)->withPivot('assigned_by')->withTimestamps();
    }

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissionSlugs(), true);
    }

    /** @return list<string> */
    public function permissionSlugs(): array
    {
        return Cache::rememberForever(
            self::permissionCacheKey($this->getKey()),
            fn (): array => $this->permissions()->where('is_active', true)->pluck('slug')->all(),
        );
    }

    public function clearPermissionCache(): void
    {
        Cache::forget(self::permissionCacheKey($this->getKey()));
    }

    public static function permissionCacheKey(int|string $roleId): string
    {
        return "role_permissions:{$roleId}";
    }
}
