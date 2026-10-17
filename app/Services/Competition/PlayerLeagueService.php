<?php

namespace App\Services\Competition;

use App\Enums\CompetitionTierCode;
use App\Enums\PlayerCompetitionStatus;
use App\Enums\SeasonStatus;
use App\Models\CompetitionRegion;
use App\Models\CompetitionTier;
use App\Models\PlayerCompetition;
use App\Models\PlayerRating;
use App\Models\PromotionRule;
use App\Models\Season;
use App\Models\User;
use App\Models\UserLocation;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

final class PlayerLeagueService
{
    /** @return array{current_season: array<string, mixed>|null, leagues: list<array<string, mixed>>} */
    public function index(User $user): array
    {
        $tiers = CompetitionTier::query()
            ->where('is_active', true)
            ->orderBy('sequence_number')
            ->get();

        return [
            'current_season' => $this->currentSeason(),
            'leagues' => $this->build($user, $tiers),
        ];
    }

    /** @return array<string, mixed> */
    public function show(User $user, CompetitionTier $tier): array
    {
        return [
            'current_season' => $this->currentSeason(),
            'league' => $this->build($user, collect([$tier]))[0],
        ];
    }

    /**
     * @param  Collection<int, CompetitionTier>  $tiers
     * @return list<array<string, mixed>>
     */
    private function build(User $user, Collection $tiers): array
    {
        $user->loadMissing('currentLocation.city.state.country');
        $tierIds = $tiers
            ->map(fn (CompetitionTier $tier): int => $tier->getKey())
            ->all();
        $competitions = PlayerCompetition::query()
            ->where('user_id', $user->getKey())
            ->whereNull('season_id')
            ->whereIn('tier_id', $tierIds)
            ->get()
            ->keyBy('tier_id');
        $ratings = PlayerRating::query()
            ->where('user_id', $user->getKey())
            ->whereIn('tier_id', $tierIds)
            ->get()
            ->keyBy('tier_id');
        $rules = $this->promotionRules($tierIds);
        $regions = $this->regions($tiers, $user->currentLocation);

        return $tiers->map(function (CompetitionTier $tier) use ($competitions, $ratings, $rules, $regions): array {
            /** @var PlayerCompetition|null $competition */
            $competition = $competitions->get($tier->getKey());
            /** @var PlayerRating|null $rating */
            $rating = $ratings->get($tier->getKey());
            /** @var PromotionRule|null $rule */
            $rule = $rules->get($tier->getKey());
            /** @var CompetitionRegion|null $region */
            $region = $regions->get($tier->getKey());
            $status = $competition?->status ?? PlayerCompetitionStatus::Locked;

            return [
                'id' => $tier->getKey(),
                'code' => $tier->code->value,
                'name' => $tier->name,
                'image_url' => $tier->artworkUrl(),
                'scope_type' => $tier->scope_type,
                'sequence_number' => $tier->sequence_number,
                'status' => $status->value,
                'is_unlocked' => $status !== PlayerCompetitionStatus::Locked,
                'unlocked_at' => $competition?->unlocked_at?->toIso8601String(),
                'region' => $this->regionData($region),
                'players_count' => $this->playerCount($tier, $region),
                'rating' => $this->ratingData($rating),
                'promotion' => $this->promotionData($rule, $rating),
            ];
        })->values()->all();
    }

    /** @param list<int> $tierIds
     * @return Collection<int, PromotionRule>
     */
    private function promotionRules(array $tierIds): Collection
    {
        return PromotionRule::query()
            ->with('toTier:id,code,name')
            ->whereIn('from_tier_id', $tierIds)
            ->where('is_active', true)
            ->where('effective_from', '<=', now())
            ->where(function (Builder $query): void {
                $query->whereNull('effective_until')->orWhere('effective_until', '>', now());
            })
            ->latest('effective_from')
            ->latest('id')
            ->get()
            ->unique('from_tier_id')
            ->keyBy('from_tier_id');
    }

    /**
     * @param  Collection<int, CompetitionTier>  $tiers
     * @return Collection<int, CompetitionRegion>
     */
    private function regions(Collection $tiers, ?UserLocation $location): Collection
    {
        $city = $location?->city;
        $scopeKeys = $tiers->mapWithKeys(function (CompetitionTier $tier) use ($city): array {
            $scopeKey = match ($tier->code) {
                CompetitionTierCode::City => $city === null ? null : 'city:'.$city->getKey(),
                CompetitionTierCode::State => $city?->state === null ? null : 'state:'.$city->state->getKey(),
                CompetitionTierCode::National => $city?->state?->country === null ? null : 'country:'.$city->state->country->getKey(),
                CompetitionTierCode::World => 'global',
            };

            return $scopeKey === null ? [] : [$tier->getKey() => $scopeKey];
        });

        if ($scopeKeys->isEmpty()) {
            return collect();
        }

        return CompetitionRegion::query()
            ->where('status', 'active')
            ->where(function (Builder $query) use ($scopeKeys): void {
                $scopeKeys->each(function (string $scopeKey, int $tierId) use ($query): void {
                    $query->orWhere(function (Builder $scopeQuery) use ($tierId, $scopeKey): void {
                        $scopeQuery->where('tier_id', $tierId)->where('scope_key', $scopeKey);
                    });
                });
            })
            ->get()
            ->keyBy('tier_id');
    }

