<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CheckUsernameAvailabilityRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'username' => [
                'required',
                'string',
                'lowercase',
                'min:3',
                'max:30',
                'regex:/^[a-z0-9_]+$/',
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'username' => $this->string('username')->trim()->lower()->toString(),
        ]);
    }
}
