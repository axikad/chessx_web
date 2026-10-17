<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCityRequest;
use App\Http\Requests\StoreCountryRequest;
use App\Http\Requests\StoreStateRequest;
use App\Http\Requests\UpdateCityRequest;
use App\Http\Requests\UpdateCountryRequest;
use App\Http\Requests\UpdateStateRequest;
use App\Models\AuditLog;
use App\Models\City;
use App\Models\CompetitionRegion;
use App\Models\Country;
use App\Models\LocationChangeHistory;
use App\Models\LocationChangeRequest;
use App\Models\State;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class GeographyManagementController extends Controller
{
    public function countries(): JsonResponse
    {
        Gate::authorize('geography.read');

        $countries = Country::query()
            ->withCount('states')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $countries->map(fn (Country $country): array => $this->countryData($country))]);
    }

    public function storeCountry(StoreCountryRequest $request): JsonResponse
    {
        $country = $this->createWithAudit($request, Country::class, $request->validated(), 'geography.country_created');

        return response()->json([
            'data' => $this->countryData($country->loadCount('states')),
            'message' => 'Country created successfully.',
        ], 201);
    }

    public function updateCountry(UpdateCountryRequest $request, Country $country): JsonResponse
    {
        $this->updateWithAudit($request, $country, $request->validated(), 'geography.country_updated');

        return response()->json([
            'data' => $this->countryData($country->loadCount('states')),
            'message' => 'Country updated successfully.',
        ]);
    }

    public function destroyCountry(Request $request, Country $country): JsonResponse
    {
        Gate::authorize('geography.delete');
        abort_if(
            $country->states()->exists() || CompetitionRegion::query()->where('country_id', $country->getKey())->exists(),
            422,
            'Deactivate this country instead because it is referenced by states or competition regions.',
        );
        $this->deleteWithAudit($request, $country, 'geography.country_deleted');

        return response()->json(['message' => 'Country deleted successfully.']);
    }

    public function states(Request $request): JsonResponse
    {
        Gate::authorize('geography.read');
        $validated = $request->validate(['country_id' => ['required', 'integer', 'exists:countries,id']]);
        $states = State::query()
            ->where('country_id', $validated['country_id'])
            ->withCount('cities')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $states->map(fn (State $state): array => $this->stateData($state))]);
    }

    public function storeState(StoreStateRequest $request): JsonResponse
    {
        $state = $this->createWithAudit($request, State::class, $request->validated(), 'geography.state_created');

        return response()->json([
            'data' => $this->stateData($state->loadCount('cities')),
            'message' => 'State created successfully.',
        ], 201);
    }

    public function updateState(UpdateStateRequest $request, State $state): JsonResponse
    {
        $this->updateWithAudit($request, $state, $request->validated(), 'geography.state_updated');

        return response()->json([
            'data' => $this->stateData($state->loadCount('cities')),
            'message' => 'State updated successfully.',
        ]);
    }

    public function destroyState(Request $request, State $state): JsonResponse
    {
        Gate::authorize('geography.delete');
        abort_if(
            $state->cities()->exists() || CompetitionRegion::query()->where('state_id', $state->getKey())->exists(),
            422,
            'Deactivate this state instead because it is referenced by cities or competition regions.',
        );
        $this->deleteWithAudit($request, $state, 'geography.state_deleted');

        return response()->json(['message' => 'State deleted successfully.']);
    }

    public function cities(Request $request): JsonResponse
    {
        Gate::authorize('geography.read');
        $validated = $request->validate(['state_id' => ['required', 'integer', 'exists:states,id']]);
        $cities = City::query()
            ->where('state_id', $validated['state_id'])
            ->withCount('userLocations')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $cities->map(fn (City $city): array => $this->cityData($city))]);
    }

    public function storeCity(StoreCityRequest $request): JsonResponse
    {
        $city = $this->createWithAudit($request, City::class, $request->validated(), 'geography.city_created');

        return response()->json([
            'data' => $this->cityData($city->loadCount('userLocations')),
            'message' => 'City created successfully.',
        ], 201);
    }

    public function updateCity(UpdateCityRequest $request, City $city): JsonResponse
    {
        $this->updateWithAudit($request, $city, $request->validated(), 'geography.city_updated');

        return response()->json([
            'data' => $this->cityData($city->loadCount('userLocations')),
            'message' => 'City updated successfully.',
        ]);
    }

    public function destroyCity(Request $request, City $city): JsonResponse
    {
        Gate::authorize('geography.delete');
        $isReferenced = $city->userLocations()->exists()
            || CompetitionRegion::query()->where('city_id', $city->getKey())->exists()
            || LocationChangeRequest::query()->where('old_city_id', $city->getKey())->orWhere('new_city_id', $city->getKey())->exists()
            || LocationChangeHistory::query()->where('old_city_id', $city->getKey())->orWhere('new_city_id', $city->getKey())->exists();
        abort_if($isReferenced, 422, 'Deactivate this city instead because it is referenced by players, requests, history, or competition regions.');
        $this->deleteWithAudit($request, $city, 'geography.city_deleted');

        return response()->json(['message' => 'City deleted successfully.']);
    }

    /** @return array<string, mixed> */
    private function countryData(Country $country): array
    {
        return [
            'id' => $country->getKey(),
            'geonames_id' => $country->geonames_id,
            'iso2' => $country->iso2,
            'iso3' => $country->iso3,
            'name' => $country->name,
            'status' => $country->status,
            'states_count' => $country->states_count ?? $country->states()->count(),
        ];
    }

    /** @return array<string, mixed> */
    private function stateData(State $state): array
    {
        return [
            'id' => $state->getKey(),
            'geonames_id' => $state->geonames_id,
            'country_id' => $state->country_id,
            'name' => $state->name,
            'code' => $state->code,
            'geonames_code' => $state->geonames_code,
            'status' => $state->status,
            'cities_count' => $state->cities_count ?? $state->cities()->count(),
        ];
    }

    /** @return array<string, mixed> */
    private function cityData(City $city): array
    {
        return [
            'id' => $city->getKey(),
            'geonames_id' => $city->geonames_id,
            'state_id' => $city->state_id,
            'name' => $city->name,
            'district' => $city->district,
            'latitude' => $city->latitude,
            'longitude' => $city->longitude,
            'timezone' => $city->timezone,
            'status' => $city->status,
            'players_count' => $city->user_locations_count ?? $city->userLocations()->count(),
        ];
    }

    /**
     * @param  class-string<Model>  $modelClass
     * @param  array<string, mixed>  $attributes
     */
    private function createWithAudit(Request $request, string $modelClass, array $attributes, string $action): Model
    {
        return DB::transaction(function () use ($request, $modelClass, $attributes, $action): Model {
            $model = $modelClass::query()->create($attributes);
            $this->audit($request, $model, $action, ['current' => $model->getAttributes()]);

            return $model;
        });
    }

    /** @param array<string, mixed> $attributes */
    private function updateWithAudit(Request $request, Model $model, array $attributes, string $action): void
    {
        DB::transaction(function () use ($request, $model, $attributes, $action): void {
            $previous = $model->getAttributes();
            $model->update($attributes);
            $this->audit($request, $model, $action, ['previous' => $previous, 'current' => $model->getAttributes()]);
        });
    }

    private function deleteWithAudit(Request $request, Model $model, string $action): void
    {
        DB::transaction(function () use ($request, $model, $action): void {
            $attributes = $model->getAttributes();
            $this->audit($request, $model, $action, ['deleted' => $attributes]);
            $model->delete();
        });
    }

    /** @param array<string, mixed> $metadata */
    private function audit(Request $request, Model $model, string $action, array $metadata): void
    {
        AuditLog::query()->create([
            'actor_user_id' => $request->user()->getKey(),
            'action' => $action,
            'entity_type' => $model->getTable(),
            'entity_id' => $model->getKey(),
            'metadata' => $metadata,
            'ip_address' => $request->ip(),
        ]);
    }
}
