<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CityResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'geonames_id' => $this->whenNotNull($this->geonames_id),
            'state_id' => $this->state_id,
            'name' => $this->name,
            'district' => $this->whenNotNull($this->district),
            'timezone' => $this->timezone,
        ];
    }
}
