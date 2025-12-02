export default {
  expo: {
    name: 'ChainSync AI',
    slug: 'chainsync-ai',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'chainsync',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.chainsync.ai',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      package: 'com.chainsync.ai',
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      // Allow cleartext (HTTP) traffic for local development
      usesCleartextTraffic: true,
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
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      // API Configuration - can be overridden by environment variables
      // Use local IP address for mobile/web testing (192.168.68.110 is your Mac's local IP)
      // Change this to your computer's IP if different
      apiBaseUrl: process.env.API_BASE_URL || 'http://192.168.68.110:8000',
      apiTimeout: process.env.API_TIMEOUT || '30000',
      appEnv: process.env.APP_ENV || 'development',
    },
  },
};
