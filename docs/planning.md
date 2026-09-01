# Rencana Pengembangan & Roadmap Fitur (Planning)

Dokumen ini mencatat rencana fitur (*feature planning*), spesifikasi teknis, dan rancangan implementasi untuk perbaikan dan pengembangan sistem Tutor Dashboard di Scratch GUI.

---

## 📋 Feature Plan: Otomatisasi Pergeseran Jadwal Topik (Shift / Repeat Topic on Incomplete Class)

### 1. Latar Belakang & Problem Statement
Ketika siswa belum dapat menyelesaikan tugas/proyek coding pada pertemuan tertentu (misal sesi ke-3 dari 12 sesi), materi tersebut perlu diulang pada pertemuan berikutnya (sesi ke-4). Saat ini, tutor harus mengubah topik jadwal ke-4, ke-5, hingga ke-12 satu per satu secara manual. Hal ini memakan waktu dan rentan terjadi kesalahan pengurutan.

### 2. Tujuan Fitur
Menyediakan tombol aksi pada setiap baris jadwal di tab **Kelas** (`tutor-classes-segment.tsx`) untuk secara otomatis:
1. Menetapkan topik sesi berikutnya sama dengan topik sesi saat ini (mengulang materi yang belum tuntas).
2. Menggeser seluruh topik jadwal sesudahnya secara berantai (*cascade shift*).

---

### 3. Simulasi & Contoh Pergeseran
Contoh kelas dengan 12 jadwal berurutan:
* **Kondisi Awal**:
  * Sesi 1 $\rightarrow$ Topik 1
  * Sesi 2 $\rightarrow$ Topik 2
  * Sesi 3 $\rightarrow$ Topik 3 *(Siswa belum selesai di sesi ini)*
  * Sesi 4 $\rightarrow$ Topik 4
  * Sesi 5 $\rightarrow$ Topik 5
  * Sesi 6 $\rightarrow$ Topik 6
  * ...
  * Sesi 12 $\rightarrow$ Topik 12

* **Hasil Setelah Tombol "Ulang Topik / Geser Jadwal" Diklik di Sesi 3**:
  * Sesi 1 $\rightarrow$ Topik 1 *(Tetap)*
  * Sesi 2 $\rightarrow$ Topik 2 *(Tetap)*
  * Sesi 3 $\rightarrow$ Topik 3 *(Tetap)*
  * **Sesi 4 $\rightarrow$ Topik 3** 👈 *(Otomatis mengulang topik sesi 3)*
  * **Sesi 5 $\rightarrow$ Topik 4** 👈 *(Tergeser)*
  * **Sesi 6 $\rightarrow$ Topik 5** 👈 *(Tergeser)*
  * ...
  * **Sesi 12 $\rightarrow$ Topik 11** 👈 *(Tergeser)*

---

### 4. Rincian Teknis & Arsitektur Implementasi

#### A. Komponen UI ([`frontend/app/dashboard/tutor/tutor-classes-segment.tsx`](file:///Users/yoga/Developer/Personal/Scratch/scratch-gui/frontend/app/dashboard/tutor/tutor-classes-segment.tsx))
* Tambahkan tombol aksi di baris jadwal (misal: tombol dengan ikon `RotateCcw` / `History` berlabel *"Ulangi Topik ke Pertemuan Berikutnya"* atau tombol dropdown opsi aksi).
* Tombol ini aktif jika masih ada jadwal berikutnya di kelas tersebut yang belum berjalan (`upcoming schedules`).

#### B. Modal Konfirmasi / Preview Perubahan
* Sebelum data dikirim ke backend, tampilkan dialog ringkasan:
  * Menampilkan daftar jadwal mana saja yang akan berubah topiknya.
  * Tombol **"Batal"** dan **"Konfirmasi Geser Jadwal"**.

#### C. Logika Pembaruan Data ([`frontend/app/dashboard/tutor/tutor-content.tsx`](file:///Users/yoga/Developer/Personal/Scratch/scratch-gui/frontend/app/dashboard/tutor/tutor-content.tsx))
1. Ambil daftar seluruh jadwal pada kelas tersebut, diurutkan ascending berdasarkan `date` (`cls.schedules.sort(...)`).
2. Temukan indeks jadwal yang dipilih (`targetIndex`).
3. Dapatkan daftar jadwal yang berada setelah `targetIndex` (`futureSchedules = sortedSchedules.slice(targetIndex + 1)`).
4. Buat mapping urutan topik baru:
   * `futureSchedules[0]` akan menggunakan `topicId` dan `topic` dari `sortedSchedules[targetIndex]`.
   * `futureSchedules[1]` akan menggunakan topik lama dari `futureSchedules[0]`.
   * `futureSchedules[k]` akan menggunakan topik lama dari `futureSchedules[k-1]`.
5. Kirim pembaruan ke API secara paralel atau batch:
   ```typescript
   await Promise.all(
     updates.map(({ scheduleId, topicId, topic }) =>
       api.schedules.update(scheduleId, { topicId, topic })
     )
   );
   ```
6. Invalidate query cache (`queryClient.invalidateQueries({ queryKey: ["tutor-schedules"] })`) agar UI langsung ter-render dengan urutan topik terbaru.

---

### 5. Status Keamanan & Validasi
* **Database Compatibility**: Schema model `Schedule` di database tidak memiliki *unique constraint* pada `topicId`, sehingga duplikasi topik pada beberapa jadwal 100% aman.
* **Student Report**: Modul laporan siswa sudah memiliki logika deduplikasi topik (`!topics.includes(topic)`), sehingga nama topik yang diulang tidak akan tercatat ganda pada laporan akhir.

---

### 6. Rencana Checklist Implementasi
- [ ] Tambahkan prop callback `onShiftSchedules` di `tutor-classes-segment.tsx`.
- [ ] Buat tombol aksi *"Ulang Topik ke Pertemuan Depan"* di setiap baris jadwal.
- [ ] Buat handler `handleShiftSchedules` di `tutor-content.tsx` beserta modal konfirmasi.
- [ ] Uji coba pergeseran topik pada kelas dengan jumlah jadwal dinamis.
