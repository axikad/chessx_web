<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ConfirmPlayerLocationRequest;
use App\Http\Requests\ResolvePlayerLocationRequest;
use App\Http\Requests\StoreLocationChangeRequest;
use App\Services\Location\LocationResolutionService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class PlayerLocationController extends Controller
{
    public function show(Request $request, LocationResolutionService $service): JsonResponse
    {
        return ApiResponse::success(
            $service->snapshot($request->user()),
            'Player location retrieved successfully.',
        );
    }

    public function resolve(ResolvePlayerLocationRequest $request, LocationResolutionService $service): JsonResponse
    {
        if ($request->validated('permission') === 'denied') {
            throw ValidationException::withMessages([
                'permission' => 'Location permission is required to resolve a city.',
            ]);
        }

        return ApiResponse::success(
            $service->resolve(
                $request->user(),
                (float) $request->validated('latitude'),
                (float) $request->validated('longitude'),
            ),
            'Nearby cities resolved successfully.',
        );
    }

    public function confirm(ConfirmPlayerLocationRequest $request, LocationResolutionService $service): JsonResponse
    {
        if (! $request->boolean('accepted')) {
            throw ValidationException::withMessages([
                'accepted' => 'Confirm the resolved city before saving it.',
            ]);
        }

        $data = $service->confirm(
            $request->user(),
            $request->validated('resolution_token'),
            (int) $request->validated('city_id'),
        );
        $request->user()->unsetRelation('currentLocation');
        $data['onboarding'] = $request->user()->onboardingStatus();

        return ApiResponse::success(
            $data,
            'Home city confirmed successfully.',
            Response::HTTP_CREATED,
        );
    }

    public function requestChange(StoreLocationChangeRequest $request, LocationResolutionService $service): JsonResponse
    {
        return ApiResponse::success(
            $service->requestChange(
                $request->user(),
                $request->validated('resolution_token'),
                (int) $request->validated('city_id'),
                $request->validated('reason'),
            ),
            'Location-change request submitted successfully.',
            Response::HTTP_CREATED,
        );
    }
}
