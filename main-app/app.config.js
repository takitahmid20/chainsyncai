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
      versionCode: 1,
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      // Allow cleartext (HTTP) traffic for local development
      usesCleartextTraffic: true,
      permissions: [
        'INTERNET',
        'ACCESS_NETWORK_STATE'
      ],
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
      // EAS Project ID
      eas: {
        projectId: "81a138b3-59bc-4b28-9e68-2fd3740450a0"
      },
      // API Configuration - can be overridden by environment variables
      // For production APK: Set APP_ENV=production to use fly.io backend
      // For local development: Use your computer's local IP
      apiBaseUrl: process.env.API_BASE_URL || 
        (process.env.APP_ENV === 'production' 
          ? 'https://chainsync-backend-winter-sound-6706.fly.dev' 
          : 'http://172.16.30.89:8000'),
      apiTimeout: process.env.API_TIMEOUT || '30000',
      appEnv: process.env.APP_ENV || 'development',
    },
  },
};
