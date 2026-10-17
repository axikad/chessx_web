<?php

return [
    'starting_rating' => (int) env('CHESS_STARTING_RATING', 1200),
    'provisional_games' => (int) env('CHESS_PROVISIONAL_GAMES', 10),
    'location_resolve_radius_km' => (float) env('CHESS_LOCATION_RADIUS_KM', 75),
    'location_resolution_token_minutes' => (int) env('CHESS_LOCATION_TOKEN_MINUTES', 15),
    'location_candidate_limit' => (int) env('CHESS_LOCATION_CANDIDATE_LIMIT', 5),
    'location_change_cooldown_days' => (int) env('CHESS_LOCATION_CHANGE_COOLDOWN_DAYS', 90),
    'location_policy_version' => env('CHESS_LOCATION_POLICY_VERSION', '1.0'),
    'default_time_control_seconds' => (int) env('CHESS_DEFAULT_TIME_CONTROL_SECONDS', 600),
    'default_increment_seconds' => (int) env('CHESS_DEFAULT_INCREMENT_SECONDS', 0),
    'reconnect_grace_seconds' => (int) env('CHESS_RECONNECT_GRACE_SECONDS', 30),
    'abandonment_timeout_seconds' => (int) env('CHESS_ABANDONMENT_TIMEOUT_SECONDS', 60),
    'matchmaking_initial_rating_range' => (int) env('CHESS_MATCHMAKING_INITIAL_RATING_RANGE', 100),
    'matchmaking_rating_range_step' => (int) env('CHESS_MATCHMAKING_RATING_RANGE_STEP', 50),
    'matchmaking_rating_range_step_seconds' => (int) env('CHESS_MATCHMAKING_RATING_RANGE_STEP_SECONDS', 15),
    'matchmaking_queue_timeout_seconds' => (int) env('CHESS_MATCHMAKING_QUEUE_TIMEOUT_SECONDS', 300),
];
