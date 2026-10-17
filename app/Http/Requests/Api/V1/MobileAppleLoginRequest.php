<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MobileAppleLoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'id_token' => ['required', 'string', 'max:8192'],
            'nonce' => ['required', 'string', 'min:16', 'max:255'],
            'first_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['nullable', 'string', 'max:100'],
            'device_name' => ['required', 'string', 'max:100'],
            'platform' => ['required', 'string', Rule::in(['android', 'ios'])],
            'device_id' => ['required', 'string', 'max:255'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'nonce' => trim((string) $this->input('nonce')),
            'first_name' => $this->nullableTrimmedString('first_name'),
            'last_name' => $this->nullableTrimmedString('last_name'),
            'device_name' => trim((string) $this->input('device_name')),
            'platform' => mb_strtolower(trim((string) $this->input('platform'))),
            'device_id' => trim((string) $this->input('device_id')),
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
