#!/bin/bash
# Build Android APK without Expo

echo "🔧 Building APK using React Native CLI..."
echo ""

# Step 1: Navigate to android directory
cd android

# Step 2: Clean previous builds
echo "Cleaning previous builds..."
./gradlew clean

# Step 3: Build release APK
echo "Building release APK..."
./gradlew assembleRelease

# Step 4: Show APK location
echo ""
echo "✅ APK built successfully!"
echo ""
echo "📦 APK Location:"
echo "   android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "To install on device:"
echo "   adb install android/app/build/outputs/apk/release/app-release.apk"
