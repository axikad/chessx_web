<?php

return [
    'starting_rating' => (int) env('CHESS_STARTING_RATING', 1200),
    'provisional_games' => (int) env('CHESS_PROVISIONAL_GAMES', 10),
    'location_resolve_radius_km' => (float) env('CHESS_LOCATION_RADIUS_KM', 75),
    'location_resolution_token_minutes' => (int) env('CHESS_LOCATION_TOKEN_MINUTES', 15),
    'location_candidate_limit' => (int) env('CHESS_LOCATION_CANDIDATE_LIMIT', 5),
    'location_change_cooldown_days' => (int) env('CHESS_LOCATION_CHANGE_COOLDOWN_DAYS', 90),
    'location_policy_version' => env('CHESS_LOCATION_POLICY_VERSION', '1.0'),
];
