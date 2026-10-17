<?php

namespace App\Http\Requests;

use App\Enums\CompetitionTierCode;
use App\Models\CompetitionRegion;
use App\Models\CompetitionTier;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreCompetitionRegionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('competitions.create') === true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'tier_id' => ['required', 'integer', 'exists:competition_tiers,id'],
            'country_id' => ['nullable', 'integer', 'exists:countries,id'],
            'state_id' => ['nullable', 'integer', 'exists:states,id'],
            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
            'name' => ['required', 'string', 'max:200'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ];
    }

    /** @return list<callable(Validator): void> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($validator->errors()->hasAny(['tier_id', 'country_id', 'state_id', 'city_id'])) {
                return;
            }

            $tier = CompetitionTier::query()->find($this->integer('tier_id'));
            if (! $tier) {
                return;
            }

            $scopeKey = match ($tier->code) {
                CompetitionTierCode::City => $this->validateScope($validator, 'city_id', CompetitionTierCode::City),
                CompetitionTierCode::State => $this->validateScope($validator, 'state_id', CompetitionTierCode::State),
                CompetitionTierCode::National => $this->validateScope($validator, 'country_id', CompetitionTierCode::National),
                CompetitionTierCode::World => $this->validateWorldScope($validator),
            };

            if ($scopeKey === null || $validator->errors()->isNotEmpty()) {
                return;
            }

            if (CompetitionRegion::query()->where('tier_id', $tier->getKey())->where('scope_key', $scopeKey)->exists()) {
                $validator->errors()->add('tier_id', 'A competition region already exists for this tier and geographic scope.');
            }
        }];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['name' => str($this->input('name'))->trim()->squish()->value()]);
    }

    private function validateScope(Validator $validator, string $requiredField, CompetitionTierCode $code): ?string
    {
        $scopeFields = ['country_id', 'state_id', 'city_id'];

        if (! $this->filled($requiredField) || collect($scopeFields)->reject(fn (string $field): bool => $field === $requiredField)->contains(fn (string $field): bool => $this->filled($field))) {
            $validator->errors()->add('tier_id', sprintf('%s regions must reference only a %s.', $code->name, str_replace('_id', '', $requiredField)));

            return null;
        }

        return str_replace('_id', '', $requiredField).':'.$this->integer($requiredField);
    }

    private function validateWorldScope(Validator $validator): ?string
    {
        if ($this->filled('country_id') || $this->filled('state_id') || $this->filled('city_id')) {
            $validator->errors()->add('tier_id', 'World regions cannot reference a geographic record.');

            return null;
        }

        return 'global';
    }
}
