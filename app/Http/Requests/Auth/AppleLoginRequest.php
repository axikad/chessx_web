<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class AppleLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'id_token' => ['required', 'string', 'max:8192'],
            'nonce' => ['required', 'string', 'min:16', 'max:255'],
            'state' => ['required', 'string', 'min:16', 'max:255'],
            'first_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['nullable', 'string', 'max:100'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'nonce' => trim((string) $this->input('nonce')),
            'state' => trim((string) $this->input('state')),
            'first_name' => $this->nullableTrimmedString('first_name'),
            'last_name' => $this->nullableTrimmedString('last_name'),
        ]);
    }

    private function nullableTrimmedString(string $key): ?string
    {
        $value = $this->input($key);

        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        return trim($value);
    }
}
