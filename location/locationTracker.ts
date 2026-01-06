// location/locationTracker.ts
import {
    STAY_THRESHOLD_MS,
    VISIT_BATCH_LIMIT,
} from '@/constants/location';
export type PlaceType = 'city' | 'country' | 'continent';

export type LocationSnapshot = {
    city: string;
    country: string;
    continent: string;
    latitude: number;
    longitude: number;
    timestamp: number;
};

export type VisitRecord = {
    type: PlaceType;
    city: string;
    country: string;
    continent: string;
    latitude: number;
    longitude: number;
    visitedAt: number;
};



type ActiveStay = {
    [K in PlaceType]?: {
        name: string;
        startedAt: number;
    };
};

class LocationTracker {
    private activeStay: ActiveStay = {};
    private visitBatch: VisitRecord[] = [];

    evaluate(snapshot: LocationSnapshot) {
        this.checkPlace('city', snapshot.city, snapshot);
        this.checkPlace('country', snapshot.country, snapshot);
        this.checkPlace('continent', snapshot.continent, snapshot);
    }

    getBatch() {
        return this.visitBatch;
    }

    clearBatch() {
        this.visitBatch = [];
    }

    private checkPlace(
        type: PlaceType,
        name: string,
        snapshot: LocationSnapshot
    ) {
        const stay = this.activeStay[type];
        const now = snapshot.timestamp;

        if (!stay || stay.name !== name) {
            this.activeStay[type] = {
                name,
                startedAt: now,
            };
            return;
        }

        const duration = now - stay.startedAt;
        if (duration < STAY_THRESHOLD_MS[type]) return;

        const exists = this.visitBatch.some(
            (v) => v.type === type && v[type] === name
        );

        if (exists) return;

        this.visitBatch.push({
            type,
            city: snapshot.city,
            country: snapshot.country,
            continent: snapshot.continent,
            latitude: snapshot.latitude,
            longitude: snapshot.longitude,
            visitedAt: stay.startedAt,
        });

        this.activeStay[type] = undefined;
    }

    shouldFlush() {
        return this.visitBatch.length >= VISIT_BATCH_LIMIT;
    }
}

export const locationTracker = new LocationTracker();
