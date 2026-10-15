<?php

namespace App\Models;

use Database\Factories\PermissionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class Permission extends Model
{
    /** @use HasFactory<PermissionFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['module_id', 'name', 'slug', 'action', 'description', 'is_active', 'created_by', 'updated_by'];

    protected static function booted(): void
    {
        static::saved(function (Permission $permission): void {
            $permission->roles()->pluck('roles.id')->each(
                fn (int $roleId) => Cache::forget(Role::permissionCacheKey($roleId)),
            );
        });

        static::deleting(function (Permission $permission): void {
            $permission->roles()->pluck('roles.id')->each(
                fn (int $roleId) => Cache::forget(Role::permissionCacheKey($roleId)),
            );
        });
    }

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    /** @return BelongsTo<Module, $this> */
    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    /** @return BelongsToMany<Role, $this> */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withPivot('assigned_by')->withTimestamps();
    }

    /** @return HasMany<PermissionAssignmentLog, $this> */
    public function assignmentLogs(): HasMany
    {
        return $this->hasMany(PermissionAssignmentLog::class);
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return BelongsTo<User, $this> */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
