<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCompetitionRegionRequest;
use App\Http\Requests\UpdateCompetitionRegionRequest;
use App\Models\AuditLog;
use App\Models\CompetitionRegion;
use App\Models\CompetitionTier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class CompetitionRegionController extends Controller
{
    public function index(): JsonResponse
    {
        Gate::authorize('competitions.read');

        $regions = CompetitionRegion::query()
            ->join('competition_tiers', 'competition_tiers.id', '=', 'competition_regions.tier_id')
            ->select('competition_regions.*')
            ->with([
                'tier:id,code,name,sequence_number,is_active',
                'country:id,name',
                'state:id,country_id,name',
                'state.country:id,name',
                'city:id,state_id,name',
                'city.state:id,country_id,name',
                'city.state.country:id,name',
            ])
            ->withCount('leaderboardSnapshots')
            ->orderBy('competition_tiers.sequence_number')
            ->orderBy('competition_regions.name')
            ->get();

        $tiers = CompetitionTier::query()
            ->orderBy('sequence_number')
            ->get(['id', 'code', 'name', 'scope_type', 'is_active']);

        return response()->json([
            'data' => $regions->map(fn (CompetitionRegion $region): array => $this->regionData($region))->values(),
            'tiers' => $tiers->map(fn (CompetitionTier $tier): array => [
                'id' => $tier->getKey(),
                'code' => $tier->code->value,
                'name' => $tier->name,
                'scopeType' => $tier->scope_type,
                'isActive' => $tier->is_active,
            ])->values(),
        ]);
    }

    public function store(StoreCompetitionRegionRequest $request): JsonResponse
    {
        $region = DB::transaction(function () use ($request): CompetitionRegion {
            $region = CompetitionRegion::query()->create($request->validated());
            $this->audit($request, $region, 'competition.region_created', [
                'current' => $region->getAttributes(),
            ]);

            return $region;
        });

        return response()->json([
            'data' => $this->regionData($this->loadRegion($region)),
            'message' => 'Competition region created successfully.',
        ], 201);
    }

    public function update(UpdateCompetitionRegionRequest $request, CompetitionRegion $competitionRegion): JsonResponse
    {
        DB::transaction(function () use ($request, $competitionRegion): void {
            $previous = $competitionRegion->getAttributes();
            $competitionRegion->update($request->validated());
            $this->audit($request, $competitionRegion, 'competition.region_updated', [
                'previous' => $previous,
                'current' => $competitionRegion->getAttributes(),
            ]);
        });

        return response()->json([
            'data' => $this->regionData($this->loadRegion($competitionRegion)),
            'message' => 'Competition region updated successfully.',
        ]);
    }

    public function destroy(Request $request, CompetitionRegion $competitionRegion): JsonResponse
    {
        Gate::authorize('competitions.delete');
        abort_if(
            $competitionRegion->leaderboardSnapshots()->exists(),
            422,
            'Deactivate this region instead because it is referenced by leaderboard history.',
        );

        DB::transaction(function () use ($request, $competitionRegion): void {
            $deleted = $competitionRegion->getAttributes();
            $this->audit($request, $competitionRegion, 'competition.region_deleted', ['deleted' => $deleted]);
            $competitionRegion->delete();
        });

        return response()->json(['message' => 'Competition region deleted successfully.']);
    }

    private function loadRegion(CompetitionRegion $region): CompetitionRegion
    {
        return $region->load([
            'tier:id,code,name,sequence_number,is_active',
            'country:id,name',
            'state:id,country_id,name',
            'state.country:id,name',
            'city:id,state_id,name',
            'city.state:id,country_id,name',
            'city.state.country:id,name',
        ])->loadCount('leaderboardSnapshots');
    }

    /** @return array<string, mixed> */
    private function regionData(CompetitionRegion $region): array
    {
        $state = $region->state ?? $region->city?->state;
        $country = $region->country ?? $state?->country;

        return [
            'id' => $region->getKey(),
            'tierId' => $region->tier_id,
            'tierCode' => $region->tier->code->value,
            'tierName' => $region->tier->name,
            'name' => $region->name,
            'status' => $region->status,
            'scopeKey' => $region->scope_key,
            'place' => $region->city?->name ?? $region->state?->name ?? $region->country?->name ?? 'Global',
            'countryId' => $country?->getKey(),
            'stateId' => $state?->getKey(),
            'cityId' => $region->city_id,
            'leaderboardSnapshotCount' => $region->leaderboard_snapshots_count,
        ];
    }

    /** @param array<string, mixed> $metadata */
    private function audit(Request $request, CompetitionRegion $region, string $action, array $metadata): void
    {
        AuditLog::query()->create([
            'actor_user_id' => $request->user()->getKey(),
            'action' => $action,
            'entity_type' => $region->getTable(),
            'entity_id' => $region->getKey(),
            'metadata' => $metadata,
            'ip_address' => $request->ip(),
        ]);
    }
}
