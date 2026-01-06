import { useUser } from '@/hooks/useUser';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function AccountScreen() {
    const { data: user } = useUser();

    if (!user) return <View style={styles.container} />;

    const joinedDate = new Date(user.joinedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <View style={styles.container}>
            <View style={styles.profileCard}>
                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.email}>{user.email}</Text>

                <View style={styles.badgeContainer}>
                    <Text style={styles.badgeLabel}>Member since</Text>
                    <Text style={styles.badgeDate}>{joinedDate}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        padding: 24,
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 32,
        padding: 40,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 24,
        borderWidth: 4,
        borderColor: '#E0F2FE',
    },
    name: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
    },
    email: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 32,
    },
    badgeContainer: {
        backgroundColor: '#F0FDFA',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: '#CCFBF1',
        alignItems: 'center',
    },
    badgeLabel: {
        fontSize: 12,
        color: '#0D9488',
        textTransform: 'uppercase',
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 4,
    },
    badgeDate: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F766E',
    },
});
