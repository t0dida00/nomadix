export type BackendLocationDTO = {
    id: string;
    city: string;
    country: string;
    continent: string;
    latitude: number;
    longitude: number;
    isSynced: boolean; // ⭐ ALWAYS PRESENT
    date: string;
};

export async function fetchTravelHistoryFromBackend(): Promise<
    BackendLocationDTO[]
> {
    await new Promise((r) => setTimeout(r, 500));

    return [
        {
            id: '1',
            city: 'Paris',
            country: 'France',
            continent: 'Europe',
            latitude: 48.8566,
            longitude: 2.3522,
            isSynced: true,
            date: '2023-01-15',
        },
        {
            id: '2',
            city: 'Tokyo',
            country: 'Japan',
            continent: 'Asia',
            latitude: 35.6762,
            longitude: 139.6503,
            isSynced: true,
            date: '2023-05-20',
        },
        {
            id: '3',
            city: 'New York',
            country: 'USA',
            continent: 'North America',
            latitude: 40.7128,
            longitude: -74.006,
            isSynced: true,
            date: '2024-01-01',
        },
        {
            id: '4',
            city: 'Da Lat',
            country: 'Vietnam',
            continent: 'Asia',
            latitude: 11.9404,
            longitude: 108.4583,
            isSynced: true,
            date: '2024-03-10',
        },
        {
            id: '5',
            city: 'Da Nang',
            country: 'Vietnam',
            continent: 'Asia',
            latitude: 16.0544,
            longitude: 108.2022,
            isSynced: true,
            date: '2024-03-18',
        },
        {
            id: '6',
            city: 'Ha Noi',
            country: 'Vietnam',
            continent: 'Asia',
            latitude: 21.0278,
            longitude: 105.8342,
            isSynced: true,
            date: '2024-03-25',
        },
        {
            id: '7',
            city: 'Ho Chi Minh City',
            country: 'Vietnam',
            continent: 'Asia',
            latitude: 10.8231,
            longitude: 106.6297,
            isSynced: true,
            date: '2024-04-02',
        },
    ];
}
