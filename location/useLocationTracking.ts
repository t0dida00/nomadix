// hooks/useLocationTracking.ts

import { useMergeVisits } from '@/hooks/useTravelData';
import { getCurrentLocation } from '@/location/locationService';
import { locationTracker } from '@/location/locationTracker';
// import { sendVisitBatch } from '@/location/visitApi';
import {
    LOCATION_POLL_INTERVAL_MS,
} from '@/constants/location';
import { useEffect, useRef } from 'react';

const INTERVAL = LOCATION_POLL_INTERVAL_MS;

export function useLocationTracking() {
    const timer = useRef<number | null>(null);
    const mergeVisits = useMergeVisits();

    useEffect(() => {
        let mounted = true;
        const tick = async () => {
            const snapshot = await getCurrentLocation();
            if (!snapshot) return;
            locationTracker.evaluate(snapshot);
            console.log('Evaluated location snapshot:', locationTracker);
            if (locationTracker.shouldFlush()) {
                const batch = locationTracker.getBatch();
                // await sendVisitBatch(batch);
                // locationTracker.clearBatch();

                if (batch.length > 0 && mounted) {
                    mergeVisits.mutate(batch);
                    locationTracker.clearBatch();
                }
            }
        };

        tick();

        timer.current = setInterval(tick, INTERVAL);

        return () => {
            if (timer.current) clearInterval(timer.current);
        };
    }, []);
}
