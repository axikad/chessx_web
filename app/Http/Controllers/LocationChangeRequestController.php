<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReviewLocationChangeRequest;
use App\Models\AuditLog;
use App\Models\LocationChangeHistory;
use App\Models\LocationChangeRequest;
use App\Models\UserLocation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class LocationChangeRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('player_locations.read');

        $requests = LocationChangeRequest::query()
            ->with(['user:id,name,email', 'oldCity.state', 'newCity.state', 'reviewer:id,name'])
            ->when($request->string('status')->value(), fn ($query, string $status) => $query->where('status', $status))
            ->latest('requested_at')
            ->paginate($request->integer('perPage', 20));

        return response()->json([
            'data' => $requests->items(),
            'pagination' => [
                'page' => $requests->currentPage(),
                'perPage' => $requests->perPage(),
                'total' => $requests->total(),
                'totalPages' => $requests->lastPage(),
            ],
        ]);
    }

    public function update(ReviewLocationChangeRequest $request, LocationChangeRequest $locationChangeRequest): JsonResponse
    {
        $reviewed = DB::transaction(function () use ($request, $locationChangeRequest): LocationChangeRequest {
            $changeRequest = LocationChangeRequest::query()->lockForUpdate()->findOrFail($locationChangeRequest->getKey());

            abort_if($changeRequest->status !== 'pending', 409, 'This location-change request has already been reviewed.');

            if ($request->validated('decision') === 'approved') {
                $current = UserLocation::query()
                    ->where('user_id', $changeRequest->user_id)
                    ->where('is_current', true)
                    ->lockForUpdate()
                    ->first();

                abort_if($current === null || $current->city_id !== $changeRequest->old_city_id, 409, 'The player current location has changed.');

                $current->update(['is_current' => false]);
                UserLocation::query()->create([
                    'user_id' => $changeRequest->user_id,
                    'city_id' => $changeRequest->new_city_id,
                    'verification_method' => $changeRequest->verification_method,
                    'verified_at' => now(),
                    'policy_version' => config('chess.location_policy_version'),
                    'is_current' => true,
                ]);
                LocationChangeHistory::query()->create([
                    'user_id' => $changeRequest->user_id,
                    'old_city_id' => $changeRequest->old_city_id,
                    'new_city_id' => $changeRequest->new_city_id,
                    'change_request_id' => $changeRequest->getKey(),
                    'changed_at' => now(),
                ]);
            }

            $changeRequest->update([
                'status' => $request->validated('decision'),
                'reviewed_at' => now(),
                'reviewed_by' => $request->user()->getKey(),
            ]);

            AuditLog::query()->create([
                'actor_user_id' => $request->user()->getKey(),
                'action' => 'location.change_'.$request->validated('decision'),
                'entity_type' => $changeRequest->getTable(),
                'entity_id' => $changeRequest->getKey(),
                'metadata' => [
                    'review_reason' => $request->validated('review_reason'),
                    'old_city_id' => $changeRequest->old_city_id,
                    'new_city_id' => $changeRequest->new_city_id,
                ],
                'ip_address' => $request->ip(),
            ]);

            return $changeRequest;
        });

        return response()->json([
            'data' => $reviewed->load(['user:id,name,email', 'oldCity', 'newCity', 'reviewer:id,name']),
            'message' => 'Location-change request reviewed successfully.',
        ]);
    }
}
