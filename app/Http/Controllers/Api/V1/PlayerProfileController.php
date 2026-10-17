<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\UpdatePlayerProfileRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Support\ApiResponse;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class PlayerProfileController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(UpdatePlayerProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->loadMissing(['role', 'currentLocation']);

        if ($user->role?->slug !== 'user') {
            return ApiResponse::error(
                'Only player accounts can complete a player profile.',
                'player_account_required',
                Response::HTTP_FORBIDDEN,
            );
        }

        $isCompletingOnboarding = $user->onboarding_completed_at === null;

        if ($isCompletingOnboarding && $user->currentLocation === null) {
            return ApiResponse::error(
                'Confirm your home city before completing your player profile.',
                'location_required',
                Response::HTTP_CONFLICT,
            );
        }

        $newAvatarPath = $request->hasFile('avatar')
            ? $request->file('avatar')->store('avatars', 'public')
            : null;
        $oldAvatarPath = $user->avatar_path;

        try {
            DB::transaction(function () use ($request, $user, $newAvatarPath, $isCompletingOnboarding): void {
                $user->username = $request->validated('username');

                if ($newAvatarPath !== null) {
                    $user->avatar_path = $newAvatarPath;
                }

                if ($isCompletingOnboarding || $user->isDirty('username')) {
                    $user->username_changed_at = now();
                }

                if ($isCompletingOnboarding) {
                    $user->onboarding_completed_at = now();
                }

                $user->save();

                if ($request->has('date_of_birth')) {
                    $user->profile()->updateOrCreate([], [
                        'date_of_birth' => $request->validated('date_of_birth'),
                    ]);
                }
            });
        } catch (UniqueConstraintViolationException) {
            if ($newAvatarPath !== null) {
                Storage::disk('public')->delete($newAvatarPath);
            }

            throw ValidationException::withMessages([
                'username' => 'This username is already taken.',
            ]);
        } catch (Throwable $exception) {
            if ($newAvatarPath !== null) {
                Storage::disk('public')->delete($newAvatarPath);
            }

            throw $exception;
        }

        if ($newAvatarPath !== null && $oldAvatarPath !== null && $oldAvatarPath !== $newAvatarPath) {
            Storage::disk('public')->delete($oldAvatarPath);
        }

        $user->refresh()->load(['profile', 'role', 'currentLocation']);

        return ApiResponse::success(
            (new UserResource($user))->resolve($request),
            $isCompletingOnboarding
                ? 'Player profile completed successfully.'
                : 'Player profile updated successfully.',
        );
    }
}
