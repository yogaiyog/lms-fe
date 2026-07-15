<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:capacitor-build-rules -->

# Capacitor Android — Build APK

## Prasyarat

Pastikan sudah install:
- Android Studio (Otter 2025.2.1+)
- **Node.js 22+** (wajib untuk Capacitor 8 CLI — `npx cap sync` akan menolak di Node <22)
- **Java JDK 21** (AGP 8.13 + plugin Capacitor 8 compile dengan source/target 21; JDK 17 ditolak)
- Android SDK (API 36+ / compileSdk 36)
- Gradle (bundled via `gradlew`, wrapper 8.14.3)

Set environment variable (sesuaikan path JDK 21 di mesin Anda):
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home
# Jika belum install JDK 21 sistem, Gradle auto-provision via foojay resolver
# (lihat android/settings.gradle) dan cache-nya di:
#   $HOME/.gradle/jdks/eclipse_adoptium-21-aarch64-os_x.2/jdk-21.0.11+10/Contents/Home
```

Untuk `npx cap sync` gunakan Node 22 (mis. via nvm):
```bash
export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh" && nvm use 22
```

## Build APK (lengkap)

```bash
cd /Users/yoga/Developer/Personal/LMS/frontend

# 1. Build Next.js → static export ke out/
BUILD_FOR_CAPACITOR=true npm run build

# 2. Sync file web ke project Android (butuh Node 22!)
PATH="$HOME/.nvm/versions/node/v22.17.0/bin:$PATH" npx cap sync android

# 3. Build APK debug (JDK 21 sebagai JAVA_HOME)
cd android && JAVA_HOME=$HOME/.gradle/jdks/eclipse_adoptium-21-aarch64-os_x.2/jdk-21.0.11+10/Contents/Home ./gradlew assembleDebug

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
