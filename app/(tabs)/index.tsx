import { Ionicons } from '@expo/vector-icons';
import Mapbox from '@rnmapbox/maps';
import {
  Feature,
  FeatureCollection,
  LineString,
  Point,
} from 'geojson';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTravelRoute } from '@/hooks/useTravelData';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN!);

const PANEL_HEIGHT = 120;

export default function HomeScreen() {
  const cameraRef = useRef<Mapbox.Camera>(null);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const [searchQuery, setSearchQuery] = useState('');
  const [followUser, setFollowUser] = useState(true);
  const [showRoute, setShowRoute] = useState(true);
  const [showDistances, setShowDistances] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { sorted, legs } = useTravelRoute();

  /* ---------------- GeoJSON ---------------- */

  const flightLineGeoJSON: Feature<LineString> | null =
    sorted.length > 1
      ? {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: sorted.map((l) => [
            l.longitude,
            l.latitude,
          ]),
        },
      }
      : null;

  const distanceLabelsGeoJSON: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: legs.map((leg) => ({
      type: 'Feature',
      properties: { label: `${leg.km} km` },
      geometry: {
        type: 'Point',
        coordinates: [
          leg.midpoint.longitude,
          leg.midpoint.latitude,
        ],
      },
    })),
  };

  const markersGeoJSON: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: sorted.map((loc) => ({
      type: 'Feature',
      properties: { id: loc.id },
      geometry: {
        type: 'Point',
        coordinates: [loc.longitude, loc.latitude],
      },
    })),
  };

  /* ---------------- Filters logic ---------------- */

  const toggleFilters = () => {
    const next = !filtersOpen;
    setFiltersOpen(next);

    Animated.timing(slideAnim, {
      toValue: next ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const toggleRoute = () => {
    setShowRoute((prev) => {
      if (prev) setShowDistances(false);
      return !prev;
    });
  };

  const toggleDistances = () => {
    if (!showRoute) return;
    setShowDistances((prev) => !prev);
  };

  /* ---------------- Animation values ---------------- */

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [PANEL_HEIGHT + 20, 0],
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        scaleBarEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <Mapbox.Images
          images={{
            marker: require('@/assets/images/favicon.png'),
          }}
        />

        <Mapbox.Camera
          ref={cameraRef}
          zoomLevel={1.5}
          followUserLocation={followUser}
          followZoomLevel={4}
          minZoomLevel={0.9}
          maxZoomLevel={18}
          onUserTrackingModeChange={(e) => {
            if (!e.nativeEvent.payload.followUserLocation) {
              setFollowUser(false);
            }
          }}
        />

        <Mapbox.UserLocation visible />

        {showRoute && flightLineGeoJSON && (
          <Mapbox.ShapeSource
            id="flightLineSource"
            shape={flightLineGeoJSON}
          >
            <Mapbox.LineLayer
              id="flightLineLayer"
              style={{
                lineColor: '#4F46E5',
                lineWidth: 2,
                lineDasharray: [3, 3],
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </Mapbox.ShapeSource>
        )}

        {showRoute && showDistances && (
          <Mapbox.ShapeSource
            id="distanceLabelSource"
            shape={distanceLabelsGeoJSON}
          >
            <Mapbox.SymbolLayer
              id="distanceLabelLayer"
              style={{
                textField: ['get', 'label'],
                textSize: 12,
                textColor: '#111827',
                textHaloColor: '#FFFFFF',
                textHaloWidth: 2,
              }}
            />
          </Mapbox.ShapeSource>
        )}

        <Mapbox.ShapeSource
          id="markersSource"
          shape={markersGeoJSON}
          cluster
          clusterRadius={20}
          clusterMaxZoomLevel={14}
        >
          <Mapbox.CircleLayer
            id="clusterCircle"
            filter={['has', 'point_count']}
            style={{
              circleColor: '#4F46E5',
              circleRadius: [
                'step',
                ['get', 'point_count'],
                18,
                5,
                22,
                10,
                26,
              ],
            }}
          />

          <Mapbox.SymbolLayer
            id="clusterCount"
            filter={['has', 'point_count']}
            style={{
              textField: ['get', 'point_count_abbreviated'],
              textSize: 12,
              textColor: '#fff',
            }}
          />

          <Mapbox.SymbolLayer
            id="singlePointIcon"
            filter={['!', ['has', 'point_count']]}
            style={{
              iconImage: 'marker',
              iconSize: 0.6,
              iconAllowOverlap: true,
            }}
          />
        </Mapbox.ShapeSource>
      </Mapbox.MapView>

      {/* Search */}
      <SafeAreaView style={styles.overlay}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </SafeAreaView>

      {/* FILTER PANEL */}
      <Animated.View
        pointerEvents={filtersOpen ? 'auto' : 'none'}
        style={[
          styles.filterPanel,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.filterButton,
            showRoute && styles.filterButtonActive,
          ]}
          onPress={toggleRoute}
        >
          <Ionicons
            name="git-branch"
            size={16}
            color={showRoute ? '#fff' : '#374151'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            showRoute &&
            showDistances &&
            styles.filterButtonActive,
            !showRoute && styles.filterButtonDisabled,
          ]}
          onPress={toggleDistances}
          disabled={!showRoute}
        >
          <Ionicons
            name="swap-horizontal"
            size={16}
            color={
              showRoute
                ? showDistances
                  ? '#fff'
                  : '#374151'
                : '#9CA3AF'
            }
          />
        </TouchableOpacity>
      </Animated.View>

      {/* FILTER TOGGLE */}
      <TouchableOpacity
        style={styles.filterToggle}
        onPress={toggleFilters}
      >
        <Ionicons
          name={filtersOpen ? 'close' : 'options'}
          size={22}
          color="#000"
        />
      </TouchableOpacity>

      {/* RECENTER */}
      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => setFollowUser(true)}
      >
        <Ionicons
          name="locate"
          size={22}
          color={followUser ? '#007AFF' : '#000'}
        />
      </TouchableOpacity>
    </View>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: Platform.OS === 'android' ? 40 : 10,
  },

  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
  },

  filterToggle: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 28,
  },

  filterPanel: {
    position: 'absolute',
    bottom: 150,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
  },

  filterButton: {
    padding: 10,
    borderRadius: 16,
    marginVertical: 4,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },

  filterButtonActive: {
    backgroundColor: '#4F46E5',
  },

  filterButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },

  resetButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 28,
  },
});
