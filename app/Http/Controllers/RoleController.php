<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\SyncRolePermissionsRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Models\Module;
use App\Models\Role;
use App\Services\RolePermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        Gate::authorize('roles.read');

        return response()->json(['data' => Role::query()->withCount('users')->with('permissions:id')->orderBy('name')->get()->map(fn (Role $role): array => $this->data($role)), 'modules' => Module::query()->where('is_active', true)->with(['permissions' => fn ($query) => $query->where('is_active', true)->orderBy('name')])->orderBy('sort_order')->get()]);
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = Role::query()->create($request->validated());

        return response()->json(['data' => $this->data($role), 'message' => 'Role created successfully.'], 201);
    }

    public function show(Role $role): JsonResponse
    {
        Gate::authorize('roles.read');

        return response()->json(['data' => $this->data($role->loadCount('users')->load('permissions:id'))]);
    }

    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $role->update($request->validated());

        return response()->json(['data' => $this->data($role->loadCount('users')->load('permissions:id')), 'message' => 'Role updated successfully.']);
    }

    public function destroy(Request $request, Role $role): JsonResponse
    {
        Gate::authorize('roles.delete');
        abort_if($role->slug === 'super_admin', 422, 'Super Admin role cannot be deleted.');
        abort_if($role->users()->exists(), 422, 'Move users to another role before deleting this role.');
        $role->delete();

        return response()->json(['message' => 'Role deleted successfully.']);
    }

    public function syncPermissions(SyncRolePermissionsRequest $request, Role $role, RolePermissionService $service): JsonResponse
    {
        $service->sync($role, $request->validated('permission_ids'), $request->user());

        return response()->json(['data' => $this->data($role->loadCount('users')->load('permissions:id')), 'message' => 'Permissions updated successfully.']);
    }

    /** @return array<string, mixed> */
    private function data(Role $role): array
    {
        return ['id' => (string) $role->id, 'name' => $role->name, 'slug' => $role->slug, 'description' => $role->description ?? '', 'userCount' => $role->users_count ?? $role->users()->count(), 'isSystem' => $role->slug === 'super_admin', 'permissionIds' => $role->relationLoaded('permissions') ? $role->permissions->modelKeys() : []];
    }
}
