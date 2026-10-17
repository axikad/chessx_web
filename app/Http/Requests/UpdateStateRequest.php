<?php

namespace App\Http\Requests;

use App\Models\State;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('geography.update') === true
            && $this->route('state') instanceof State;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'country_id' => ['required', 'integer', Rule::exists('countries', 'id')],
            'name' => [
                'required',
                'string',
                'max:150',
                Rule::unique('states', 'name')
                    ->where('country_id', $this->integer('country_id'))
                    ->ignore($this->route('state')),
            ],
            'code' => ['nullable', 'string', 'max:20'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => str($this->input('name'))->trim()->squish()->value(),
            'code' => $this->filled('code') ? str($this->input('code'))->trim()->upper()->value() : null,
        ]);
    }
}
