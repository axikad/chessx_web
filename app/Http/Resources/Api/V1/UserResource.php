<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->uuid,
            'username' => $this->username,
            'name' => $this->name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'avatar_url' => $this->avatar_path === null
                ? null
                : asset('storage/'.$this->avatar_path),
            'status' => $this->status,
            'username_can_be_changed' => $this->canChangeUsername(),
            'username_change_available_at' => $this->usernameChangeAvailableAt()?->toIso8601String(),
            'profile' => $this->whenLoaded('profile', fn (): array => [
                'display_name' => $this->profile?->display_name,
                'language' => $this->profile?->language ?? 'en',
                'timezone' => $this->profile?->timezone,
                'date_of_birth' => $this->profile?->date_of_birth?->toDateString(),
                'visibility' => $this->profile?->profile_visibility ?? 'public',
            ]),
            'onboarding' => $this->onboardingStatus(),
        ];
    }
}
