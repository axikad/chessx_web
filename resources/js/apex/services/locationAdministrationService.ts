import { apiRequest } from './apiClient';

export type GeographyCountry = {
    id: number;
    iso2: string;
    iso3: string;
    name: string;
    geonames_id: number | null;
    status: 'active' | 'inactive';
    states_count: number;
};

export type GeographyState = {
    id: number;
    country_id: number;
    name: string;
    code: string | null;
    geonames_id: number | null;
    geonames_code: string | null;
    status: 'active' | 'inactive';
    cities_count: number;
};

export type GeographyCity = {
    id: number;
    state_id: number;
    name: string;
    timezone: string | null;
    geonames_id: number | null;
    district: string | null;
    latitude: string | null;
    longitude: string | null;
    status: 'active' | 'inactive';
    players_count: number;
};

type LocationCity = {
    id: number;
    name: string;
    state?: { id: number; name: string } | null;
};

export type LocationChangeRequestRecord = {
    id: number;
    verification_method: string;
    status: 'pending' | 'approved' | 'rejected';
    requested_at: string;
    reviewed_at: string | null;
    reason: string | null;
    user: { id: number; name: string; email: string };
    old_city: LocationCity;
    new_city: LocationCity;
    reviewer: { id: number; name: string } | null;
};

export type LocationChangeRequestPage = {
    data: LocationChangeRequestRecord[];
    pagination: {
        page: number;
        perPage: number;
        total: number;
        totalPages: number;
    };
};

export const locationAdministrationService = {
    countries: () => apiRequest<{ data: GeographyCountry[] }>('/management/geography/countries'),

    states: (countryId: number) =>
        apiRequest<{ data: GeographyState[] }>(`/management/geography/states?country_id=${countryId}`),

    cities: (stateId: number) =>
        apiRequest<{ data: GeographyCity[] }>(`/management/geography/cities?state_id=${stateId}`),

    createCountry: (data: Record<string, unknown>) =>
        apiRequest<{ data: GeographyCountry; message: string }>('/management/geography/countries', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    updateCountry: (id: number, data: Record<string, unknown>) =>
        apiRequest<{ data: GeographyCountry; message: string }>(`/management/geography/countries/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    deleteCountry: (id: number) =>
        apiRequest<{ message: string }>(`/management/geography/countries/${id}`, { method: 'DELETE' }),
    createState: (data: Record<string, unknown>) =>
        apiRequest<{ data: GeographyState; message: string }>('/management/geography/states', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    updateState: (id: number, data: Record<string, unknown>) =>
        apiRequest<{ data: GeographyState; message: string }>(`/management/geography/states/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    deleteState: (id: number) =>
        apiRequest<{ message: string }>(`/management/geography/states/${id}`, { method: 'DELETE' }),
    createCity: (data: Record<string, unknown>) =>
        apiRequest<{ data: GeographyCity; message: string }>('/management/geography/cities', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    updateCity: (id: number, data: Record<string, unknown>) =>
        apiRequest<{ data: GeographyCity; message: string }>(`/management/geography/cities/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    deleteCity: (id: number) =>
        apiRequest<{ message: string }>(`/management/geography/cities/${id}`, { method: 'DELETE' }),

    changeRequests: (status: string, page: number) => {
        const query = new URLSearchParams({ page: String(page), perPage: '20' });
        if (status !== 'all') query.set('status', status);

        return apiRequest<LocationChangeRequestPage>(`/management/location-change-requests?${query.toString()}`);
    },

    review: (requestId: number, decision: 'approved' | 'rejected', reviewReason: string) =>
        apiRequest<{ data: LocationChangeRequestRecord; message: string }>(
            `/management/location-change-requests/${requestId}`,
            {
                method: 'PATCH',
                body: JSON.stringify({ decision, review_reason: reviewReason }),
            },
        ),
};
