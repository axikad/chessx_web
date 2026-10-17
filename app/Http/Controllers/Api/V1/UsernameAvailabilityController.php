<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\CheckUsernameAvailabilityRequest;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class UsernameAvailabilityController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(CheckUsernameAvailabilityRequest $request): JsonResponse
    {
        $username = $request->validated('username');
        $available = ! User::query()
            ->where('username', $username)
            ->whereKeyNot($request->user()->getKey())
            ->exists();

        return ApiResponse::success([
            'username' => $username,
            'available' => $available,
        ], 'Username availability checked successfully.');
    }
}
