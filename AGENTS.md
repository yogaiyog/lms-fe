<!-- BEGIN:graphify-rules -->

# Graphify — Wajib Pakai Sebelum Baca Kode (Hemat Token)

Sebelum membaca file untuk memahami kode, cek graph dulu:

```bash
if [ -f graphify-out/graph.json ]; then
    graphify query "<pertanyaan tentang kode>"
fi
```

## Cara pakai

```bash
# Query arsitektur (BFS — broad context)
graphify query "bagaimana alur authentication?"
graphify query "siapa aja yang import api?"

# Trace path spesifik (DFS)
graphify query "dari dashboard ke API" --dfs

# Cari jalur antar konsep
graphify path "Parent Dashboard" "Student Dashboard"

# Penjelasan node tertentu
graphify explain "getStoredSession"
```

## Efek hemat token

Ganti `graphify query` ini:
- ❌ Baca 20 file `.tsx` satu per satu → **ribuan token**
- ✅ `graphify query "siapa import getStoredSession?"` → **puluhan token**

## Save query ke graph (memory) — biar agent berikutnya makin pintar

Setiap query yang menghasilkan insight arsitektur, **wajib di-save**:

```bash
# Template
graphify query "pertanyaan" 2>&1

$(cat graphify-out/.graphify_python) -m graphify save-result \
  --question "Pertanyaan dalam Bahasa Indonesia" \
  --answer "Jawaban dalam Bahasa Indonesia (jelas, struktural, sebut file path)" \
  --type query \
  --outcome useful \
  --nodes Node1 Node2 Node3

# Lalu refresh
$(cat graphify-out/.graphify_python) -m graphify reflect --if-stale
```

**Kriteria `--outcome`:**
| Outcome | Kapan pakai | Efek ke graph |
|---|---|---|
| `useful` | Jawaban akurat, node tepat, insight arsitektur | Jadi *preferred source* — agent lain mulai dari sini |
| `dead_end` | Query gak nemu jawaban relevan | Agent skip query mirip ini di masa depan |
| `corrected` | Jawaban sebelumnya salah | Timpa dengan `--correction "jawaban benar"` |

**Aturan cara query biar hasilnya useful untuk memory:**

1. **Query spesifik, bukan random** — jangan tanya `"apa aja yang ada"`, tanya `"bagaimana alur auth?"` atau `"siapa import api?"`
2. **Jawaban harus struktural** — sebut nama file, community, edge type. Jangan cuma "api itu API layer"
3. **`--nodes` diisi node yang benar-benar relevan** — bukan semua node yang muncul
4. **Kalau ragu, skip save** — lebih baik gak di-save daripada di-save dengan `useful` tapi jawaban ngawur

**Contoh dari sesi ini yang sudah di-save:**
```
"Apa peran api (lib/api.ts) sebagai god node 37 edges?"
"Bagaimana alur Capacitor Android build pipeline?"
```

## Update graph jika kode berubah

```bash
cd /Users/yoga/Developer/Personal/Scratch/scratch-gui/frontend
graphify extract --update
graphify export html
```

## Urutan kerja

1. **Cek graph dulu** — `graphify query` sebelum baca file
2. Planning
3. Implementasi
4. **Update graph** — `graphify extract --update` (jika ada perubahan kode)
5. **Save query useful** — `graphify query → save-result --outcome useful`
6. TypeScript check
7. Selesai

<!-- END:graphify-rules -->

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
