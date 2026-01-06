import 'dotenv/config';
import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'nomadix_frontend',
  slug: 'nomadix_frontend',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'nomadixfrontend',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,

  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.ddkhoa97.nomadix-frontend',
    infoPlist: {
      MGLMapboxAccessToken: process.env.EXPO_PUBLIC_MAPBOX_TOKEN,
    },
  },

  android: {
    package: 'com.ddkhoa97.nomadix_frontend',
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    permissions: [
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
    ],
    adaptiveIcon: {
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundColor: '#E6F4FE',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
  },

  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },

  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          backgroundColor: '#000000',
        },
      },
    ],
    [
      'expo-build-properties',
      {
        ios: {
          deploymentTarget: '15.1',
        },
      },
    ],
    [
      '@rnmapbox/maps',
      {
        RNMapboxMapsDownloadToken:
          process.env.EXPO_PUBLIC_MAPBOX_TOKEN,
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Show current location on map.',
      },
    ],
    '@react-native-community/datetimepicker',
  ],

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
