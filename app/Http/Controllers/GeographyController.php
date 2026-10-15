<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\Country;
use App\Models\State;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GeographyController extends Controller
{
    public function countries(): JsonResponse
    {
        $countries = Country::query()
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'iso2', 'iso3', 'name']);

        return response()->json(['data' => $countries]);
    }

    public function states(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'country_id' => ['required', 'integer', Rule::exists('countries', 'id')->where('status', 'active')],
        ]);

        $states = State::query()
            ->where('country_id', $validated['country_id'])
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'country_id', 'name', 'code']);

        return response()->json(['data' => $states]);
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
            ->when($request->string('search')->trim()->value(), fn ($query, string $search) => $query->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->get(['id', 'state_id', 'name', 'timezone']);

        return response()->json(['data' => $cities]);
    }
}
