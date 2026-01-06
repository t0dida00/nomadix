import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTravelStats } from '@/hooks/useTravelData';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AnalysisScreen() {
    const stats = useTravelStats();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.headerTitle}>Travel Analysis</Text>

            <View style={styles.statsGrid}>
                <StatCard label="Cities" value={stats.cities} icon="house.fill" color="#4F46E5" />
                <StatCard label="Countries" value={stats.countries} icon="paperplane.fill" color="#10B981" />
                <StatCard label="Continents" value={stats.continents} icon="paperplane.fill" color="#F59E0B" />
                <StatCard label="Km Gone" value={`${stats.kmTraveled} km`} icon="chart.bar.fill" color="#EC4899" fullWidth />
                <StatCard label="Earth Circles" value={`${stats.earthCircles}x`} icon="chart.bar.fill" color="#8B5CF6" fullWidth />
            </View>
        </ScrollView>
    );
}

function StatCard({ label, value, icon, color, fullWidth }: { label: string; value: string | number; icon: any; color: string; fullWidth?: boolean }) {
    return (
        <View style={[styles.card, fullWidth && styles.cardFull]}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                <IconSymbol name={icon} size={24} color={color} />
            </View>
            <View>
                <Text style={styles.cardValue}>{value}</Text>
                <Text style={styles.cardLabel}>{label}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    contentContainer: {
        padding: 20,
        paddingTop: Platform.OS === 'android' ? 60 : 60,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 24,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '47%', // roughly half - gap
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 140,
    },
    cardFull: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 100,
        justifyContent: 'flex-start',
        gap: 20,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12, // only for vertical layout
    },
    cardValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
    },
    cardLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
});
