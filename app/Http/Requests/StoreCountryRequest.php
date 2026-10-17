<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCountryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('geography.create') === true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'iso2' => ['required', 'string', 'size:2', Rule::unique('countries', 'iso2')],
            'iso3' => ['nullable', 'string', 'size:3', Rule::unique('countries', 'iso3')],
            'name' => ['required', 'string', 'max:100', Rule::unique('countries', 'name')],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'iso2' => str($this->input('iso2'))->trim()->upper()->value(),
            'iso3' => $this->filled('iso3') ? str($this->input('iso3'))->trim()->upper()->value() : null,
            'name' => str($this->input('name'))->trim()->squish()->value(),
        ]);
    }
}
