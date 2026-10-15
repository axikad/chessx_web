<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        $userData = $request->safe()->only(['name', 'username', 'email']);
        $profileData = $request->safe()->only(['display_name', 'language', 'timezone', 'date_of_birth', 'profile_visibility']);
        $profileData['language'] = $profileData['language'] ?? 'en';
        $profileData['profile_visibility'] = $profileData['profile_visibility'] ?? 'public';

        DB::transaction(function () use ($user, $userData, $profileData): void {
            $user->fill($userData);

            if ($user->isDirty('email')) {
                $user->email_verified_at = null;
            }

            if ($user->isDirty('username')) {
                $user->username_changed_at = now();
            }

            $user->save();
            $user->profile()->updateOrCreate([], $profileData);
        });

        $user->load('profile');

        if ($request->expectsJson()) {
            return response()->json([
                'data' => [
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'profile' => $user->profile,
                    'usernameCanBeChanged' => $user->canChangeUsername(),
                    'usernameChangeAvailableAt' => $user->usernameChangeAvailableAt()?->toDateString(),
                ],
                'message' => 'Profile updated successfully.',
            ]);
        }

        return to_route('settings.index');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
