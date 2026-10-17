<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MobileTokenResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'token_type' => 'Bearer',
            'access_token' => $this->resource['access_token'],
            'access_token_expires_at' => $this->resource['access_token_expires_at']->toIso8601String(),
            'expires_in' => (int) now()->diffInSeconds($this->resource['access_token_expires_at']),
            'refresh_token' => $this->resource['refresh_token'],
            'refresh_token_expires_at' => $this->resource['refresh_token_expires_at']->toIso8601String(),
            'session_id' => $this->resource['session']->getKey(),
            'is_new_user' => (bool) ($this->resource['is_new_user'] ?? false),
            'user' => (new UserResource($this->resource['user']))->resolve($request),
        ];
    }
}
