const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') })

module.exports = {
  expo: {
    name: 'Ring Bearer',
    slug: 'ring-bearer',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'ring-bearer',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#f43f5e',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.ringbearer.app',
      infoPlist: {
        NSMicrophoneUsageDescription: 'Ring Bearer uses the microphone to record your voice intro.',
        NSPhotoLibraryUsageDescription: 'Ring Bearer needs access to your photo library to add profile photos.',
        NSCameraUsageDescription: 'Ring Bearer uses the camera to take profile photos.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#f43f5e',
      },
      package: 'com.ringbearer.app',
      permissions: [
        'RECORD_AUDIO',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'CAMERA',
      ],
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-secure-store',
      ['expo-av', { microphonePermission: 'Ring Bearer needs mic access for voice intros.' }],
      [
        'expo-image-picker',
        {
          photosPermission: 'Ring Bearer needs photo access for your profile pictures.',
          cameraPermission: 'Ring Bearer needs camera access to take profile photos.',
        },
      ],
    ],
    updates: {
      enabled: false,
    },
    experiments: {
      typedRoutes: true,
    },
    extra: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
}
