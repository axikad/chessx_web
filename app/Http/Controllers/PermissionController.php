<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePermissionRequest;
use App\Http\Requests\UpdatePermissionRequest;
use App\Models\Module;
use App\Models\Permission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PermissionController extends Controller
{
    public function index(): JsonResponse
    {
        Gate::authorize('permissions.read');

        return response()->json(['data' => Permission::query()->with('module:id,name')->orderBy('name')->get(), 'modules' => Module::query()->where('is_active', true)->orderBy('sort_order')->get(['id', 'name'])]);
    }

    public function store(StorePermissionRequest $request): JsonResponse
    {
        $permission = Permission::query()->create([...$request->validated(), 'created_by' => $request->user()->id, 'updated_by' => $request->user()->id]);

        return response()->json(['data' => $permission->load('module:id,name'), 'message' => 'Permission created successfully.'], 201);
    }

    public function show(Permission $permission): JsonResponse
    {
        Gate::authorize('permissions.read');

        return response()->json(['data' => $permission->load('module:id,name')]);
    }

    public function update(UpdatePermissionRequest $request, Permission $permission): JsonResponse
    {
        $permission->update([...$request->validated(), 'updated_by' => $request->user()->id]);

        return response()->json(['data' => $permission->load('module:id,name'), 'message' => 'Permission updated successfully.']);
    }

    public function destroy(Request $request, Permission $permission): JsonResponse
    {
        Gate::authorize('permissions.delete');
        abort_if($permission->roles()->exists(), 422, 'Remove this permission from all roles before deleting it.');
        $permission->delete();

        return response()->json(['message' => 'Permission deleted successfully.']);
    }
}
