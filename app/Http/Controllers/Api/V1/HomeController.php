<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        $userId = (int) $user->id;

        $tiers = DB::table('competition_tiers')
            ->where('is_active', 1)
            ->orderBy('sequence_number')
            ->get();

        $worldTier = $tiers->firstWhere('code', 'world');

        $location = DB::table('user_locations')
            ->join('cities', 'cities.id', '=', 'user_locations.city_id')
            ->join('states', 'states.id', '=', 'cities.state_id')
            ->join('countries', 'countries.id', '=', 'states.country_id')
            ->where('user_locations.user_id', $userId)
            ->where('user_locations.is_current', 1)
            ->whereNotNull('user_locations.verified_at')
            ->select([
                'cities.id as city_id',
                'cities.name as city_name',
                'states.id as state_id',
                'states.name as state_name',
                'countries.id as country_id',
                'countries.name as country_name',
                'countries.iso2 as country_code',
            ])
            ->first();

        $profile = DB::table('user_profiles')
            ->where('user_id', $userId)
            ->first();

        /*
         * The World-tier rating is the canonical shared rating.
         * All tier ratings must be synchronized by the game-completion
         * rating logic for this assumption to remain valid.
         */
        $globalRating = null;

        if ($worldTier) {
            $globalRating = DB::table('player_ratings')
                ->where('user_id', $userId)
                ->where('tier_id', $worldTier->id)
                ->first();
        }

        $globalRatingValue = (int) ($globalRating->rating ?? 1200);
        $highestRating = (int) ($globalRating->highest_rating ?? 1200);

        /*
         * Overall statistics count completed rated and computer games
         * across all tiers, once per game for the current player.
         */
        $overall = DB::table('games')
            ->where('status', 'finished')
            ->whereIn('game_mode', ['rated', 'computer'])
            ->whereIn('result', ['white_win', 'black_win', 'draw'])
            ->where(function ($query) use ($userId) {
                $query->where('white_user_id', $userId)
                    ->orWhere('black_user_id', $userId);
            })
            ->selectRaw('COUNT(*) as games_played')
            ->selectRaw(
                "SUM(CASE
                    WHEN (white_user_id = ? AND result = 'white_win')
                      OR (black_user_id = ? AND result = 'black_win')
                    THEN 1 ELSE 0 END) as wins",
                [$userId, $userId]
            )
            ->selectRaw(
                "SUM(CASE WHEN result = 'draw' THEN 1 ELSE 0 END) as draws"
            )
            ->first();

        $overallGames = (int) ($overall->games_played ?? 0);
        $overallWins = (int) ($overall->wins ?? 0);
        $overallDraws = (int) ($overall->draws ?? 0);
        $overallLosses = max(
            0,
            $overallGames - $overallWins - $overallDraws
        );

        $leagues = [];

        foreach ($tiers as $tier) {
            $code = $tier->code;

            $ratingRow = DB::table('player_ratings')
                ->where('user_id', $userId)
                ->where('tier_id', $tier->id)
                ->first();

            $gamesPlayed = (int) ($ratingRow->games_played ?? 0);

            /*
             * Until the shared-rating synchronization is verified,
             * expose the canonical rating consistently in every league.
             * Tier-specific statistics remain in player_ratings.
             */
            $rating = $globalRatingValue;

            $rank = null;

            if ($gamesPlayed > 0) {
                $rankQuery = DB::table('player_ratings')
                    ->join('users', 'users.id', '=', 'player_ratings.user_id')
                    ->where('player_ratings.tier_id', $tier->id)
                    ->where('player_ratings.games_played', '>', 0)
                    ->where('users.status', 'active')
                    ->whereNull('users.deleted_at')
                    ->where('users.is_bot', 0);

                if ($code !== 'world' && $location) {
                    $rankQuery->join(
                        'user_locations',
                        function ($join) {
                            $join->on(
                                'user_locations.user_id',
                                '=',
                                'users.id'
                            )
                                ->where('user_locations.is_current', 1)
                                ->whereNotNull('user_locations.verified_at');
                        }
                    );

                    if ($tier->scope_type === 'city') {
                        $rankQuery->where(
                            'user_locations.city_id',
                            $location->city_id
                        );
                    } elseif ($tier->scope_type === 'state') {
                        $rankQuery
                            ->join(
                                'cities as rank_cities',
                                'rank_cities.id',
                                '=',
                                'user_locations.city_id'
                            )
                            ->where(
                                'rank_cities.state_id',
                                $location->state_id
                            );
                    } elseif ($tier->scope_type === 'country') {
                        $rankQuery
                            ->join(
                                'cities as rank_cities',
                                'rank_cities.id',
                                '=',
                                'user_locations.city_id'
                            )
                            ->join(
                                'states as rank_states',
                                'rank_states.id',
                                '=',
                                'rank_cities.state_id'
                            )
                            ->where(
                                'rank_states.country_id',
                                $location->country_id
                            );
                    }
                }

                $rankedPlayers = $rankQuery
                    ->orderByDesc('player_ratings.rating')
                    ->orderBy('player_ratings.user_id')
                    ->pluck('player_ratings.user_id');

                $position = $rankedPlayers->search($userId);

                if ($position !== false) {
                    $rank = $position + 1;
                }
            }

            $leagues[] = [
                'tier_id' => (int) $tier->id,
                'code' => $code,
                'name' => $tier->name,
                'artwork_path' => $tier->artwork_path,
                'rating' => $rating,
                'rank' => $rank,
                'games_played' => $gamesPlayed,
                'wins' => (int) ($ratingRow->wins ?? 0),
                'draws' => (int) ($ratingRow->draws ?? 0),
                'losses' => (int) ($ratingRow->losses ?? 0),
                'highest_rating' => $highestRating,
                'provisional' => (bool) (
                    $ratingRow->provisional_rating ?? true
                ),
            ];
        }

        return response()->json([
            'data' => [
                'player' => [
                    'username' => $user->username,
                    'display_name' => $profile?->display_name ?: $user->name,
                    'avatar' => $user->avatar_path ?? null,
                    'location' => $location ? [
                        'city' => $location->city_name,
                        'state' => $location->state_name,
                        'country' => $location->country_name,
                        'country_code' => $location->country_code,
                    ] : null,
                ],

                'global_rating' => [
                    'rating' => $globalRatingValue,
                    'highest_rating' => $highestRating,
                ],

                'overall_statistics' => [
                    'games_played' => $overallGames,
                    'wins' => $overallWins,
                    'draws' => $overallDraws,
                    'losses' => $overallLosses,
                ],

                'leagues' => $leagues,
            ],
        ]);
    }
}