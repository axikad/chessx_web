# ChessX Implementation Roadmap

This roadmap guides the gradual integration of the useful Chess Mission features into `chessx_web` without replacing the existing Laravel, Inertia React, authentication, branding, or RBAC foundation.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Completed and verified
- `[>]` Intentionally deferred; not required for the current release focus
- `[!]` Blocked or requires a product decision

## Current Progress

Last updated: October 17, 2026

- Overall roadmap: **146 of 227 tracked items completed**, **78 not started**, **2 intentionally deferred**, and **1 in progress**.
- Phase 0 - Integration Baseline: **8 of 8 items completed**. The first release now targets web administration plus mobile player APIs.
- Phase 1 - Player Identity Foundation: **29 of 29 items completed** and pushed in commit `d9db8bb`.
- Phase 2 - Geography and Player Location: **14 backend items and 11 administrative UI/acceptance items completed**, with **9 player-facing UI/acceptance items remaining**.
- Current Phase 2 checkpoint: the backend workflow is complete, including GeoNames-backed India, United States, and United Kingdom geography options, source-ID mapping, city coordinates, CC BY 4.0 attribution, player location snapshots, database uniqueness protections, GPS resolution, encrypted expiring confirmation tokens, first-location confirmation, cooldown enforcement, administrative review, permissions, history, and audit records.
- Phase 3 - Competition Foundation: **15 of 15 items completed**.
- Current Phase 3 checkpoint: competition tiers, tier artwork, permission-aware region CRUD, seasons, eligibility, configurable ratings, provisional rules, leaderboard snapshots, rollover behavior, permissions, and ChessX Apex administration are complete.
- Competition-tier artwork is stored per tier, editable through the permission-aware ChessX Apex administration UI, and served through the existing mobile league `image_url` contract with bundled fallbacks.
- Phase 4 - Player Registration and Onboarding: **8 of 8 items completed**.
- Current Phase 4 checkpoint: public registration atomically creates the Player/User foundation and redirects into the ChessX Apex username and GPS-based home-city confirmation flow; City League eligibility unlocks after confirmation, while administrative accounts remain excluded.
- Phase 5 - Google Login: **8 of 8 required items completed**, with **1 optional web UI item deferred**.
- Current Phase 5 checkpoint: verified Google identities resolve or link existing active accounts and create new Player accounts atomically when needed; new players receive verified email status, profile, ratings, competition eligibility, a provider link, and the standard onboarding redirect. Display-name/avatar import, inactive-account protection, request validation, safe errors, duplicate protection, and web endpoint throttling are covered.
- Current verification: **331 tests passing with 1,556 assertions**; focused ESLint, the latest production frontend build, Composer validation, all local migrations, Postman collection validation, and Laravel Pint also pass.
- Phase 6 - Apple Login: **in progress** with **7 of 9 items completed**, **1 deferred**, and **1 awaiting real Apple client identifiers for live testing**.
- Current Phase 6 checkpoint: the mobile API and web login UI issue short-lived single-use nonce challenges, verify Apple signatures plus issuer, audience, expiry, nonce, and browser state, link accounts by Apple subject, accept verified private-relay emails, capture the optional first-authorization name, create and onboard new Players, and return the appropriate mobile token or browser session. The implementation includes throttling, safe errors, Postman examples, and automated coverage.
- Phase 7 - Mobile/API Authentication: **13 of 13 items completed**.
- Current Phase 7 checkpoint: mobile password, verified Google, verified Apple, and email OTP login issue the same 15-minute Sanctum access token and one-time 30-day refresh token. Email OTP supports automatic Player registration with hashed four-digit codes, ten-minute expiry, single use, resend cooldown, limited attempts, generic request responses, and endpoint throttling. Google and Apple mobile login reuse the provider-linking and player-onboarding workflow. Refresh tokens are stored only as SHA-256 hashes, rotate atomically with access tokens, and are tied to a tracked Android or iOS device session. All `/api/v1` responses now use the stable success/error envelope. Authentication, refresh, and `/me` return persistent onboarding state; mobile players can resolve and confirm GPS location, check username availability, complete their profile with an optional avatar and date of birth, and resume the correct onboarding step after interruption. Players can list active mobile devices, identify the current device, revoke an individual owned session, or log out every mobile device without changing browser sessions. Inactive accounts cannot log in or refresh tokens.
- Current Phase 8 backend checkpoint: general chess settings are stored separately from branding, seeded with typed safe defaults for ratings, location, clocks, and matchmaking, cached for efficient reads, and record the responsible user on updates. The optional administration page and its permissions remain pending.
- Current database-foundation checkpoint: all 18 previously missing specification tables now have reversible migrations, Eloquent models, relationships, casts, PHP-backed enums where appropriate, useful factories, explicit foreign-key behavior, query indexes, uniqueness protections, and focused schema tests. The tables are intentionally dormant until their owning phase implements validation and business workflows.
- Current Apple verification: **24 focused tests passing with 99 assertions**. The complete suite passes with **331 tests and 1,556 assertions**; Laravel Pint, Composer validation, route/config inspection, and Postman collection validation also pass.
- Current Phase 13 checkpoint: authorized administrators can configure the three staged promotion rules and review qualified promotion records in the ChessX Apex UI. Approvals unlock the target league without downgrading active eligibility or overriding suspensions; decisions and configuration changes are retained in the audit log. Automatic eligibility evaluation remains pending until game results and tournament qualification are available.
- Next task: keep Apple Login pending real Apple configuration and begin Phase 9 game-foundation design. Automatic Promotion eligibility remains deferred until authoritative game results and tournament qualification exist.
- Location UI remains planned but intentionally deferred until the backend workflow and permissions are stable.
- Mobile/API authentication remains the primary release focus; Apple backend work is complete apart from external client configuration and a real-device acceptance test.

