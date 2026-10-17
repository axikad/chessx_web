<?php

namespace App\Http\Requests\Api\V1;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdatePlayerProfileRequest extends FormRequest
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
                Rule::unique(User::class)->ignore($this->user()->getKey()),
            ],
            'date_of_birth' => ['nullable', 'date', 'before_or_equal:'.now()->subYears(13)->toDateString()],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
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

                if ($this->string('username')->toString() === $user->username
                    || $user->onboarding_completed_at === null
                    || $user->canChangeUsername()
                ) {
                    return;
                }

                $validator->errors()->add(
                    'username',
                    'Your username can only be changed once every 30 days. You can change it again on '
                        .$user->usernameChangeAvailableAt()?->format('F j, Y').'.',
                );
            },
        ];
    }

    protected function prepareForValidation(): void
    {
        $normalized = [
            'username' => $this->string('username')->trim()->lower()->toString(),
        ];

        if ($this->has('date_of_birth')) {
            $normalized['date_of_birth'] = $this->filled('date_of_birth')
                ? $this->string('date_of_birth')->trim()->toString()
                : null;
        }

        $this->merge($normalized);
    }
}
