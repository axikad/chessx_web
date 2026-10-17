<?php

namespace App\Http\Resources\Api\V1;

use App\Models\MobileSession;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin MobileSession */
class MobileSessionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->getKey(),
            'device_name' => $this->device_name,
            'platform' => $this->platform,
            'is_current' => $request->user()?->currentAccessToken()?->getKey() === $this->access_token_id,
            'last_refreshed_at' => $this->when(
                $this->last_refreshed_at !== null,
                $this->last_refreshed_at?->toIso8601String(),
            ),
            'expires_at' => $this->refresh_token_expires_at->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
