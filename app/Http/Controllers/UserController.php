<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::query()
            ->when($request->string('search')->trim()->value(), function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($request->integer('perPage', 10));

        return response()->json([
            'data' => $users->getCollection()->map(fn (User $user): array => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => '',
                'avatar' => 'https://ui-avatars.com/api/?name='.urlencode($user->name).'&background=4f46e5&color=fff',
                'role' => 'Administrator',
                'status' => 'active',
                'lastLogin' => 'Never',
                'createdAt' => $user->created_at?->toDateString(),
                'department' => 'Administration',
                'twoFactorEnabled' => false,
            ])->values(),
            'pagination' => [
                'page' => $users->currentPage(),
                'perPage' => $users->perPage(),
                'total' => $users->total(),
                'totalPages' => $users->lastPage(),
            ],
        ]);
    }
}