## Mobile/API Priority Decision

The first release will keep the existing web application for administration and prioritize mobile player clients backed by versioned APIs.

Completed prerequisites for starting Phase 7:

- Automatic Player/User creation and onboarding for new verified Google accounts is complete.
- Google authentication rate limiting, validation, safe error responses, and tests are complete. This security work must not be skipped for a public mobile API.
- Apple ID-token verification, single-use nonce challenges, private-relay handling, mobile tokens, onboarding, throttling, and tests are complete.

Safely deferred for now:

- Connected-login-provider management in the web account UI.
- Remaining ChessX Apex location and location-administration UI; the verified backend workflow remains available for reuse by the mobile API.
- Apple authorization-code exchange, Apple refresh-token revocation, and connected-provider management until those lifecycle features are required.
- Unrelated web administration screens that are not required by the first mobile player flow.

The mobile API must still include token verification, active-account enforcement, request validation, throttling, token rotation/revocation, consistent errors, and automated tests.

## Existing Foundation

- [x] Laravel 12 and Inertia React application
- [x] Web authentication and account settings
- [x] User management
- [x] Role management
- [x] Database-driven permissions
- [x] Super Admin protection
- [x] Site branding
- [x] User profile images
- [x] Permission-aware navigation and actions

## Implementation Principles

1. Keep the existing `chessx_web` architecture and UI.
2. Adapt useful business logic from Chess Mission instead of copying entire files.
3. Extend the existing `users`, roles, permissions, and settings safely.
4. Introduce one independently testable feature at a time.
5. Add permissions and admin UI whenever a feature requires administration.
6. Add factories, seeders, and feature tests with each database module.
7. Keep web-session authentication for the admin/web application.
8. Add Sanctum API authentication only when mobile or external clients need it.
9. Never import session tokens, passwords, or sample production data from the SQL dump.
10. Commit each completed phase separately before starting the next phase.

## Database Schema Integration Decision

