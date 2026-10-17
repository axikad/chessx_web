<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CompetitionTier;
use App\Services\Competition\PlayerLeagueService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlayerLeagueController extends Controller
{
    public function index(Request $request, PlayerLeagueService $leagues): JsonResponse
    {
        return ApiResponse::success(
            $leagues->index($request->user()),
            'Player leagues retrieved successfully.',
        );
    }

    public function show(
        Request $request,
        CompetitionTier $competitionTier,
        PlayerLeagueService $leagues,
    ): JsonResponse {
        abort_unless($competitionTier->is_active, 404);

        return ApiResponse::success(
            $leagues->show($request->user(), $competitionTier),
            'Player league retrieved successfully.',
        );
    }
}
