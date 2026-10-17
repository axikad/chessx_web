import { apiRequest } from './apiClient';

export interface PlayerPlace {
    cityId: number;
    city: string;
    stateId: number | null;
    state: string | null;
    countryId: number | null;
    country: string | null;
    countryIso2: string | null;
}

export interface LocationCandidate extends PlayerPlace {
    distanceKm: number;
}

export interface PlayerLocationSnapshot {
    current: (PlayerPlace & {
        verificationMethod: string;
        verifiedAt: string | null;
    }) | null;
}

interface LocationResolution {
    resolutionToken: string;
    expiresAt: string;
    candidates: LocationCandidate[];
}

export const playerLocationService = {
    snapshot: () => apiRequest<{ data: PlayerLocationSnapshot }>('/player/location'),
    resolve: (latitude: number, longitude: number) =>
        apiRequest<{ data: LocationResolution; message: string }>('/player/location/resolve', {
            method: 'POST',
            body: JSON.stringify({ permission: 'granted', latitude, longitude }),
        }),
    confirm: (resolutionToken: string, cityId: number) =>
        apiRequest<{ data: PlayerPlace; message: string }>('/player/location/confirm', {
            method: 'POST',
            body: JSON.stringify({ resolution_token: resolutionToken, city_id: cityId, accepted: true }),
        }),
};
