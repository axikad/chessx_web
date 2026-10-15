<?php

namespace App\Services\Location;

use App\Enums\CompetitionTierCode;
use App\Enums\PlayerCompetitionStatus;
use App\Models\City;
use App\Models\CompetitionTier;
use App\Models\LocationChangeHistory;
use App\Models\LocationChangeRequest;
use App\Models\PlayerCompetition;
use App\Models\User;
use App\Models\UserLocation;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use JsonException;

class LocationResolutionService
{
    /** @return array<string, mixed> */
    public function resolve(User $user, float $latitude, float $longitude): array
    {
        $candidates = $this->nearbyCities($latitude, $longitude);

        if ($candidates->isEmpty()) {
            throw ValidationException::withMessages([
                'location' => 'No supported city was found within the configured radius.',
            ]);
        }

        $expiresAt = now()->addMinutes($this->tokenMinutes());
        $token = Crypt::encryptString(json_encode([
            'user_id' => $user->getKey(),
            'city_ids' => $candidates->pluck('city.id')->map(fn (int $id): int => $id)->all(),
            'expires_at' => $expiresAt->getTimestamp(),
        ], JSON_THROW_ON_ERROR));

        return [
            'resolutionToken' => $token,
            'expiresAt' => $expiresAt->toIso8601String(),
            'candidates' => $candidates->map(fn (array $candidate): array => [
                ...$this->place($candidate['city']),
                'distanceKm' => round($candidate['distance'], 2),
            ])->all(),
        ];
    }

    /** @return array<string, mixed> */
    public function confirm(User $user, string $token, int $cityId): array
    {
        $candidateIds = $this->candidateIds($user, $token);

        if (! in_array($cityId, $candidateIds, true)) {
            throw ValidationException::withMessages(['city_id' => 'Select a city returned by this location resolution.']);
        }

        $city = City::query()->with('state.country')->where('status', 'active')->find($cityId);

        if ($city === null) {
            throw ValidationException::withMessages(['city_id' => 'The selected city is not available.']);
        }

        if ($user->currentLocation()->exists()) {
            abort(409, 'A current location already exists. Use the location-change process.');
        }

        try {
            $location = DB::transaction(function () use ($user, $city): UserLocation {
                $location = UserLocation::query()->create([
                    'user_id' => $user->getKey(),
                    'city_id' => $city->getKey(),
                    'verification_method' => 'gps',
                    'verified_at' => now(),
                    'policy_version' => config('chess.location_policy_version'),
                    'is_current' => true,
                ]);

                LocationChangeHistory::query()->create([
                    'user_id' => $user->getKey(),
                    'old_city_id' => null,
                    'new_city_id' => $city->getKey(),
                    'change_request_id' => null,
                    'changed_at' => now(),
                ]);

                $this->unlockCityLeague($user);

                return $location;
            });
        } catch (UniqueConstraintViolationException) {
            abort(409, 'A current location already exists. Use the location-change process.');
        }

        return [
            'verificationMethod' => $location->verification_method,
            'verifiedAt' => $location->verified_at?->toIso8601String(),
            ...$this->place($city),
        ];
    }

    /** @return array<string, mixed> */
    public function requestChange(User $user, string $token, int $cityId, ?string $reason): array
    {
        $current = $user->currentLocation()->first();

        if ($current === null) {
            throw ValidationException::withMessages(['location' => 'Confirm a home city before requesting a change.']);
        }

        if ($current->city_id === $cityId) {
            throw ValidationException::withMessages(['city_id' => 'The selected city is already your current city.']);
        }

        if (! in_array($cityId, $this->candidateIds($user, $token), true)) {
            throw ValidationException::withMessages(['city_id' => 'Select a city returned by this location resolution.']);
        }

        $city = City::query()->where('status', 'active')->find($cityId);

        if ($city === null) {
            throw ValidationException::withMessages(['city_id' => 'The selected city is not available.']);
        }

        $lastChange = LocationChangeHistory::query()
            ->where('user_id', $user->getKey())
            ->latest('changed_at')
            ->latest('id')
            ->first();
        $availableAt = $lastChange?->changed_at?->copy()->addDays($this->cooldownDays());

        if ($availableAt?->isFuture()) {
            throw ValidationException::withMessages([
                'location' => 'Your location can be changed after '.$availableAt->toDateString().'.',
            ]);
        }

        try {
            $request = LocationChangeRequest::query()->create([
                'user_id' => $user->getKey(),
                'old_city_id' => $current->city_id,
                'new_city_id' => $city->getKey(),
                'verification_method' => 'gps',
                'status' => 'pending',
                'requested_at' => now(),
                'reason' => $reason,
            ]);
        } catch (UniqueConstraintViolationException) {
            abort(409, 'A location-change request is already pending.');
        }

        return [
            'id' => $request->getKey(),
            'status' => $request->status,
            'requestedAt' => $request->requested_at?->toIso8601String(),
            'oldCityId' => $request->old_city_id,
            'newCityId' => $request->new_city_id,
        ];
    }

