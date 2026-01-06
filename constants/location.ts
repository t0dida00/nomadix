import { PlaceType } from '@/location/locationTracker';

const DEV = __DEV__;

/**
 * Time between GPS polls
 */
export const LOCATION_POLL_INTERVAL_MS = DEV
    ? 30 * 1000        // 30s (dev)
    : 10 * 60 * 1000;  // 10 min (prod)

/**
 * Promotion thresholds
 */
export const STAY_THRESHOLD_MS: Record<PlaceType, number> = {
    city: DEV
        ? 30 * 1000        // 30s
        : 3 * 60 * 60 * 1000,

    country: DEV
        ? 2 * 60 * 1000    // 2 min
        : 12 * 60 * 60 * 1000,

    continent: DEV
        ? 5 * 60 * 1000    // 5 min
        : 24 * 60 * 60 * 1000,
};

/**
 * How many visit records before flush
 */
export const VISIT_BATCH_LIMIT = DEV ? 1 : 10;
