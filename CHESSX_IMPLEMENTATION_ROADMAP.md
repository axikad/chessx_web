# ChessX Implementation Roadmap

This roadmap guides the gradual integration of the useful Chess Mission features into `chessx_web` without replacing the existing Laravel, Inertia React, authentication, branding, or RBAC foundation.

## Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Completed and verified
- `[!]` Blocked or requires a product decision

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

## Phase 0: Integration Baseline

Goal: establish a safe starting point before importing chess-domain features.

- [ ] Confirm the current `chessx_web` branch is clean and pushed.
- [x] Run the complete existing test suite.
- [x] Run the production frontend build.
- [x] Record the current database schema.
- [ ] Decide whether the first release targets web only or web and mobile.
- [ ] Define the initial supported geography.
- [ ] Define whether public registration creates a Player account automatically.

Acceptance criteria:

- [x] Existing authentication, users, roles, permissions, and branding still pass all tests.
- The first release scope is documented before database changes begin.

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

- [ ] Create countries, states, and cities tables.
- [ ] Seed the approved geography dataset.
- [ ] Create player location records.
- [ ] Create location-change requests and location history.
- [ ] Add one-current-location protection per player.
- [ ] Adapt GPS city resolution from Chess Mission.
- [ ] Use a signed, expiring location confirmation token.
- [ ] Do not permanently store raw GPS coordinates.
- [ ] Add configurable location radius and change cooldown.
- [ ] Create admin location-review UI.
- [ ] Add Geography and Location permissions.
- [ ] Add feature tests for confirmation, cooldown, authorization, and audit history.

## Phase 3: Competition Foundation

Goal: introduce the City, State, National, and World competition hierarchy.

- [ ] Create competition tiers.
- [ ] Seed City, State, National, and World tiers.
- [ ] Create competition regions linked to geography.
- [ ] Create seasons.
- [ ] Create player competition eligibility records.
- [ ] Create player ratings per competition tier.
- [ ] Create leaderboard snapshot storage.
- [ ] Make starting rating configurable.
- [ ] Unlock City League only after location confirmation.
- [ ] Add Competition, Season, Rating, and Leaderboard permissions.
- [ ] Add admin management pages and feature tests.

Product decisions:

- [ ] Confirm the starting Elo rating.
- [ ] Define provisional-rating rules.
- [ ] Define season rollover behavior.
- [ ] Decide whether ratings reset, partially reset, or continue between seasons.

## Phase 4: Player Registration and Onboarding

Goal: connect account creation to the chess competition system.

- [ ] Assign the Player/User role during public registration.
- [ ] Create the player profile automatically.
- [ ] Create rating rows for all active competition tiers.
- [ ] Create locked competition eligibility rows.
- [ ] Guide the player through username and home-city confirmation.
- [ ] Prevent administrative roles from receiving player competition records automatically.
- [ ] Make onboarding idempotent so records cannot be duplicated.
- [ ] Add registration and onboarding tests.

## Phase 5: Google Login

Goal: support secure Google authentication while preserving existing accounts.

- [ ] Create the external authentication providers table.
- [ ] Adapt Google ID-token verification from Chess Mission.
- [ ] Add a Google login endpoint or web flow appropriate for the chosen clients.
- [ ] Link Google to an existing user only when Google verifies the matching email.
- [ ] Prevent duplicate provider identities.
- [ ] Import safe display-name and avatar information.
- [ ] Run the standard player-onboarding flow for new Google accounts.
- [ ] Add rate limiting, validation, error responses, and tests.
- [ ] Add account UI for connected login providers.

Security requirements:

- Never trust a Google user ID or email sent without a verified Google token.
- Never automatically link an unverified Google email to an existing account.

## Phase 6: Apple Login

Goal: add Apple authentication as a new implementation; Chess Mission only prepared its database value.

- [ ] Configure Apple client identifiers and signing credentials.
- [ ] Verify Apple identity tokens, issuer, audience, expiry, and nonce.
- [ ] Store the Apple provider subject.
- [ ] Handle Apple's private relay email addresses.
- [ ] Capture the user's name during the first authorization when supplied.
- [ ] Run standard player onboarding for new Apple accounts.
- [ ] Add connected-provider management and tests.

## Phase 7: Mobile/API Authentication

Goal: support Android, iOS, or external clients without replacing browser-session authentication.

- [ ] Confirm that a mobile application is in scope before beginning this phase.
- [ ] Install or configure Sanctum only with explicit approval if it is not already required.
- [ ] Add versioned API routes.
- [ ] Issue short-lived access tokens.
- [ ] Add hashed refresh tokens and rotation.
- [ ] Track platform and device sessions.
- [ ] Allow individual session revocation.
- [ ] Add logout-all-devices support.
- [ ] Add throttling, consistent API responses, resources, and tests.

