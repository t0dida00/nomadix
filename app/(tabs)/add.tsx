import { IconSymbol } from '@/components/ui/icon-symbol';
import { countryToContinent } from '@/constants/countries';
import { useAddLocation } from '@/hooks/useTravelData';
import RNDateTimePicker, {
    DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type LocationForm = {
    city: string;
    country: string;
    continent: string;
    latitude: number | null;
    longitude: number | null;
    date: Date;
};

export default function AddScreen() {
    const [form, setForm] = useState<LocationForm>({
        city: '',
        country: '',
        continent: '',
        latitude: null,
        longitude: null,
        date: new Date(),
    });

    const [loading, setLoading] = useState(false);

    const addLocationMutation = useAddLocation();

    const updateForm = <K extends keyof LocationForm>(
        key: K,
        value: LocationForm[K]
    ) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const onChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') return;
        if (selectedDate) updateForm('date', selectedDate);
    };

    const handleDetectLocation = async () => {
        setLoading(true);
        try {
            const { status } =
                await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission denied',
                    'Location permission is required'
                );
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            const [address] = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
            });

            if (address) {
                const isoCode = address.isoCountryCode;

                updateForm('city', address.city || address.region || '');
                updateForm('country', address.country || '');
                updateForm(
                    'continent',
                    isoCode && isoCode in countryToContinent
                        ? countryToContinent[
                        isoCode as keyof typeof countryToContinent
                        ]
                        : ''
                );
            }

            updateForm('latitude', latitude);
            updateForm('longitude', longitude);
            updateForm('date', new Date());
        } catch {
            Alert.alert('Error', 'Could not fetch location');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        const {
            city,
            country,
            continent,
            latitude,
            longitude,
            date,
        } = form;
        if (!city || !country || !continent || !date) {
            Alert.alert(
                'Validation',
                'Please enter City, Country, Continent and Date'
            );
            return;
        }

        addLocationMutation.mutate(
            {
                city,
                country,
                continent,
                latitude: latitude ?? 0,
                longitude: longitude ?? 0,
                date: date.toISOString(),
            },
            {
                onSuccess: () => {
                    Alert.alert('Success', 'Location added!');
                    setForm({
                        city: '',
                        country: '',
                        continent: '',
                        latitude: null,
                        longitude: null,
                        date: new Date(),
                    });
                },
            }
        );
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
        >
            <Text style={styles.headerTitle}>Add Destination</Text>

            <TouchableOpacity
                style={styles.detectButton}
                onPress={handleDetectLocation}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <IconSymbol
                            name="plus.circle.fill"
                            size={24}
                            color="#fff"
                            style={{ marginRight: 8 }}
                        />
                        <Text style={styles.detectButtonText}>
                            Detect your current location
                        </Text>
                    </>
                )}
            </TouchableOpacity>

            <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.line} />
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>City</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Paris"
                    value={form.city}
                    onChangeText={v => updateForm('city', v)}
                />

                <Text style={styles.label}>Country</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. France"
                    value={form.country}
                    onChangeText={v => updateForm('country', v)}
                />

                <Text style={styles.label}>Continent</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Europe"
                    value={form.continent}
                    onChangeText={v => updateForm('continent', v)}
                />

                <Text style={styles.label}>Date</Text>
                <RNDateTimePicker
                    value={form.date}
                    mode="date"
                    display="default"
                    locale="en-GB"
                    onChange={onChange}
                    style={styles.datePicker}
                />

                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        addLocationMutation.isPending &&
                        styles.disabledButton,
                    ]}
                    onPress={handleSave}
                    disabled={addLocationMutation.isPending}
                >
                    <Text style={styles.saveButtonText}>
                        {addLocationMutation.isPending
                            ? 'Saving...'
                            : 'Save Location'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    content: { padding: 24, paddingTop: 80 },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 32,
        textAlign: 'center',
    },
    detectButton: {
        backgroundColor: '#4F46E5',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
    },
    detectButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 32,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#D1D5DB',
    },
    orText: {
        marginHorizontal: 16,
        color: '#9CA3AF',
    },
    form: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 24,
    },
    label: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        justifyContent: 'center',
    },
    saveButton: {
        backgroundColor: '#10B981',
        marginTop: 32,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    disabledButton: { opacity: 0.7 },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    datePicker: {
        width: '100%',
        height: 20,
        marginHorizontal: 0
    },

    dateText: {
        fontSize: 16,
        color: '#1F2937',
    },
});
