<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdatePlayerProfileRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PlayerProfileController extends Controller
{
    public function show(Request $request, User $user): JsonResponse
    {
        Gate::authorize('player_profiles.read');
        abort_if($user->isSuperAdmin() && ! $request->user()->isSuperAdmin(), 404);

        return response()->json(['data' => $this->data($user->load('profile'))]);
    }

    public function update(UpdatePlayerProfileRequest $request, User $user): JsonResponse
    {
        $profile = $user->profile()->firstOrNew();
        $profile->fill($request->validated());
        $profile->save();

        return response()->json([
            'data' => $this->data($user->setRelation('profile', $profile)),
            'message' => 'Player profile updated successfully.',
        ]);
    }

    /** @return array<string, mixed> */
    private function data(User $user): array
    {
        $profile = $user->profile;

        return [
            'userId' => (string) $user->getKey(),
            'displayName' => $profile?->display_name,
            'language' => $profile?->language ?? 'en',
            'timezone' => $profile?->timezone,
            'dateOfBirth' => $profile?->date_of_birth?->toDateString(),
            'profileVisibility' => $profile?->profile_visibility ?? 'public',
        ];
    }
}