## Phase 8: System Settings

Goal: allow authorized administrators to configure chess business rules.

- [ ] Create general system settings separate from branding settings.
- [ ] Support typed values and safe defaults.
- [ ] Add settings for starting rating, location, clocks, and matchmaking.
- [ ] Record who changed each setting.
- [ ] Add an admin settings page.
- [ ] Add System Settings permissions and tests.

## Phase 9: Chess Game Foundation

Goal: persist reliable game state before implementing live play.

- [ ] Create games, game states, game moves, and game events.
- [ ] Support rated, casual, and tournament games.
- [ ] Store UCI and SAN moves.
- [ ] Store FEN after each accepted move.
- [ ] Track white and black clocks.
- [ ] Prevent a player from playing both sides.
- [ ] Define all result and termination conditions.
- [ ] Select and approve a chess-rules validation library before implementation.
- [ ] Validate legal moves on the server.
- [ ] Make move submission transactional and idempotent.
- [ ] Add Game Management permissions and comprehensive tests.

## Phase 10: Live Games and Matchmaking

Goal: allow players to find opponents and play synchronized games.

- [ ] Create the matchmaking queue.
- [ ] Prevent multiple active queue entries per player.
- [ ] Match by tier, region, rating, and configurable rating range.
- [ ] Add queue expiration and cancellation.
- [ ] Create games atomically after a successful match.
- [ ] Choose and approve a real-time transport strategy.
- [ ] Broadcast moves, clocks, draw offers, resignation, and results.
- [ ] Handle reconnection and abandoned games.
- [ ] Protect against duplicate requests and race conditions.
- [ ] Add queue, concurrency, and game-lifecycle tests.

## Phase 11: Rating and Leaderboards

Goal: calculate trustworthy player progression after completed rated games.

- [ ] Define and document the rating algorithm.
- [ ] Update both players atomically after game completion.
- [ ] Store immutable rating history.
- [ ] Track wins, draws, losses, highest rating, and games played.
- [ ] Handle provisional ratings.
- [ ] Generate leaderboard snapshots by season, tier, and region.
- [ ] Add player-facing leaderboards and rating history.
- [ ] Add administrative correction workflow with audit logging.
- [ ] Add calculation and concurrency tests.

## Phase 12: Tournaments

Goal: support managed competition events after normal games and ratings are stable.

- [ ] Create tournament, entry, round, pairing, and qualifier workflows.
- [ ] Support Swiss, knockout, and round-robin formats incrementally.
- [ ] Start with one approved format rather than all three at once.
- [ ] Enforce registration dates and eligibility rules.
- [ ] Generate pairings and handle byes.
- [ ] Connect tournament pairings to games.
- [ ] Calculate points, standings, and final positions.
- [ ] Add Tournament permissions, admin UI, player UI, and tests.

## Phase 13: Promotion System

Goal: move qualified players between City, State, National, and World competition levels.

- [ ] Create configurable promotion rules.
- [ ] Evaluate rating, minimum games, and tournament qualification.
- [ ] Create promotion records.
- [ ] Support pending, qualified, approved, and rejected states.
- [ ] Add administrative approval where required.
- [ ] Preserve a complete promotion audit trail.
- [ ] Add Promotion permissions and tests.

## Phase 14: Moderation and Fair Play

Goal: provide safe administrative workflows for disputes and abuse.

- [ ] Add user reports.
- [ ] Add game disputes.
- [ ] Add anti-cheat flags and evidence.
- [ ] Add severity and review statuses.
- [ ] Prevent players from reporting themselves.
- [ ] Restrict sensitive evidence to authorized moderators.
- [ ] Add suspension and banning workflows through the existing user status system.
- [ ] Add Moderation and Anti-Cheat permissions.
- [ ] Add moderator UI, audit history, and tests.

## Phase 15: Notifications and Devices

Goal: notify players about games, tournaments, location requests, and moderation outcomes.

- [ ] Add in-app notifications and read tracking.
- [ ] Add device tokens for Android and iOS when mobile clients exist.
- [ ] Select push providers before implementing delivery.
- [ ] Queue notification delivery.
- [ ] Remove invalid device tokens safely.
- [ ] Add notification preferences.
- [ ] Add Notification permissions and tests.

## Optional Phase: Advertisement Events

This should be implemented only if advertising or rewarded advertisements are part of the product model.

- [ ] Confirm advertisement requirements and provider.
- [ ] Track impressions, clicks, rewards, and failures.
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

Begin with **Phase 0**, then implement **Phase 1: Player Identity Foundation**. Do not start Google login, matchmaking, games, or tournaments until the identity and competition foundations are stable.

