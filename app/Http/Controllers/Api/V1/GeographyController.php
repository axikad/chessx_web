<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\CityResource;
use App\Http\Resources\Api\V1\CountryResource;
use App\Http\Resources\Api\V1\StateResource;
use App\Models\City;
use App\Models\Country;
use App\Models\State;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GeographyController extends Controller
{
    public function countries(Request $request): JsonResponse
    {
        $countries = Country::query()
            ->where('status', 'active')
            ->whereIn('iso2', config('geography.supported_countries', []))
            ->orderBy('name')
            ->get();

        return ApiResponse::success(
            CountryResource::collection($countries)->resolve($request),
            'Countries retrieved successfully.',
            meta: $this->sourceMeta(),
        );
    }

    public function states(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'country_id' => [
                'required',
                'integer',
                Rule::exists('countries', 'id')
                    ->where('status', 'active')
                    ->whereIn('iso2', config('geography.supported_countries', [])),
            ],
        ]);

        $states = State::query()
            ->where('country_id', $validated['country_id'])
            ->where('status', 'active')
            ->orderBy('name')
            ->get();

        return ApiResponse::success(
            StateResource::collection($states)->resolve($request),
            'States retrieved successfully.',
            meta: $this->sourceMeta(),
        );
    }

    public function cities(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'state_id' => ['required', 'integer', Rule::exists('states', 'id')->where('status', 'active')],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $cities = City::query()
            ->where('state_id', $validated['state_id'])
            ->where('status', 'active')
            ->when(
                $request->string('search')->trim()->value(),
                fn ($query, string $search) => $query->where('name', 'like', "%{$search}%"),
            )
            ->orderBy('name')
            ->get();

        return ApiResponse::success(
            CityResource::collection($cities)->resolve($request),
            'Cities retrieved successfully.',
            meta: $this->sourceMeta(),
        );
    }

    /** @return array{source: array<string, string>} */
    private function sourceMeta(): array
    {
        /** @var array<string, string> $attribution */
        $attribution = config('geography.geonames.attribution');

        return ['source' => $attribution];
    }
}
