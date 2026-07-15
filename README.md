This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Build Android APK (Capacitor)

### Prasyarat

- Android Studio
- Java JDK 17+
- Android SDK (API 34+)
- Gradle (bundled via `gradlew`)

Set environment variables di shell:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
```

### Build APK Debug

```bash
# Set Java 17 (wajib, system default Java 25 tidak kompatibel)
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home

# 1. Build Next.js → static export ke out/
BUILD_FOR_CAPACITOR=true npm run build

# 2. Sync file web ke project Android
npx cap sync android

# 3. Build APK debug
cd android && ./gradlew assembleDebug

# 4. Hasil APK
# android/app/build/outputs/apk/debug/app-debug.apk (~5 MB)
```

### Build APK Release

```bash
# Set Java 17
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home

# 1. Build Next.js → static export ke out/
BUILD_FOR_CAPACITOR=true npm run build

# 2. Sync file web ke project Android
npx cap sync android

# 3. Build APK release (signed + minified)
cd android && ./gradlew assembleRelease

# 4. Hasil APK
# android/app/build/outputs/apk/release/app-release.apk (~2.5 MB)
```

> **Note:** Release APK lebih kecil karena R8/ProGuard minify + hapus debug symbols.

### Install ke device/emulator

```bash
# Debug APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Release APK
adb install android/app/build/outputs/apk/release/app-release.apk

# Atau buka Android Studio → Run langsung
npx cap open android
```

### Update Capacitor

```bash
npm install @capacitor/cli@latest @capacitor/core@latest @capacitor/android@latest
npx cap sync android
```