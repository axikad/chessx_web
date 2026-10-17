<?php

namespace App\Http\Requests;

use App\Models\PromotionRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePromotionRuleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('promotions.update') === true
            && $this->route('promotionRule') instanceof PromotionRule;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'min_rating' => ['required', 'integer', 'min:100', 'max:4000'],
            'min_games' => ['required', 'integer', 'min:1', 'max:10000'],
            'rating_threshold_enabled' => ['required', 'boolean'],
            'qualification_required' => ['required', 'boolean'],
            'effective_from' => ['required', 'date'],
            'effective_until' => ['nullable', 'date', 'after:effective_from'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
