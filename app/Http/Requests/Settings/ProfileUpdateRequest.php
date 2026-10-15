<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],

            'username' => [
                'required',
                'string',
                'lowercase',
                'min:3',
                'max:30',
                'regex:/^[a-z0-9_]+$/',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],

            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],

            'display_name' => ['nullable', 'string', 'max:100'],
            'language' => ['nullable', 'string', 'max:10', 'regex:/^[a-z]{2}(-[A-Z]{2})?$/'],
            'timezone' => ['nullable', 'timezone:all'],
            'date_of_birth' => ['nullable', 'date', 'before_or_equal:'.now()->subYears(13)->toDateString()],
            'profile_visibility' => ['nullable', Rule::in(['public', 'private'])],
        ];
    }

    /** @return array<int, callable(Validator): void> */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->has('username')) {
                    return;
                }

                $user = $this->user();

                if ($this->string('username')->toString() === $user->username || $user->canChangeUsername()) {
                    return;
                }

                $availableAt = $user->usernameChangeAvailableAt();
                $validator->errors()->add(
                    'username',
                    'Your username can only be changed once every 30 days. You can change it again on '.$availableAt?->format('F j, Y').'.',
                );
            },
        ];
    }

    protected function prepareForValidation(): void
    {
        $normalized = [
            'username' => $this->string('username')->trim()->lower()->toString(),
        ];

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
