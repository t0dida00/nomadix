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
    date: string; // ISO string
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
/* Mock data */
/* ------------------------------------------------------------------ */

const INITIAL_DATA: LocationRecord[] = [
    {
        id: '1',
        city: 'Paris',
        country: 'France',
        continent: 'Europe',
        latitude: 48.8566,
        longitude: 2.3522,
        date: '2023-01-15',
    },
    {
        id: '2',
        city: 'Tokyo',
        country: 'Japan',
        continent: 'Asia',
        latitude: 35.6762,
        longitude: 139.6503,
        date: '2023-05-20',
    },
    {
        id: '3',
        city: 'New York',
        country: 'USA',
        continent: 'North America',
        latitude: 40.7128,
        longitude: -74.006,
        date: '2024-01-01',
    },
    {
        id: '4',
        city: 'Da Lat',
        country: 'Vietnam',
        continent: 'Asia',
        latitude: 11.9404,
        longitude: 108.4583,
        date: '2024-03-10',
    },
    {
        id: '5',
        city: 'Da Nang',
        country: 'Vietnam',
        continent: 'Asia',
        latitude: 16.0544,
        longitude: 108.2022,
        date: '2024-03-18',
    },
    {
        id: '6',
        city: 'Ha Noi',
        country: 'Vietnam',
        continent: 'Asia',
        latitude: 21.0278,
        longitude: 105.8342,
        date: '2024-03-25',
    },
    {
        id: '7',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
        continent: 'Asia',
        latitude: 10.8231,
        longitude: 106.6297,
        date: '2024-04-02',
    },
];

const EARTH_CIRCUMFERENCE_KM = 40075;

/* ------------------------------------------------------------------ */
/* Geo utilities (SINGLE source of truth) */
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
/* Queries */
/* ------------------------------------------------------------------ */

export function useTravelHistory() {
    return useQuery<LocationRecord[]>({
        queryKey: ['travelHistory'],
        queryFn: async () => {
            await new Promise((r) => setTimeout(r, 500));

            return [...INITIAL_DATA].sort((a, b) =>
                a.date.localeCompare(b.date)
            );
        },
        staleTime: Infinity,
    });
}

export function useAddLocation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newLocation: Omit<LocationRecord, 'id'>) => {
            await new Promise((r) => setTimeout(r, 500));
            return {
                ...newLocation,
                id: Math.random().toString(36).slice(2, 11),
            };
        },
        onSuccess: (data) => {
            queryClient.setQueryData<LocationRecord[]>(
                ['travelHistory'],
                (old = []) =>
                    [...old, data].sort((a, b) =>
                        a.date.localeCompare(b.date)
                    )
            );
        },
    });
}

/* ------------------------------------------------------------------ */
/* Derived route data (USED BY MAP & STATS) */
/* ------------------------------------------------------------------ */

export function useTravelRoute() {
    const { data: history } = useTravelHistory();

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

    const legs: TravelLeg[] = sorted.slice(0, -1).map((from, i) => {
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
                latitude: (from.latitude + to.latitude) / 2,
                longitude: (from.longitude + to.longitude) / 2,
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
/* Stats (REUSES route data) */
/* ------------------------------------------------------------------ */

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
    };
}

function isDuplicate(
    history: LocationRecord[],
    record: LocationRecord
) {
    return history.some(
        (h) =>
            h.city === record.city &&
            h.country === record.country &&
            h.continent === record.continent
    );
}

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
                        const record = visitToLocationRecord(visit);

                        if (!isDuplicate(merged, record)) {
                            merged.push(record);
                        }
                    });

                    return merged.sort((a, b) =>
                        a.date.localeCompare(b.date)
                    );
                }
            );
        },
    });
}