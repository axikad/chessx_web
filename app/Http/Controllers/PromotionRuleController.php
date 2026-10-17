<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdatePromotionRuleRequest;
use App\Models\AuditLog;
use App\Models\PromotionRule;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class PromotionRuleController extends Controller
{
    public function index(): JsonResponse
    {
        Gate::authorize('promotions.read');

        $rules = PromotionRule::query()
            ->with(['fromTier:id,code,name,sequence_number', 'toTier:id,code,name,sequence_number'])
            ->orderBy('from_tier_id')
            ->get();

        return response()->json(['data' => $rules->map(fn (PromotionRule $rule): array => $this->data($rule))]);
    }

    public function update(UpdatePromotionRuleRequest $request, PromotionRule $promotionRule): JsonResponse
    {
        $rule = DB::transaction(function () use ($request, $promotionRule): PromotionRule {
            $rule = PromotionRule::query()->lockForUpdate()->findOrFail($promotionRule->getKey());
            $previous = $this->auditData($rule);
            $validated = $request->validated();

            $rule->update([
                'min_rating' => $validated['min_rating'],
                'min_games' => $validated['min_games'],
                'qualification_required' => $validated['qualification_required'],
                'rules_json' => [
                    ...($rule->rules_json ?? []),
                    'rating_threshold_configured' => $validated['rating_threshold_enabled'],
                ],
                'effective_from' => $validated['effective_from'],
                'effective_until' => $validated['effective_until'],
                'is_active' => $validated['is_active'],
            ]);

            AuditLog::query()->create([
                'actor_user_id' => $request->user()->getKey(),
                'action' => 'promotion.rule_updated',
                'entity_type' => $rule->getTable(),
                'entity_id' => $rule->getKey(),
                'metadata' => [
                    'previous' => $previous,
                    'current' => $this->auditData($rule),
                ],
                'ip_address' => $request->ip(),
            ]);

            return $rule;
        });

        return response()->json([
            'data' => $this->data($rule->load(['fromTier', 'toTier'])),
            'message' => 'Promotion rule updated successfully.',
        ]);
    }

    /** @return array<string, mixed> */
    private function data(PromotionRule $rule): array
    {
        return [
            'id' => $rule->getKey(),
            'fromTier' => [
                'id' => $rule->fromTier->getKey(),
                'code' => $rule->fromTier->code->value,
                'name' => $rule->fromTier->name,
            ],
            'toTier' => [
                'id' => $rule->toTier->getKey(),
                'code' => $rule->toTier->code->value,
                'name' => $rule->toTier->name,
            ],
            'minRating' => $rule->min_rating,
            'minGames' => $rule->min_games,
            'ratingThresholdEnabled' => $rule->ratingThresholdIsConfigured(),
            'qualificationRequired' => $rule->qualification_required,
            'effectiveFrom' => $rule->effective_from->toIso8601String(),
            'effectiveUntil' => $rule->effective_until?->toIso8601String(),
            'isActive' => $rule->is_active,
        ];
    }

    /** @return array<string, mixed> */
    private function auditData(PromotionRule $rule): array
    {
        return [
            'min_rating' => $rule->min_rating,
            'min_games' => $rule->min_games,
            'rating_threshold_enabled' => $rule->ratingThresholdIsConfigured(),
            'qualification_required' => $rule->qualification_required,
            'effective_from' => $rule->effective_from->toIso8601String(),
            'effective_until' => $rule->effective_until?->toIso8601String(),
            'is_active' => $rule->is_active,
        ];
    }
}
