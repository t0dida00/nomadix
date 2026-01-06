import { fetchTravelHistoryFromBackend } from '@/apis/travelApi';
import { VisitRecord } from '@/location/locationTracker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */

export interface LocationRecord {
    id: string;
    city: string;
    country: string;
    continent: string;
    latitude: number;
    longitude: number;
    date: string; // ISO
    isSynced: boolean;
}

export interface TravelLeg {
    from: LocationRecord;
    to: LocationRecord;
    km: number;
    midpoint: {
        latitude: number;
        longitude: number;
    };
}

/* ------------------------------------------------------------------ */
/* Geo utils */
/* ------------------------------------------------------------------ */

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

export function getDistanceFromLatLonInKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

/**
 * Identity rule:
 * Same city + country + continent = same place
 */
function isSamePlace(
    a: Pick<LocationRecord, 'city' | 'country' | 'continent'>,
    b: Pick<LocationRecord, 'city' | 'country' | 'continent'>
) {
    return (
        a.city === b.city &&
        a.country === b.country &&
        a.continent === b.continent
    );
}

function visitToLocationRecord(
    visit: VisitRecord
): LocationRecord {
    return {
        id: `${visit.type}-${visit.city}-${visit.visitedAt}`,
        city: visit.city,
        country: visit.country,
        continent: visit.continent,
        latitude: visit.latitude,
        longitude: visit.longitude,
        date: new Date(visit.visitedAt).toISOString(),
        isSynced: false, // ⭐ frontend only
    };
}

/* ------------------------------------------------------------------ */
/* Query: hydrate from backend */
/* ------------------------------------------------------------------ */

export function useTravelHistory() {
    return useQuery<LocationRecord[]>({
        queryKey: ['travelHistory'],
        queryFn: async () => {
            const backend = await fetchTravelHistoryFromBackend();
            return backend.map((b) => ({
                id: b.id,
                city: b.city,
                country: b.country,
                continent: b.continent,
                latitude: b.latitude,
                longitude: b.longitude,
                date: b.date,
                isSynced: b.isSynced,
            }));
        },
        staleTime: Infinity,
    });
}

/* ------------------------------------------------------------------ */
/* Merge frontend visits into TanStack */
/* ------------------------------------------------------------------ */

export function useMergeVisits() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (visits: VisitRecord[]) => visits,

        onSuccess: (visits) => {
            queryClient.setQueryData<LocationRecord[]>(
                ['travelHistory'],
                (old = []) => {
                    const merged = [...old];

                    visits.forEach((visit) => {
                        const record =
                            visitToLocationRecord(visit);

                        const existingIndex =
                            merged.findIndex((m) =>
                                isSamePlace(m, record)
                            );

                        // Backend record exists → DO NOTHING
                        if (
                            existingIndex !== -1 &&
                            merged[existingIndex].isSynced
                        ) {
                            return;
                        }

                        // Unsynced exists → ignore duplicate
                        if (existingIndex !== -1) {
                            return;
                        }

                        merged.push(record);
                    });

                    return merged.sort((a, b) =>
                        a.date.localeCompare(b.date)
                    );
                }
            );
        },
    });
}

/* ------------------------------------------------------------------ */
/* Derived route data */
/* ------------------------------------------------------------------ */

export function useTravelRoute() {
    const { data: history } = useTravelHistory();
    console.log('data from be:', history);
    if (!history || history.length < 2) {
        return {
            sorted: history ?? [],
            legs: [] as TravelLeg[],
            totalKm: 0,
        };
    }

    const sorted = [...history].sort((a, b) =>
        a.date.localeCompare(b.date)
    );

    let totalKm = 0;

    const legs: TravelLeg[] = sorted
        .slice(0, -1)
        .map((from, i) => {
            const to = sorted[i + 1];

            const km = getDistanceFromLatLonInKm(
                from.latitude,
                from.longitude,
                to.latitude,
                to.longitude
            );

            totalKm += km;

            return {
                from,
                to,
                km: Math.round(km),
                midpoint: {
                    latitude:
                        (from.latitude + to.latitude) / 2,
                    longitude:
                        (from.longitude + to.longitude) / 2,
                },
            };
        });

    return {
        sorted,
        legs,
        totalKm: Math.round(totalKm),
    };
}

/* ------------------------------------------------------------------ */
/* Stats */
/* ------------------------------------------------------------------ */

const EARTH_CIRCUMFERENCE_KM = 40075;

export function useTravelStats() {
    const { sorted, totalKm } = useTravelRoute();

    if (!sorted.length) {
        return {
            cities: 0,
            countries: 0,
            continents: 0,
            kmTraveled: 0,
            earthCircles: 0,
        };
    }

    return {
        cities: new Set(sorted.map((l) => l.city)).size,
        countries: new Set(sorted.map((l) => l.country)).size,
        continents: new Set(sorted.map((l) => l.continent)).size,
        kmTraveled: totalKm,
        earthCircles: +(
            totalKm / EARTH_CIRCUMFERENCE_KM
        ).toFixed(2),
    };
}

/* ------------------------------------------------------------------ */
/* Add location manually (frontend only) */
/* ------------------------------------------------------------------ */

export function useAddLocation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            newLocation: Omit<LocationRecord, 'id' | 'isSynced'>
        ) => {
            // mock create id
            return {
                ...newLocation,
                id: Math.random().toString(36).slice(2, 11),
                isSynced: false, // ⭐ frontend created
            } as LocationRecord;
        },

        onSuccess: (location) => {
            queryClient.setQueryData<LocationRecord[]>(
                ['travelHistory'],
                (old = []) => {
                    // avoid duplicate place
                    const exists = old.some((l) =>
                        isSamePlace(l, location)
                    );

                    if (exists) return old;

                    return [...old, location].sort((a, b) =>
                        a.date.localeCompare(b.date)
                    );
                }
            );
        },
    });
}
