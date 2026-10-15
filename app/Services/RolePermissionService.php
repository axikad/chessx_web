<?php

namespace App\Services;

use App\Models\Permission;
use App\Models\PermissionAssignmentLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class RolePermissionService
{
    public function assign(Role $role, Permission $permission, ?User $actor = null): void
    {
        $permissionIds = $role->permissions()->pluck('permissions.id')->push($permission->getKey());

        $this->sync($role, $permissionIds, $actor);
    }

    public function revoke(Role $role, Permission $permission, ?User $actor = null): void
    {
        $permissionIds = $role->permissions()->whereKeyNot($permission->getKey())->pluck('permissions.id');

        $this->sync($role, $permissionIds, $actor);
    }

    /** @param iterable<int> $permissionIds */
    public function sync(Role $role, iterable $permissionIds, ?User $actor = null): void
    {
        $requestedIds = collect($permissionIds)->map(fn (mixed $id): int => (int) $id)->unique()->values();
        $currentIds = $role->permissions()->pluck('permissions.id');
        $addedIds = $requestedIds->diff($currentIds);
        $removedIds = $currentIds->diff($requestedIds);

        DB::transaction(function () use ($role, $requestedIds, $addedIds, $removedIds, $actor): void {
            $syncData = $requestedIds->mapWithKeys(fn (int $permissionId): array => [
                $permissionId => ['assigned_by' => $actor?->getKey()],
            ])->all();

            $role->permissions()->sync($syncData);
            $this->recordChanges($role, $addedIds, 'assigned', $actor);
            $this->recordChanges($role, $removedIds, 'revoked', $actor);
        });

        $role->clearPermissionCache();
    }

    /** @param Collection<int, int> $permissionIds */
    private function recordChanges(Role $role, Collection $permissionIds, string $action, ?User $actor): void
    {
        Permission::query()->whereKey($permissionIds)->get()->each(
            function (Permission $permission) use ($role, $action, $actor): void {
                PermissionAssignmentLog::query()->create([
                    'role_id' => $role->getKey(),
                    'permission_id' => $permission->getKey(),
                    'role_name' => $role->name,
                    'permission_slug' => $permission->slug,
                    'action' => $action,
                    'performed_by' => $actor?->getKey(),
                ]);
            },
        );
    }
}
