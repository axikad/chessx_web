<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ResolvePlayerLocationRequest extends FormRequest
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
            'permission' => ['required', 'string', 'in:granted,denied'],
            'latitude' => ['required_if:permission,granted', 'nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['required_if:permission,granted', 'nullable', 'numeric', 'between:-180,180'],
        ];
    }
}
