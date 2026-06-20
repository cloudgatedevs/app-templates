import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cloudgate.medical',
  appName: 'Cloudgate Medical Demo',
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
