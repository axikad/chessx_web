<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateCompetitionTierArtworkRequest;
use App\Models\AuditLog;
use App\Models\CompetitionTier;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Throwable;

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
            'imageUrl' => $tier->artworkUrl(),
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

    public function updateArtwork(
        UpdateCompetitionTierArtworkRequest $request,
        CompetitionTier $competitionTier,
    ): JsonResponse {
        $oldPath = $competitionTier->artwork_path;
        $newPath = $request->file('artwork')->store('leagues', 'public');

        try {
            DB::transaction(function () use ($request, $competitionTier, $newPath, $oldPath): void {
                $competitionTier->update(['artwork_path' => $newPath]);

                AuditLog::query()->create([
                    'actor_user_id' => $request->user()->getKey(),
                    'action' => 'competition.artwork_updated',
                    'entity_type' => $competitionTier->getTable(),
                    'entity_id' => $competitionTier->getKey(),
                    'metadata' => [
                        'previous_artwork_path' => $oldPath,
                        'current_artwork_path' => $newPath,
                    ],
                    'ip_address' => $request->ip(),
                ]);
            });
        } catch (Throwable $exception) {
            Storage::disk('public')->delete($newPath);

            throw $exception;
        }

        $defaultArtwork = [
            'leagues/Lcity.png',
            'leagues/Lstate.png',
            'leagues/Lnational.png',
            'leagues/Lworld.png',
        ];

        if ($oldPath !== null && ! in_array($oldPath, $defaultArtwork, true)) {
            Storage::disk('public')->delete($oldPath);
        }

        return response()->json([
            'data' => [
                'id' => $competitionTier->getKey(),
                'imageUrl' => $competitionTier->fresh()->artworkUrl(),
            ],
            'message' => 'Competition artwork updated successfully.',
        ]);
    }
}