The October 2026 review compared the original 37-table Chess Battle specification, the later Chess Mission migrations, and the current ChessX schema.

- ChessX already implements or safely replaces 19 specification tables covering identity, authentication sessions, geography, player locations, competition tiers and regions, seasons, eligibility, ratings, leaderboard snapshots, promotions, and audit logs.
- Keep every existing ChessX table and migration. Do not recreate, rename, or replace these tables from the old specification.
- The team selected a database-first approach: all remaining specification tables and models are created up front, while controllers, APIs, services, jobs, and interfaces remain owned by their original implementation phases.
- Phase 8 additionally introduces `system_settings`, which exists in Chess Mission but was omitted from the original specification.
- Phase 9 owns `games`, `game_states`, `game_moves`, `game_events`, and reusable `idempotency_keys`.
- Phase 10 owns `matchmaking_queue` and the selected reliable realtime event-delivery mechanism. Use a transactional outbox if the chosen transport cannot atomically publish committed game events.
- Phase 11 owns writing immutable `rating_histories` after authoritative rated-game completion exists.
- Phase 12 owns `tournaments`, `tournament_entries`, `tournament_rounds`, `tournament_pairings`, and `tournament_qualifiers`.
- Phase 14 owns `game_disputes`, `user_reports`, and `anti_cheat_flags`.
- Phase 15 owns `device_tokens` and `notifications`.
- The optional advertising phase owns activation of `ad_events`; its dormant storage foundation exists, but rewarded advertising still requires product approval.
- Continue using ChessX conventions: string columns backed by PHP enums where appropriate, explicit foreign-key deletion behavior, generated uniqueness keys for nullable scopes, transactions, audit records, factories, seeders, and feature tests.
- Historical game, rating, tournament, report, and anti-cheat records restrict destructive user deletion; ephemeral queues, device tokens, notifications, and idempotency records use deliberate cascade behavior, while optional ad events retain only a nullable user reference.

## Phase 0: Integration Baseline

Goal: establish a safe starting point before importing chess-domain features.

- [x] Confirm the current `chessx_web` branch is clean and pushed.
- [x] Run the complete existing test suite.
- [x] Run the production frontend build.
- [x] Record the current database schema.
- [x] Confirm the first release targets web administration and mobile player APIs.
- [x] Define India, the United States, and the United Kingdom as the initial supported geography.
- [x] Define whether public registration creates a Player account automatically.

Acceptance criteria:

- [x] Existing authentication, users, roles, permissions, and branding still pass all tests.
- The first release scope is documented before mobile API work begins.

## Phase 1: Player Identity Foundation

Goal: extend existing users without replacing the current user and RBAC implementation.

- [x] Add a unique UUID to users.
- [x] Add a unique username.
- [x] Add `phone_verified_at`.
- [x] Add soft deletion with permission-protected administrative account recovery.
- [x] Preserve the existing `name`, `email`, `phone`, `avatar_path`, `role_id`, `status`, and `last_login_at` fields.
- [x] Create a `user_profiles` table for player-specific profile data.
- [x] Add profile fields such as display name, language, timezone, date of birth, and visibility.
- [x] Backfill UUIDs and usernames safely for existing users.
- [x] Automatically generate UUIDs and unique usernames for new users.
- [x] Track username changes and enforce a 30-day cooldown.
- [x] Add username editing and cooldown guidance to Profile Settings.
- [x] Connect display name, language, timezone, date of birth, and profile visibility to the Apex Settings UI.
- [x] Preserve player profiles and avatar files when accounts are archived.
- [x] Add the `users.restore` permission and backend authorization.
- [x] Add Active/Archived account filtering to User Management.
- [x] Add permission-aware account restoration with a confirmation popup.
- [x] Hide edit and archive actions for already archived accounts.
- [x] Protect archived Super Admin records from unauthorized access.
- [x] Add Player Profile permissions for administrators reading or updating another player's profile.
- [x] Add migration, model, factory, seeder, validation, and feature tests for the Phase 1 account foundation.

