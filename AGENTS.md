<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:capacitor-build-rules -->

# Capacitor Android — Build APK

## Prasyarat

Pastikan sudah install:
- Android Studio
- Java JDK 17+
- Android SDK (API 34+)
- Gradle (bundled via `gradlew`)

Set `ANDROID_HOME` di shell:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
```

## Build APK (lengkap)

```bash
cd /Users/yoga/LMS/frontend

# 1. Build Next.js → static export ke out/
BUILD_FOR_CAPACITOR=true npm run build

# 2. Sync file web ke project Android
npx cap sync android

# 3. Build APK debug
cd android && ./gradlew assembleDebug

# 4. Hasil APK
# android/app/build/outputs/apk/debug/app-debug.apk
```

## Install ke device/emulator

```bash
# Install APK ke device terhubung
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Atau buka Android Studio → Run langsung
npx cap open android
```

## Catatan Penting

| Perintah | Kegunaan |
|---|---|
| `BUILD_FOR_CAPACITOR=true npm run build` | Build static export ke `out/` (wajib untuk Capacitor) |
| `npx cap sync android` | Copy `out/` ke `android/app/src/main/assets/public/` |
| `./gradlew assembleDebug` | Compile APK |
| `npx cap open android` | Buka project di Android Studio |

## Update Capacitor

```bash
npm install @capacitor/cli@latest @capacitor/core@latest @capacitor/android@latest
npx cap sync android
```

<!-- END:capacitor-build-rules -->
