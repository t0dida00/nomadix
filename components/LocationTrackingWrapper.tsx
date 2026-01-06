import { useLocationTracking } from '@/location/useLocationTracking';

export default function LocationTrackingWrapper() {
    useLocationTracking();
    return null;
}