    /** @return array<string, mixed> */
    public function snapshot(User $user): array
    {
        $current = $user->currentLocation()->with('city.state.country')->first();
        $pending = LocationChangeRequest::query()
            ->with(['oldCity.state.country', 'newCity.state.country'])
            ->where('user_id', $user->getKey())
            ->where('status', 'pending')
            ->first();
        $lastChange = LocationChangeHistory::query()
            ->where('user_id', $user->getKey())
            ->latest('changed_at')
            ->latest('id')
            ->first();
        $availableAt = $lastChange?->changed_at?->copy()->addDays($this->cooldownDays());

        return [
            'current' => $current === null ? null : [
                ...$this->place($current->city),
                'verificationMethod' => $current->verification_method,
                'verifiedAt' => $current->verified_at?->toIso8601String(),
            ],
            'pendingRequest' => $pending === null ? null : [
                'id' => $pending->getKey(),
                'status' => $pending->status,
                'requestedAt' => $pending->requested_at?->toIso8601String(),
                'oldCity' => $this->place($pending->oldCity),
                'newCity' => $this->place($pending->newCity),
                'reason' => $pending->reason,
            ],
            'cooldown' => [
                'days' => $this->cooldownDays(),
                'changeAllowed' => $current !== null && $pending === null && ($availableAt === null || $availableAt->isPast()),
                'availableAt' => $availableAt?->toIso8601String(),
            ],
        ];
    }

    /** @return Collection<int, array{city: City, distance: float}> */
    private function nearbyCities(float $latitude, float $longitude): Collection
    {
        return City::query()
            ->with('state.country')
            ->where('status', 'active')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get()
            ->map(fn (City $city): array => [
                'city' => $city,
                'distance' => $this->distanceKm($latitude, $longitude, (float) $city->latitude, (float) $city->longitude),
            ])
            ->filter(fn (array $candidate): bool => $candidate['distance'] <= $this->radiusKm())
            ->sortBy('distance')
            ->take($this->candidateLimit())
            ->values();
    }

    /** @return array<int, int> */
    private function candidateIds(User $user, string $token): array
    {
        try {
            $payload = json_decode(Crypt::decryptString($token), true, 512, JSON_THROW_ON_ERROR);
        } catch (DecryptException|JsonException) {
            throw ValidationException::withMessages(['resolution_token' => 'The location resolution is invalid.']);
        }

        if (! is_array($payload)
            || (int) ($payload['user_id'] ?? 0) !== $user->getKey()
            || ! is_array($payload['city_ids'] ?? null)
        ) {
            throw ValidationException::withMessages(['resolution_token' => 'The location resolution is invalid.']);
        }

        if ((int) ($payload['expires_at'] ?? 0) < now()->getTimestamp()) {
            throw ValidationException::withMessages(['resolution_token' => 'The location resolution has expired.']);
        }

        return array_map('intval', $payload['city_ids']);
    }

    /** @return array<string, int|string|null> */
    private function place(City $city): array
    {
        return [
            'cityId' => $city->getKey(),
            'city' => $city->name,
            'stateId' => $city->state?->getKey(),
            'state' => $city->state?->name,
            'countryId' => $city->state?->country?->getKey(),
            'country' => $city->state?->country?->name,
            'countryIso2' => $city->state?->country?->iso2,
        ];
    }

    private function distanceKm(float $latitude, float $longitude, float $cityLatitude, float $cityLongitude): float
    {
        $latitudeDelta = deg2rad($cityLatitude - $latitude);
        $longitudeDelta = deg2rad($cityLongitude - $longitude);
        $haversine = sin($latitudeDelta / 2) ** 2
            + cos(deg2rad($latitude)) * cos(deg2rad($cityLatitude)) * sin($longitudeDelta / 2) ** 2;

        return 6371.0 * 2 * atan2(sqrt($haversine), sqrt(1 - $haversine));
    }

    private function radiusKm(): float
    {
        return (float) config('chess.location_resolve_radius_km');
    }

    private function tokenMinutes(): int
    {
        return (int) config('chess.location_resolution_token_minutes');
    }

    private function candidateLimit(): int
    {
        return max(1, (int) config('chess.location_candidate_limit'));
    }

    private function cooldownDays(): int
    {
        return max(0, (int) config('chess.location_change_cooldown_days'));
    }

    private function unlockCityLeague(User $user): PlayerCompetition
    {
        $tier = CompetitionTier::query()
            ->where('code', CompetitionTierCode::City)
            ->firstOrFail();

        $competition = PlayerCompetition::query()->firstOrCreate(
            [
                'user_id' => $user->getKey(),
                'tier_id' => $tier->getKey(),
                'season_id' => null,
            ],
            [
                'status' => PlayerCompetitionStatus::Eligible,
                'unlocked_at' => now(),
            ],
        );

        if (! $competition->wasRecentlyCreated && $competition->status === PlayerCompetitionStatus::Locked) {
            $competition->forceFill([
                'status' => PlayerCompetitionStatus::Eligible,
                'unlocked_at' => now(),
            ])->save();
        }

        return $competition;
    }
}
