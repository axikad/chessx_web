<?php

namespace App\Http\Controllers;

use App\Enums\PlayerCompetitionStatus;
use App\Enums\PromotionStatus;
use App\Http\Requests\ReviewPromotionRecordRequest;
use App\Models\AuditLog;
use App\Models\PlayerCompetition;
use App\Models\PromotionRecord;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class PromotionRecordController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('promotions.read');

        $status = $request->string('status')->value();
        $search = $request->string('search')->trim()->value();
        $records = PromotionRecord::query()
            ->with([
                'user:id,name,email,username,avatar_path',
                'fromTier:id,code,name',
                'toTier:id,code,name',
                'season:id,name',
                'rule:id,from_tier_id,to_tier_id,min_rating,min_games,qualification_required,rules_json',
            ])
            ->when($status !== '' && $status !== 'all', fn (Builder $query) => $query->where('status', $status))
            ->when($search !== '', fn (Builder $query) => $query->whereHas('user', fn (Builder $userQuery) => $userQuery
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('username', 'like', "%{$search}%")))
            ->latest()
            ->paginate(min(max($request->integer('perPage', 20), 1), 100));

        return response()->json([
            'data' => collect($records->items())->map(fn (PromotionRecord $record): array => $this->data($record)),
            'pagination' => [
                'page' => $records->currentPage(),
                'perPage' => $records->perPage(),
                'total' => $records->total(),
                'totalPages' => $records->lastPage(),
            ],
        ]);
    }

    public function update(ReviewPromotionRecordRequest $request, PromotionRecord $promotionRecord): JsonResponse
    {
        $reviewed = DB::transaction(function () use ($request, $promotionRecord): PromotionRecord {
            $record = PromotionRecord::query()->lockForUpdate()->findOrFail($promotionRecord->getKey());

            abort_if(
                $record->status !== PromotionStatus::Qualified,
                409,
                'Only qualified promotion records can be approved or rejected.',
            );

            $decision = PromotionStatus::from($request->validated('decision'));

            if ($decision === PromotionStatus::Approved) {
                $eligibility = PlayerCompetition::query()
                    ->where('user_id', $record->user_id)
                    ->where('tier_id', $record->to_tier_id)
                    ->where('season_id', $record->season_id)
                    ->lockForUpdate()
                    ->first();

                abort_if(
                    $eligibility?->status === PlayerCompetitionStatus::Suspended,
                    409,
                    'The player is suspended from the target league.',
                );

                if ($eligibility === null) {
                    PlayerCompetition::query()->create([
                        'user_id' => $record->user_id,
                        'tier_id' => $record->to_tier_id,
                        'season_id' => $record->season_id,
                        'status' => PlayerCompetitionStatus::Eligible,
                        'unlocked_at' => now(),
                    ]);
                } elseif ($eligibility->status === PlayerCompetitionStatus::Locked) {
                    $eligibility->update([
                        'status' => PlayerCompetitionStatus::Eligible,
                        'unlocked_at' => $eligibility->unlocked_at ?? now(),
                    ]);
                }
            }

            $record->update([
                'status' => $decision,
                'approved_at' => $decision === PromotionStatus::Approved ? now() : null,
            ]);

            AuditLog::query()->create([
                'actor_user_id' => $request->user()->getKey(),
                'action' => 'promotion.'.$decision->value,
                'entity_type' => $record->getTable(),
                'entity_id' => $record->getKey(),
                'metadata' => [
                    'review_reason' => $request->validated('review_reason'),
                    'previous_status' => PromotionStatus::Qualified->value,
                    'new_status' => $decision->value,
                    'user_id' => $record->user_id,
                    'from_tier_id' => $record->from_tier_id,
                    'to_tier_id' => $record->to_tier_id,
                    'season_id' => $record->season_id,
                ],
                'ip_address' => $request->ip(),
            ]);

            return $record;
        });

        return response()->json([
            'data' => $this->data($reviewed->load(['user', 'fromTier', 'toTier', 'season', 'rule'])),
            'message' => 'Promotion record reviewed successfully.',
        ]);
    }

    /** @return array<string, mixed> */
    private function data(PromotionRecord $record): array
    {
        return [
            'id' => $record->getKey(),
            'player' => [
                'id' => $record->user->getKey(),
                'name' => $record->user->name,
                'email' => $record->user->email,
                'username' => $record->user->username,
                'avatarPath' => $record->user->avatar_path,
            ],
            'fromTier' => ['code' => $record->fromTier->code->value, 'name' => $record->fromTier->name],
            'toTier' => ['code' => $record->toTier->code->value, 'name' => $record->toTier->name],
            'season' => $record->season ? ['id' => $record->season->getKey(), 'name' => $record->season->name] : null,
            'ratingAtQualification' => $record->rating_at_qualification,
            'gamesAtQualification' => $record->games_at_qualification,
            'status' => $record->status->value,
            'qualifiedAt' => $record->qualified_at?->toIso8601String(),
            'approvedAt' => $record->approved_at?->toIso8601String(),
            'createdAt' => $record->created_at->toIso8601String(),
        ];
    }
}