    /** @return array<string, mixed>|null */
    private function currentSeason(): ?array
    {
        $season = Season::query()->where('status', SeasonStatus::Active)->first();

        if ($season === null) {
            return null;
        }

        return [
            'id' => $season->getKey(),
            'name' => $season->name,
            'status' => $season->status->value,
            'starts_at' => $season->starts_at->toIso8601String(),
            'ends_at' => $season->ends_at->toIso8601String(),
        ];
    }

    /** @return array<string, mixed>|null */
    private function regionData(?CompetitionRegion $region): ?array
    {
        if ($region === null) {
            return null;
        }

        return [
            'id' => $region->getKey(),
            'name' => $region->name,
            'scope_key' => $region->scope_key,
        ];
    }

    private function playerCount(CompetitionTier $tier, ?CompetitionRegion $region): int
    {
        if ($region === null) {
            return 0;
        }

        $query = PlayerCompetition::query()
            ->where('tier_id', $tier->getKey())
            ->whereNull('season_id')
            ->whereIn('status', [PlayerCompetitionStatus::Eligible, PlayerCompetitionStatus::Active])
            ->whereHas('user', fn (Builder $userQuery): Builder => $userQuery->where('status', 'active'));

        match ($tier->code) {
            CompetitionTierCode::City => $query->whereHas(
                'user.currentLocation',
                fn (Builder $locationQuery): Builder => $locationQuery->where('city_id', $region->city_id),
            ),
            CompetitionTierCode::State => $query->whereHas(
                'user.currentLocation.city',
                fn (Builder $cityQuery): Builder => $cityQuery->where('state_id', $region->state_id),
            ),
            CompetitionTierCode::National => $query->whereHas(
                'user.currentLocation.city.state',
                fn (Builder $stateQuery): Builder => $stateQuery->where('country_id', $region->country_id),
            ),
            CompetitionTierCode::World => null,
        };

        return $query->distinct()->count('user_id');
    }

    /** @return array<string, mixed>|null */
    private function ratingData(?PlayerRating $rating): ?array
    {
        if ($rating === null) {
            return null;
        }

        return [
            'rating' => $rating->rating,
            'provisional' => $rating->provisional_rating,
            'games_played' => $rating->games_played,
            'wins' => $rating->wins,
            'draws' => $rating->draws,
            'losses' => $rating->losses,
            'highest_rating' => $rating->highest_rating,
        ];
    }

    /** @return array<string, mixed>|null */
    private function promotionData(?PromotionRule $rule, ?PlayerRating $rating): ?array
    {
        if ($rule === null) {
            return null;
        }

        $gamesPlayed = $rating?->games_played ?? 0;
        $currentRating = $rating?->rating;
        $ratingConfigured = $rule->ratingThresholdIsConfigured();
        $minimumGamesMet = $gamesPlayed >= $rule->min_games;
        $ratingRequirementMet = $ratingConfigured && $currentRating !== null
            ? $currentRating >= $rule->min_rating
            : null;
        $blockedReason = match (true) {
            ! $minimumGamesMet => 'minimum_games_not_met',
            ! $ratingConfigured => 'rating_threshold_not_configured',
            $ratingRequirementMet !== true => 'minimum_rating_not_met',
            $rule->qualification_required => 'tournament_qualification_pending',
            default => null,
        };

        return [
            'next_tier' => [
                'code' => $rule->toTier->code->value,
                'name' => $rule->toTier->name,
            ],
            'requirements' => [
                'minimum_games' => $rule->min_games,
                'games_played' => $gamesPlayed,
                'games_remaining' => max(0, $rule->min_games - $gamesPlayed),
                'minimum_games_met' => $minimumGamesMet,
                'rating_threshold_configured' => $ratingConfigured,
                'minimum_rating' => $ratingConfigured ? $rule->min_rating : null,
                'current_rating' => $currentRating,
                'minimum_rating_met' => $ratingRequirementMet,
                'tournament_qualification_required' => $rule->qualification_required,
            ],
            'ready' => $blockedReason === null,
            'blocked_reason' => $blockedReason,
        ];
    }
}
