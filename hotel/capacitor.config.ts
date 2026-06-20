import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.appworldsa.hotel',
  appName: 'Cloudgate Hotel Demo',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '257440546946-udddj313e9va4r9pk4dqbvqj7ig487la.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
    CapacitorCookies: {
      enabled: true,
    },
  },
};

export default config;