Verification completed:

- [x] Identity, username cooldown, archive, restore, permission, and relationship feature tests.
- [x] Complete regression suite passes with 79 tests and 284 assertions.
- [x] Laravel Pint passes.
- [x] Focused frontend lint passes.
- [x] Production frontend build passes.
- [x] Local database migrations and seeders run successfully.

Product decisions:

- [x] Allow usernames to be changed no more than once every 30 days.
- [x] Require players to be at least 13 and keep date of birth private.
- [x] Allow authorized administrators to archive and restore player accounts; permanent deletion remains separate.

## Phase 2: Geography and Player Location

Goal: establish the geographic foundation required for City and State competitions.

- [x] Create countries, states, and cities tables with models, relationships, factories, and tests.
- [x] Seed the approved India starter geography dataset (36 states/union territories and 41 city centers).
- [x] Import GeoNames countries, regions, cities, stable source IDs, and city coordinates for India, the United States, and the United Kingdom while retaining CC BY 4.0 attribution.
- [x] Create player location records.
- [x] Create location-change requests and location history.
- [x] Add database-level one-current-location protection per player.
- [x] Add database-level one-pending-change-request protection per player.
- [x] Adapt GPS city resolution from Chess Mission.
- [x] Use an encrypted, tamper-resistant, expiring location confirmation token tied to the player.
- [x] Do not permanently store raw GPS coordinates.
- [x] Add configurable location radius and enforce the location-change cooldown.
- [x] Add Geography and Location permissions.
- [x] Add feature tests for confirmation, cooldown, authorization, and audit history.
- [x] Expose authenticated geography options for the three supported countries and player location snapshot data for the deferred UI.

Player-facing ChessX Apex UI:

Delivery decision: complete and verify the backend location workflow first; retain these UI tasks for implementation after the rules and permissions are stable.

- [ ] Add a Location section to the existing Apex Settings page.
- [ ] Show the player's current city, state, verification method, and verification date.
- [ ] Add country, state, and city selection controls, limited to the supported three-country dataset.
- [ ] Support browser GPS permission, loading, denied, unavailable, and unresolved states.
- [ ] Show resolved city candidates and require explicit confirmation before saving.
- [ ] Show pending location-change requests and cooldown availability.
- [ ] Provide a location-change flow without exposing or permanently storing raw GPS coordinates.
- [ ] Add responsive empty, success, validation, and failure states using the existing ChessX Apex components.

Administrative ChessX Apex UI:

- [x] Add Geography and Player Locations navigation only for authorized roles.
- [x] Add country, state, and city listing/filtering appropriate to the initial three-country dataset.
- [x] Allow authorized administrators to create and update countries, states, and cities without changing imported GeoNames source IDs.
- [x] Allow authorized administrators to activate or deactivate geography records.
- [x] Allow safe deletion of unused geography records while blocking records referenced by child locations, players, regions, or location history.
- [x] Create an admin location-review page for pending change requests.
- [x] Allow authorized administrators to approve or reject requests with an audit reason.
- [x] Hide every location action that the logged-in administrator is not permitted to perform.

Phase 2 acceptance criteria:

- [ ] Players can confirm and later request a change to their home city through the ChessX Apex UI.
- [x] Administrators can review location requests through the ChessX Apex UI.
- [x] Direct backend requests enforce the same permissions as the visible UI actions.
- [x] No Laravel Starter Kit page or component is used for geography or player-location features.

## Phase 3: Competition Foundation

Goal: introduce the City, State, National, and World competition hierarchy.

- [x] Create competition tiers.
- [x] Seed City, State, National, and World tiers.
- [x] Create competition regions linked to geography.
- [x] Create seasons.
- [x] Create player competition eligibility records.
- [x] Create player ratings per competition tier.
- [x] Create leaderboard snapshot storage.
- [x] Make starting rating configurable.
- [x] Unlock City League only after location confirmation.
- [x] Add Competition, Season, Rating, and Leaderboard permissions.
- [x] Add Apex admin management and feature tests for tier artwork, scoped competition regions, seasons, ratings, and leaderboard snapshots.

