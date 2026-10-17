<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VerifyEmailOtpRequest extends FormRequest
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
            'email' => ['required', 'string', 'email', 'max:255'],
            'otp' => ['required', 'string', 'regex:/^\d{4}$/'],
            'device_name' => ['required', 'string', 'max:100'],
            'platform' => ['required', 'string', Rule::in(['android', 'ios'])],
            'device_id' => ['required', 'string', 'max:255'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => mb_strtolower(trim((string) $this->input('email'))),
            'otp' => trim((string) $this->input('otp')),
            'device_name' => trim((string) $this->input('device_name')),
            'platform' => mb_strtolower(trim((string) $this->input('platform'))),
            'device_id' => trim((string) $this->input('device_id')),
        ]);
    }
}
