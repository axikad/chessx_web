<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MobileGoogleLoginRequest extends FormRequest
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
            'device_name' => ['required', 'string', 'max:100'],
            'platform' => ['required', 'string', Rule::in(['android', 'ios'])],
            'device_id' => ['required', 'string', 'max:255'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'device_name' => trim((string) $this->input('device_name')),
            'platform' => mb_strtolower(trim((string) $this->input('platform'))),
            'device_id' => trim((string) $this->input('device_id')),
        ]);
    }
}
