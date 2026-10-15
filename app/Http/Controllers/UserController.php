<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function roleOptions(Request $request): JsonResponse
    {
        abort_unless($request->user()->can('users.create') || $request->user()->can('users.update'), 403);

        $roles = Role::query()
            ->when(! $request->user()->isSuperAdmin(), fn ($query) => $query->where('slug', '!=', 'super_admin'))
            ->orderByRaw("CASE slug WHEN 'admin' THEN 1 WHEN 'user' THEN 2 WHEN 'super_admin' THEN 3 ELSE 4 END")
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'description']);

        return response()->json(['data' => $roles]);
    }

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('users.read');

        return $this->userList($request);
    }

    public function legacyIndex(Request $request): JsonResponse
    {
        return $this->userList($request);
    }

    private function userList(Request $request): JsonResponse
    {
        $users = User::query()->with('role')
            ->when(! $request->user()->can('users.view_super_admin'), fn ($query) => $query->whereDoesntHave('role', fn ($query) => $query->where('slug', 'super_admin')))
            ->when($request->string('search')->trim()->value(), fn ($query, string $search) => $query->where(fn ($query) => $query->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%")))
            ->when($request->string('role')->value() && $request->string('role')->value() !== 'all', fn ($query) => $query->whereHas('role', fn ($query) => $query->where('slug', $request->string('role')->value())))
            ->when($request->string('status')->value() && $request->string('status')->value() !== 'all', fn ($query) => $query->where('status', $request->string('status')->value()))
            ->latest()->paginate($request->integer('perPage', 10));

        return response()->json(['data' => $users->getCollection()->map(fn (User $user): array => $this->data($user))->values(), 'pagination' => ['page' => $users->currentPage(), 'perPage' => $users->perPage(), 'total' => $users->total(), 'totalPages' => $users->lastPage()]]);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->safe()->except('avatar');
        if ($request->hasFile('avatar')) {
            $data['avatar_path'] = $request->file('avatar')->store('avatars', 'public');
        }
        $user = User::query()->create($data);

        return response()->json(['data' => $this->data($user->load('role')), 'message' => 'User created successfully.'], 201);
    }

    public function show(Request $request, User $user): JsonResponse
    {
        Gate::authorize('users.read');
        abort_if($user->role?->slug === 'super_admin' && ! $request->user()->can('users.view_super_admin'), 404);

        return response()->json(['data' => $this->data($user->load('role'))]);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $data = $request->validated();
        unset($data['avatar']);
        if (empty($data['password'])) {
            unset($data['password']);
        }
        if ($request->hasFile('avatar')) {
            if ($user->avatar_path) {
                Storage::disk('public')->delete($user->avatar_path);
            }
            $data['avatar_path'] = $request->file('avatar')->store('avatars', 'public');
        }
        $user->update($data);

        return response()->json(['data' => $this->data($user->load('role')), 'message' => 'User updated successfully.']);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        Gate::authorize('users.delete');
        abort_if($request->user()->is($user), 422, 'You cannot delete your own account.');
        abort_if($user->role?->slug === 'super_admin', 422, 'Super Admin accounts cannot be deleted.');
        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
        }
        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }

    /** @return array<string, mixed> */
    private function data(User $user): array
    {
        return ['id' => (string) $user->id, 'name' => $user->name, 'email' => $user->email, 'phone' => $user->phone ?? '', 'roleId' => $user->role_id, 'role' => $user->role?->name ?? 'Unassigned', 'roleSlug' => $user->role?->slug, 'status' => $user->status, 'avatar' => $user->avatar_path ? Storage::disk('public')->url($user->avatar_path) : 'https://ui-avatars.com/api/?name='.urlencode($user->name).'&background=4f46e5&color=fff', 'lastLogin' => $user->last_login_at?->diffForHumans() ?? 'Never', 'createdAt' => $user->created_at?->toDateString(), 'twoFactorEnabled' => false];
    }
}