Product decisions:

- [x] Confirm the starting Elo rating at 1200 for every competition tier.
- [x] Define provisional-rating rules: a tier rating remains provisional through the first 9 rated games and becomes established after game 10.
- [x] Define season rollover behavior: complete the current season, activate one scheduled season, and idempotently carry standing eligibility into it.
- [x] Continue ratings and performance statistics unchanged between seasons; seasonal leaderboard snapshots preserve season-specific history.

## Phase 4: Player Registration and Onboarding

Goal: connect account creation to the chess competition system.

- [x] Assign the Player/User role during public registration.
- [x] Create the player profile automatically.
- [x] Create rating rows for all active competition tiers.
- [x] Create locked competition eligibility rows.
- [x] Guide the player through username and home-city confirmation.
- [x] Prevent administrative roles from receiving player competition records automatically.
- [x] Make onboarding idempotent so records cannot be duplicated.
- [x] Add registration and onboarding tests.

## Phase 5: Google Login

Goal: support secure Google authentication while preserving existing accounts.

- [x] Create the external authentication providers table.
- [x] Adapt Google ID-token verification from Chess Mission.
- [x] Add a Google login endpoint or web flow appropriate for the chosen clients.
- [x] Link Google to an existing user only when Google verifies the matching email.
- [x] Prevent duplicate provider identities.
- [x] Import safe display-name and avatar information.
- [x] Run the standard player-onboarding flow for new Google accounts.
- [x] Add rate limiting, validation, safe error responses, and tests. Required before Phase 7; do not skip.
- [>] Add account UI for connected login providers. Deferred until after the core mobile API is stable.

Security requirements:

- Never trust a Google user ID or email sent without a verified Google token.
- Never automatically link an unverified Google email to an existing account.

## Phase 6: Apple Login

Goal: add Apple authentication as a new implementation; Chess Mission only prepared its database value.

Delivery decision: implement native mobile ID-token authentication and Apple JS browser-session authentication now. Apple authorization-code exchange and provider-management UI remain separate future lifecycle work.

- [~] Configure `APPLE_CLIENT_IDS` with the real iOS bundle/client identifier and complete a real-device test. Backend coding is complete, but live verification remains in progress. Apple signing credentials are not required for native ID-token verification, but will be required for future authorization-code exchange or token revocation.
- [x] Verify Apple token signature, issuer, audience, expiry, and a server-issued single-use nonce.
- [x] Store and resolve the stable Apple provider subject.
- [x] Accept Apple-verified private-relay email addresses for new accounts.
- [x] Capture the optional name supplied only during the first Apple authorization.
- [x] Run standard Player onboarding and issue standard mobile tokens.
- [x] Add request validation, throttling, safe errors, Postman examples, and tests.
- [x] Add Sign in with Apple JS to the existing ChessX web login UI with nonce, state, browser-session login, and onboarding support.
- [>] Add connected-provider management, authorization-code exchange, and Apple token revocation when required.

## Phase 7: Mobile/API Authentication

Goal: support Android, iOS, or external clients without replacing browser-session authentication.

- [x] Confirm that a mobile application is in scope before beginning this phase.
- [x] Install and configure Sanctum with explicit approval while preserving web-session authentication.
- [x] Add versioned API routes.
- [x] Issue short-lived access tokens.
- [x] Add hashed refresh tokens and rotation.
- [x] Track platform and device sessions.
- [x] Add email OTP login with automatic Player registration.
- [x] Return persistent onboarding state from authentication, refresh, and current-user responses.
- [x] Expose authenticated mobile GPS location resolution, confirmation, snapshot, and change-request APIs.
- [x] Add username availability and player-profile completion APIs with uniqueness and cooldown enforcement.
- [x] Allow individual session revocation.
- [x] Add logout-all-devices support.
- [x] Add throttling, consistent API responses, resources, and tests.

