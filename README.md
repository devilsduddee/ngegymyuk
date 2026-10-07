# 💪 ngegymYuk

**ngegymYuk** adalah aplikasi mobile fitness tracker modern untuk platform Android dan iOS yang dirancang dengan orientasi kecepatan performa gym, desain premium ala *athletic dashboard*, dan sinkronisasi cloud real-time. Aplikasi ini mengatasi masalah pencatatan angkatan manual dengan menghadirkan pencatatan set yang super cepat, deteksi otomatis Personal Record (PR), serta analitik kebugaran tingkat lanjut.

---

## 🎯 Fitur Utama

- **Workout Planning & Templates**: Rancang rutinitas latihan Anda sendiri (seperti *Push Day*, *Pull Day*, atau *Leg Day*). Konfigurasi target set, repetisi, dan waktu istirahat antar gerakan.
- **Smart Exercise Library**: Pustaka berisi lebih dari 50 gerakan latihan populer, lengkap dengan pencarian real-time dan filter berdasarkan kelompok otot serta peralatan yang digunakan.
- **Lightning-Fast Workout Session**: Antarmuka sesi aktif (*Active Workout Screen*) yang didesain khusus agar bisa dioperasikan hanya dengan satu tangan (*one-hand friendly*). Input beban dan repetisi instan tanpa form yang kaku.
- **Auto Rest Timer & Audio Cues**: Waktu istirahat berjalan otomatis setiap set selesai, dibantu dengan notifikasi *haptic feedback* dan efek suara (beep) agar fokus Anda tidak teralihkan dari angkatan.
- **Personal Records (PR) Tracking**: Secara otomatis melacak rekor beban tertinggi (*Weight PR*), rekor volume angkatan tertinggi (*Volume PR*), dan perkiraan 1-Rep Max (1RM) tiap gerakan. Menampilkan selebrasi saat rekor pecah.
- **Advanced Analytics**: Visualisasi data performa mingguan, tren angkatan bulanan, dan distribusi proporsi latihan kelompok otot menggunakan grafik interaktif yang indah.
- **Seamless Cloud Sync**: Berjalan di atas arsitektur Supabase. Semua histori latihan, template, dan rekor disimpan secara persisten di cloud dan tersinkronisasi otomatis antar perangkat Anda.

---

## 🛠 Tech Stack

ngegymYuk dibangun dengan arsitektur modern berorientasi performa:

**Frontend Mobile (Cross-Platform Android & iOS)**
- **Framework**: React Native & Expo (Managed Workflow)
- **Routing**: Expo Router (File-based routing dengan *Navigation Guards*)
- **Styling**: NativeWind (Tailwind CSS untuk React Native)
- **State Management**: Zustand (Cepat, minim boilerplate untuk timer dan state workout aktif)
- **UI/UX Polishing**: Reanimated, Expo Haptics, Expo AV (Audio)
- **Validation**: Zod
- **Charts**: react-native-gifted-charts

**Backend & Cloud (BaaS)**
- **Database**: Supabase PostgreSQL (Dilengkapi Row Level Security/RLS per tabel)
- **Authentication**: Supabase Auth (Email & Password, Google OAuth SSO)
- **Storage**: Supabase Storage

---

## 🎨 UI/UX & Design Philosophy

Desain antarmuka ngegymYuk terinspirasi dari aplikasi papan atas seperti **Strava, Hevy, dan Strong**, dikemas dalam tema **Dark Mode (Default)** dengan estetika *athletic performance dashboard*.

**Prinsip Desain:**
1. **Progress First**: PR, Total Volume, dan Sesi Terakhir selalu menjadi suguhan utama di Home.
2. **Fast During Workout**: Tombol raksasa **"COMPLETE SET"** di sesi aktif yang menjamin pencatatan $\le 3$ detik. Touch target terjamin minimal $\ge 44\times 44\text{ px}$.
3. **Premium Simplicity**: Tema latar super gelap (Backdrop `#0A0A0A`, Surface `#161616`) yang dipadukan dengan aksen kontras oranye ngegymYuk (`#FC4C02`).
4. **Resilience**: Konfirmasi destruktif, *graceful error handling*, dan state perlindungan jika sesi tertutup secara tidak sengaja.

---

## 🚀 Panduan Instalasi (Development)

Untuk menjalankan dan mengembangkan ngegymYuk di environment lokal Anda:

### 1. Persiapan Awal
Pastikan Anda sudah menginstal **Node.js** (v18+ direkomendasikan) dan memiliki akun **Supabase**.

```bash
# Clone repository ini (jika Anda belum melakukannya)
git clone https://github.com/devilsduddee/ngegymyuk.git
cd ngegymyuk

# Install seluruh dependencies
npm install
```

### 2. Konfigurasi Environment & Supabase
- Copy file `.env.example` dan ubah namanya menjadi `.env`:
  ```bash
  cp .env.example .env
  ```
- Isi `EXPO_PUBLIC_SUPABASE_URL` dan `EXPO_PUBLIC_SUPABASE_ANON_KEY` sesuai detail proyek Supabase Anda.
- *(Opsional namun penting)* Jalankan script SQL migrasi yang terdapat di folder `supabase/migrations/` ke proyek Supabase Anda untuk menyiapkan skema tabel (Exercises, Workouts, Sets) beserta RLS rules-nya.

### 3. Menjalankan Server Development
Buka terminal dan jalankan server Expo:
```bash
npx expo start
```
- **Android**: Buka aplikasi *Expo Go* dan scan QR code, atau tekan `a` di terminal jika menjalankan Android Emulator lokal.
- **iOS**: Scan QR Code menggunakan kamera bawaan iPhone, atau tekan `i` untuk menjalankan iOS Simulator (Hanya untuk pengguna macOS).

---

## 📂 Struktur Direktori Utama

Arsitektur aplikasi ngegymYuk menerapkan pendekatan *feature-based*:

```txt
src/
├── app/                  # Expo Router file-based screens (auth, tabs, workout)
├── components/           # Reusable UI components (Buttons, Cards, Modals, Inputs)
├── features/             # Domain logic terisolasi per modul
│   ├── analytics/        # Kalkulasi volume dan komponen chart
│   ├── auth/             # Login, OAuth, dan validasi sesi
│   ├── exercises/        # Pustaka gerakan dan filter
│   ├── history/          # Kalkulasi PR dan histori aktivitas
│   └── workouts/         # Workout Builder dan Active Session
├── hooks/                # Custom React Hooks
├── lib/                  # Inisialisasi library (Supabase client, env loader)
├── stores/               # Zustand global states (Auth, Workout, History)
├── types/                # TypeScript interface definitions
└── utils/                # Helper functions, formatters, uuid generator
```

---

## 📜 Lisensi & Aturan Kontribusi

Silakan merujuk pada `AGENTS.md` untuk pedoman standar koding, panduan ukuran file maks (500 baris), batasan integrasi, dan aturan pengembangan menggunakan AI / Agentic Assistant. Semua pengembangan **Wajib** disinkronisasi pembaruannya ke dalam file `documentation.md`.
