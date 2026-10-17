import { apiRequest } from './apiClient';

export type PromotionTierSummary = {
    id?: number;
    code: string;
    name: string;
};

export type PromotionRuleRecord = {
    id: number;
    fromTier: PromotionTierSummary;
    toTier: PromotionTierSummary;
    minRating: number;
    minGames: number;
    ratingThresholdEnabled: boolean;
    qualificationRequired: boolean;
    effectiveFrom: string;
    effectiveUntil: string | null;
    isActive: boolean;
};

export type PromotionRecordStatus = 'pending' | 'qualified' | 'approved' | 'rejected';

export type PromotionRecord = {
    id: number;
    player: {
        id: number;
        name: string;
        email: string;
        username: string;
        avatarPath: string | null;
    };
    fromTier: PromotionTierSummary;
    toTier: PromotionTierSummary;
    season: { id: number; name: string } | null;
    ratingAtQualification: number;
    gamesAtQualification: number;
    status: PromotionRecordStatus;
    qualifiedAt: string | null;
    approvedAt: string | null;
    createdAt: string;
};

export type PromotionRulePayload = {
    min_rating: number;
    min_games: number;
    rating_threshold_enabled: boolean;
    qualification_required: boolean;
    effective_from: string;
    effective_until: string | null;
    is_active: boolean;
};

export const promotionService = {
    rules: () => apiRequest<{ data: PromotionRuleRecord[] }>('/management/promotion-rules'),
    updateRule: (id: number, data: PromotionRulePayload) =>
        apiRequest<{ data: PromotionRuleRecord; message: string }>(`/management/promotion-rules/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),
    records: (status: string, page: number) =>
        apiRequest<{
            data: PromotionRecord[];
            pagination: { page: number; perPage: number; total: number; totalPages: number };
        }>(`/management/promotion-records?status=${encodeURIComponent(status)}&page=${page}&perPage=20`),
    review: (id: number, decision: 'approved' | 'rejected', reviewReason: string) =>
        apiRequest<{ data: PromotionRecord; message: string }>(`/management/promotion-records/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ decision, review_reason: reviewReason }),
        }),
};
