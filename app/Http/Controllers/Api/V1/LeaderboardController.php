<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PlayerRating;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class LeaderboardController extends Controller
{
    /**
     * GET /api/v1/leaderboard
     *
     * Query parameters:
     * tier_id: required
     * scope: city | state | country | world
     * region_id: required for city/state/country; not required for world
     * limit: optional, defaults to 100, maximum 100
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tier_id' => ['required', 'integer', 'min:1', 'exists:competition_tiers,id'],
            'scope' => ['required', Rule::in(['city', 'state', 'country', 'world'])],
            'region_id' => ['nullable', 'integer', 'min:1', 'exists:competition_regions,id'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $tierId = (int) $validated['tier_id'];
        $scope = $validated['scope'];
        $limit = (int) ($validated['limit'] ?? 100);
        $currentUserId = (int) $request->user()->id;

        if ($scope !== 'world' && empty($validated['region_id'])) {
            return response()->json([
                'message' => 'region_id is required for city, state, and country leaderboards.',
                'errors' => [
                    'region_id' => ['Select a region for this leaderboard.'],
                ],
            ], 422);
        }

        $regionId = $validated['region_id'] ?? null;

        $region = null;

        if ($scope !== 'world') {
            $region = DB::table('competition_regions')
                ->where('id', $regionId)
                ->where('tier_id', $tierId)
                ->where('status', 'active')
                ->first();

            if (!$region) {
                return response()->json([
                    'message' => 'The selected region is not active or does not belong to the selected tier.',
                ], 422);
            }

            $expectedScope = match ($scope) {
                'city' => 'city',
                'state' => 'state',
                'country' => 'country',
            };

            $tier = DB::table('competition_tiers')
                ->where('id', $tierId)
                ->first();

            if (!$tier || $tier->scope_type !== $expectedScope) {
                return response()->json([
                    'message' => 'The selected tier does not match the requested leaderboard scope.',
                ], 422);
            }
        } else {
            $tier = DB::table('competition_tiers')
                ->where('id', $tierId)
                ->where('is_active', 1)
                ->first();

            if (!$tier || $tier->scope_type !== 'global') {
                return response()->json([
                    'message' => 'The selected tier is not the active World tier.',
                ], 422);
            }
        }

        /*
         * World leaderboard:
         * Includes players with a rating in the selected World tier.
         *
         * Regional leaderboard:
         * Includes players whose current, verified location belongs
         * to the selected city, state, or country.
         *
         * Ratings are read directly from player_ratings.
         * No rating calculations or updates occur here.
         */
        $query = PlayerRating::query()
            ->join('users', 'users.id', '=', 'player_ratings.user_id')
            ->leftJoin('user_profiles', 'user_profiles.user_id', '=', 'users.id')
            ->where('player_ratings.tier_id', $tierId)
            ->where('player_ratings.games_played', '>', 0)
            ->where('users.status', 'active')
            ->whereNull('users.deleted_at')
            ->where('users.is_bot', 0)
            ->select([
                'player_ratings.user_id',
                'player_ratings.tier_id',
                'player_ratings.rating',
                'player_ratings.provisional_rating',
                'player_ratings.games_played',
                'player_ratings.wins',
                'player_ratings.draws',
                'player_ratings.losses',
                'player_ratings.highest_rating',
                'player_ratings.last_game_at',
                'users.username',
                'users.name',
                'users.avatar_path',
                'user_profiles.display_name',
            ]);

        if ($scope !== 'world') {
            $query->join('user_locations', function ($join) {
                $join->on('user_locations.user_id', '=', 'users.id')
                    ->where('user_locations.is_current', 1)
                    ->whereNotNull('user_locations.verified_at');
            });

            switch ($scope) {
                case 'city':
                    $query->where('user_locations.city_id', $region->city_id);
                    break;

                case 'state':
                    $query->join('cities as leaderboard_cities', 'leaderboard_cities.id', '=', 'user_locations.city_id')
                        ->where('leaderboard_cities.state_id', $region->state_id);
                    break;

                case 'country':
                    $query->join('cities as leaderboard_cities', 'leaderboard_cities.id', '=', 'user_locations.city_id')
                        ->join('states as leaderboard_states', 'leaderboard_states.id', '=', 'leaderboard_cities.state_id')
                        ->where('leaderboard_states.country_id', $region->country_id);
                    break;
            }
        }

        $query->orderByDesc('player_ratings.rating')
            ->orderBy('player_ratings.user_id');

        /*
         * Fetch the top N players plus the current user's row.
         * The current user's rank is calculated against all eligible
         * players, not just the top N.
         */
        $topRows = (clone $query)
            ->limit($limit)
            ->get();

        $rankedRows = (clone $query)
            ->select('player_ratings.user_id', 'player_ratings.rating')
            ->get();

        $ranks = [];
        $rank = 0;

        foreach ($rankedRows as $row) {
            $rank++;
            $ranks[(int) $row->user_id] = $rank;
        }

        $topUserIds = $topRows->pluck('user_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $currentUserRow = null;

        if (!in_array($currentUserId, $topUserIds, true)) {
            $currentUserRow = (clone $query)
                ->where('player_ratings.user_id', $currentUserId)
                ->first();
        } else {
            $currentUserRow = $topRows->first(
                fn ($row) => (int) $row->user_id === $currentUserId
            );
        }

        $formatPlayer = function ($row) use ($ranks, $currentUserId): array {
            return [
                'rank' => $ranks[(int) $row->user_id] ?? null,
                'user_id' => (int) $row->user_id,
                'username' => $row->username,
                'display_name' => $row->display_name ?: $row->name,
                'avatar' => $row->avatar_path,
                'rating' => (int) $row->rating,
                'provisional' => (bool) $row->provisional_rating,
                'games_played' => (int) $row->games_played,
                'wins' => (int) $row->wins,
                'draws' => (int) $row->draws,
                'losses' => (int) $row->losses,
                'highest_rating' => (int) $row->highest_rating,
                'last_game_at' => $row->last_game_at,
                'is_me' => (int) $row->user_id === $currentUserId,
            ];
        };

        $players = $topRows
            ->map($formatPlayer)
            ->values();

        $myRank = $currentUserRow
            ? $formatPlayer($currentUserRow)
            : null;

        return response()->json([
            'data' => [
                'scope' => $scope,
                'tier_id' => $tierId,
                'region_id' => $regionId ? (int) $regionId : null,
                'limit' => $limit,
                'total_players' => count($ranks),
                'players' => $players,
                'me' => $myRank,
            ],
        ]);
    }
}