## Phase 8: System Settings

Goal: allow authorized administrators to configure chess business rules.

- [x] Create general system settings separate from branding settings.
- [x] Support typed values and safe defaults.
- [x] Add settings for starting rating, location, clocks, and matchmaking.
- [x] Record who changed each setting.
- [ ] Add an admin settings page.
- [ ] Add System Settings permissions and tests.

## Phase 9: Chess Game Foundation

Goal: persist reliable game state before implementing live play.

- [x] Create `games`, `game_states`, `game_moves`, `game_events`, and reusable `idempotency_keys` with explicit foreign keys and indexes.
- [ ] Support rated, casual, and tournament games.
- [ ] Store UCI and SAN moves.
- [ ] Store FEN after each accepted move.
- [ ] Track white and black clocks.
- [ ] Prevent a player from playing both sides.
- [ ] Define all result and termination conditions.
- [ ] Select and approve a chess-rules validation library before implementation.
- [ ] Validate legal moves on the server.
- [ ] Make move submission transactional and idempotent using game-state version checks, row locking, and unique game/ply protection.
- [ ] Add Game Management permissions and comprehensive tests.

## Phase 10: Live Games and Matchmaking

Goal: allow players to find opponents and play synchronized games.

- [x] Create `matchmaking_queue` with the indexes required for tier, region, rating, status, and queue age.
- [x] Prevent multiple active queue entries per player with a database-enforced generated uniqueness key.
- [ ] Match by tier, region, rating, and configurable rating range.
- [ ] Add queue expiration and cancellation.
- [ ] Create games atomically after a successful match.
- [ ] Choose and approve a real-time transport strategy and reliable event-delivery mechanism.
- [ ] Broadcast moves, clocks, draw offers, resignation, and results.
- [ ] Handle reconnection and abandoned games.
- [ ] Protect against duplicate requests and race conditions.
- [ ] Add queue, concurrency, and game-lifecycle tests.

## Phase 11: Rating and Leaderboards

Goal: calculate trustworthy player progression after completed rated games.

- [ ] Define and document the rating algorithm.
- [ ] Update both players atomically after game completion.
- [x] Create immutable-ready `rating_histories`, unique per game and player.
- [ ] Record a rating-history row for both players after every completed rated game.
- [ ] Track wins, draws, losses, highest rating, and games played.
- [ ] Handle provisional ratings.
- [ ] Generate leaderboard snapshots by season, tier, and region.
- [ ] Add player-facing leaderboards and rating history.
- [ ] Add administrative correction workflow with audit logging.
- [ ] Add calculation and concurrency tests.

## Phase 12: Tournaments

Goal: support managed competition events after normal games and ratings are stable.

- [x] Create `tournaments`, `tournament_entries`, `tournament_rounds`, `tournament_pairings`, and `tournament_qualifiers`.
- [ ] Support Swiss, knockout, and round-robin formats incrementally.
- [ ] Start with one approved format rather than all three at once.
- [ ] Enforce registration dates and eligibility rules.
- [ ] Generate pairings and handle byes while enforcing one appearance per player per round and at most one game per pairing.
- [ ] Connect tournament pairings to games.
- [ ] Calculate points, standings, and final positions.
- [ ] Add Tournament permissions, admin UI, player UI, and tests.

## Phase 13: Promotion System

Goal: move qualified players between City, State, National, and World competition levels.

