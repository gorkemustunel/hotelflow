import type { CapacitorConfig } from '@capacitor/cli';

// For live-reload testing on a real device: set CAP_DEV_SERVER_URL to your
// computer's LAN address before running `npm run android:sync` /
// `npx cap sync ios`, e.g.:
//   CAP_DEV_SERVER_URL=http://192.168.1.23:5173 npm run android:sync
// Then run `npm run dev -- --host` so the Vite dev server is reachable on
// the network, and code changes show up on the device without rebuilding
// the native shell. Leave it unset for normal builds (bundled dist/).
const devServerUrl = process.env.CAP_DEV_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.hotelflow.app',
  appName: 'HotelFlow',
  webDir: 'dist',
  backgroundColor: '#0a1628',
  android: {
    backgroundColor: '#0a1628',
  },
  ios: {
    backgroundColor: '#0a1628',
  },
  ...(devServerUrl
    ? {
        server: {
          url: devServerUrl,
          cleartext: true,
        },
      }
    : {}),
};

export default config;
