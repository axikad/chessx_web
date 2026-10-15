import { apiRequest } from './apiClient';

export type CompetitionRegionOption = { id: number; name: string; status?: string; place?: string };
export type CompetitionTierRecord = {
    id: number;
    code?: string;
    name: string;
    scopeType?: string;
    sequenceNumber?: number;
    isActive?: boolean;
    regionCount?: number;
    playerCount?: number;
    regions?: CompetitionRegionOption[];
};
export type SeasonRecord = {
    id: number;
    name: string;
    startsAt: string;
    endsAt: string;
    status: 'scheduled' | 'active' | 'completed' | 'cancelled';
    playerCount: number;
    snapshotCount: number;
};
export type RatingRecord = {
    id: number;
    player: string;
    email: string;
    tierId: number;
    tier: string;
    rating: number;
    provisional: boolean;
    provisionalGamesRemaining: number;
    gamesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    highestRating: number;
    lastGameAt: string | null;
};
export type LeaderboardRecord = {
    id: number;
    season: string;
    seasonId: number;
    tier: string;
    tierId: number;
    region: string;
    regionId: number | null;
    player: string;
    email: string;
    rating: number;
    rank: number;
    gamesPlayed: number;
    calculatedAt: string;
};

export const competitionService = {
    competitions: () => apiRequest<{ data: CompetitionTierRecord[] }>('/management/competitions'),
    seasons: () => apiRequest<{ data: SeasonRecord[] }>('/management/seasons'),
    createSeason: (data: Record<string, unknown>) =>
        apiRequest<{ data: SeasonRecord; message: string }>('/management/seasons', { method: 'POST', body: JSON.stringify(data) }),
    updateSeason: (id: number, data: Record<string, unknown>) =>
        apiRequest<{ data: SeasonRecord; message: string }>(`/management/seasons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteSeason: (id: number) => apiRequest<{ message: string }>(`/management/seasons/${id}`, { method: 'DELETE' }),
    rolloverSeason: (id: number) =>
        apiRequest<{ data: { completed_seasons: number; created_eligibilities: number }; message: string }>(`/management/seasons/${id}/rollover`, { method: 'POST' }),
    ratings: () => apiRequest<{ data: RatingRecord[]; tiers: CompetitionTierRecord[] }>('/management/ratings'),
    updateRating: (id: number, data: { rating: number }) =>
        apiRequest<{ data: RatingRecord; message: string }>(`/management/ratings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    leaderboards: () =>
        apiRequest<{ data: LeaderboardRecord[]; seasons: Pick<SeasonRecord, 'id' | 'name'>[]; tiers: CompetitionTierRecord[] }>('/management/leaderboards'),
    generateLeaderboard: (data: { season_id: number; tier_id: number; region_id: number | null }) =>
        apiRequest<{ data: { created: number; calculatedAt: string }; message: string }>('/management/leaderboards/generate', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};
