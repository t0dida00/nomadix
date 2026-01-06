// location/locationService.ts

import { getContinentByIso } from '@/helpers/getContinentByIso';
import * as Location from 'expo-location';
import { LocationSnapshot } from './locationTracker';

export async function getCurrentLocation(): Promise<LocationSnapshot | null> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const position = await Location.getCurrentPositionAsync({});
    const [address] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
    });

    if (!address) return null;

    const continent = getContinentByIso(
        address.isoCountryCode
    );

    if (!continent) return null;

    return {
        city: address.city || 'Unknown',
        country: address.country || 'Unknown',
        continent,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: Date.now(),
    };
}
