<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StateResource extends JsonResource
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
            'country_id' => $this->country_id,
            'name' => $this->name,
            'code' => $this->code,
            'geonames_code' => $this->whenNotNull($this->geonames_code),
        ];
    }
}
