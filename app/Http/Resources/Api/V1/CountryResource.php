<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CountryResource extends JsonResource
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
            'iso2' => $this->iso2,
            'iso3' => $this->iso3,
            'name' => $this->name,
        ];
    }
}
