<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePlayerProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $targetUser = $this->route('user');

        return $this->user()?->can('player_profiles.update') === true
            && (! $targetUser instanceof User || ! $targetUser->isSuperAdmin() || $this->user()->isSuperAdmin());
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'display_name' => ['sometimes', 'nullable', 'string', 'max:100'],
            'language' => ['sometimes', 'required', 'string', 'max:10', 'regex:/^[a-z]{2}(-[A-Z]{2})?$/'],
            'timezone' => ['sometimes', 'nullable', 'timezone:all'],
            'date_of_birth' => ['sometimes', 'nullable', 'date', 'before_or_equal:'.now()->subYears(13)->toDateString()],
            'profile_visibility' => ['sometimes', 'required', Rule::in(['public', 'private'])],
        ];
    }

    protected function prepareForValidation(): void
    {
        $normalized = [];

        foreach (['display_name', 'language', 'timezone', 'date_of_birth'] as $field) {
            if ($this->has($field)) {
                $normalized[$field] = $this->filled($field)
                    ? $this->string($field)->trim()->toString()
                    : null;
            }
        }

        $this->merge($normalized);
    }
}
