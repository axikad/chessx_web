<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConfirmPlayerLocationRequest;
use App\Http\Requests\ResolvePlayerLocationRequest;
use App\Http\Requests\StoreLocationChangeRequest;
use App\Services\Location\LocationResolutionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PlayerLocationController extends Controller
{
    public function show(Request $request, LocationResolutionService $service): JsonResponse
    {
        return response()->json(['data' => $service->snapshot($request->user())]);
    }

    public function resolve(ResolvePlayerLocationRequest $request, LocationResolutionService $service): JsonResponse
    {
        if ($request->validated('permission') === 'denied') {
            throw ValidationException::withMessages(['permission' => 'Location permission is required to resolve a city.']);
        }

        return response()->json([
            'data' => $service->resolve(
                $request->user(),
                (float) $request->validated('latitude'),
                (float) $request->validated('longitude'),
            ),
            'message' => 'Nearby cities resolved successfully.',
        ]);
    }

    public function confirm(ConfirmPlayerLocationRequest $request, LocationResolutionService $service): JsonResponse
    {
        if (! $request->boolean('accepted')) {
            throw ValidationException::withMessages(['accepted' => 'Confirm the resolved city before saving it.']);
        }

        return response()->json([
            'data' => $service->confirm(
                $request->user(),
                $request->validated('resolution_token'),
                (int) $request->validated('city_id'),
            ),
            'message' => 'Home city confirmed successfully.',
        ], 201);
    }

    public function requestChange(StoreLocationChangeRequest $request, LocationResolutionService $service): JsonResponse
    {
        return response()->json([
            'data' => $service->requestChange(
                $request->user(),
                $request->validated('resolution_token'),
                (int) $request->validated('city_id'),
                $request->validated('reason'),
            ),
            'message' => 'Location-change request submitted successfully.',
        ], 201);
    }
}