- [x] Create configurable promotion rules with permission-protected Apex administration and audit logging.
- [x] Seed City to State, State to National, and National to World rules with 20, 30, and 40 minimum games respectively.
- [x] Add authenticated mobile league list/detail APIs with backend-hosted artwork URLs, personalized regions, lock status, player counts, ratings, and promotion progress.
- [ ] Evaluate rating, minimum games, and tournament qualification.
- [x] Create promotion records.
- [x] Support pending, qualified, approved, and rejected states in storage and models.
- [x] Implement and enforce qualified-to-approved/rejected administrative transitions.
- [x] Add administrative approval where required, including target-tier unlocking.
- [x] Preserve a complete promotion rule/review audit trail.
- [x] Add Promotion permissions and tests.

## Phase 14: Moderation and Fair Play

Goal: provide safe administrative workflows for disputes and abuse.

- [x] Create `user_reports` with reporter, subject, game, reviewer, and status relationships.
- [ ] Implement the user-report review workflow.
- [x] Create `game_disputes` linked to authoritative games.
- [ ] Implement the game-dispute review workflow.
- [x] Create `anti_cheat_flags` with structured evidence storage.
- [ ] Implement protected anti-cheat evidence access and review workflows.
- [ ] Add severity and review statuses.
- [ ] Prevent players from reporting themselves.
- [ ] Restrict sensitive evidence to authorized moderators.
- [ ] Add suspension and banning workflows through the existing user status system.
- [ ] Add Moderation and Anti-Cheat permissions.
- [ ] Add moderator UI, audit history, and tests.

## Phase 15: Notifications and Devices

Goal: notify players about games, tournaments, location requests, and moderation outcomes.

- [x] Create `notifications` with in-app read tracking.
- [x] Create `device_tokens` for Android and iOS clients.
- [ ] Select push providers before implementing delivery.
- [ ] Queue notification delivery.
- [ ] Remove invalid device tokens safely.
- [ ] Add notification preferences.
- [ ] Add Notification permissions and tests.

## Optional Phase: Advertisement Events

This should be implemented only if advertising or rewarded advertisements are part of the product model.

- [ ] Confirm advertisement requirements and provider.
- [x] Create dormant `ad_events` storage for impressions, clicks, rewards, and failures.
- [ ] Prevent duplicate rewards.
- [ ] Avoid storing unnecessary personal data.
- [ ] Add reporting permissions and tests.

## Suggested Permission Modules

- Player Profiles
- Geography
- Player Locations
- Competition Tiers
- Competition Regions
- Seasons
- Player Ratings
- Leaderboards
- System Settings
- Games
- Matchmaking
- Tournaments
- Promotions
- User Reports
- Game Disputes
- Anti-Cheat
- Notifications
- Advertisement Reports

Each module should expose only the actions it genuinely supports. For example, a leaderboard may need `read` and `recalculate`, but not ordinary CRUD controls.

## Definition of Done for Every Phase

A phase is complete only when all applicable items below are satisfied:

- [ ] Database migrations are reversible and preserve existing data.
- [ ] Models and relationships follow existing project conventions.
- [ ] Factories and seeders exist where useful.
- [ ] Requests validate and authorize all inputs.
- [ ] Backend authorization is enforced independently of hidden UI buttons.
- [ ] Permissions and Super Admin behavior are covered.
- [ ] Inertia React UI uses the existing ChessX design system.
- [ ] Empty, loading, validation, success, and failure states are handled.
- [ ] Important success and failure paths have feature tests.
- [ ] Affected tests pass.
- [ ] Laravel Pint passes for changed PHP files.
- [ ] Frontend lint and production build pass for changed frontend files.
- [ ] No secrets, tokens, uploaded files, or local environment files are committed.
- [ ] The completed phase is committed and pushed before starting the next phase.

## Immediate Next Action

Keep Apple Login marked in progress until a real Apple bundle/client identifier and Apple test account are available. Phase 7 mobile authentication and the Phase 8 backend settings foundation are complete. The settings administration page is not required for the current mobile/API focus. Next, begin **Phase 9: Chess Game Foundation** by finalizing game invariants and the chess-rules validation library before creating the game-state migrations. Automatic Promotion eligibility remains deferred until authoritative game results and tournament qualification exist.

