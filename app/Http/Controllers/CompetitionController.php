<?php

namespace App\Http\Controllers;

use App\Models\CompetitionTier;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class CompetitionController extends Controller
{
    public function index(): JsonResponse
    {
        Gate::authorize('competitions.read');

        $tiers = CompetitionTier::query()
            ->with(['regions' => fn ($query) => $query
                ->with(['country:id,name', 'state:id,name', 'city:id,name'])
                ->orderBy('name')])
            ->withCount(['regions', 'playerCompetitions'])
            ->orderBy('sequence_number')
            ->get();

        return response()->json(['data' => $tiers->map(fn (CompetitionTier $tier): array => [
            'id' => $tier->getKey(),
            'code' => $tier->code->value,
            'name' => $tier->name,
            'scopeType' => $tier->scope_type,
            'sequenceNumber' => $tier->sequence_number,
            'isActive' => $tier->is_active,
            'regionCount' => $tier->regions_count,
            'playerCount' => $tier->player_competitions_count,
            'regions' => $tier->regions->map(fn ($region): array => [
                'id' => $region->getKey(),
                'name' => $region->name,
                'status' => $region->status,
                'place' => $region->city?->name ?? $region->state?->name ?? $region->country?->name ?? 'Global',
            ])->values(),
        ])->values()]);
    }
}
