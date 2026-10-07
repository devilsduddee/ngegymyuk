# Dokumentasi Teknis ngegymYuk

## Sprint 1: Authentication Foundation

### Tujuan Fitur

Menyediakan fondasi autentikasi pengguna yang aman, terisolasi, responsif, dan persisten untuk platform mobile (Android dan iOS) menggunakan Supabase Auth dan Expo Router.

Fitur ini mencakup:
- Pendaftaran akun baru (Register) dengan validasi email, nama lengkap, dan password.
- Masuk ke akun (Login) menggunakan Email & Password.
- Single Sign-On (SSO) menggunakan Google OAuth via Supabase Auth & Expo WebBrowser.
- Keluar dari akun (Logout / Sign Out).
- Session Persistence otomatis menggunakan AsyncStorage adapter.
- Protected Route Navigation Guards (mencegah akses layar latihan tanpa sesi login dan mengarahkan pengguna yang sudah login langsung ke dashboard).

---

### Flow Penggunaan
 
 1. **Aplikasi Dibuka (App Launch)**:
    - Root Layout memeriksa status sesi awal dari penyimpanan lokal melalui Supabase SDK.
    - Jika sesi valid ditemukan, pengguna diarahkan ke layar utama `(tabs)/home`.
    - Jika sesi belum ada atau kadaluarsa, pengguna diarahkan ke layar `(auth)/login`.
 
 2. **Pendaftaran (Register)**:
    - Pengguna membuka tab "Daftar Sekarang".
    - Pengguna mengisi Nama Lengkap, Email, Password, dan Konfirmasi Password.
    - Validasi formulir dijalankan oleh Zod di sisi client.
    - Tombol otomatis menampilkan loading spinner "Mendaftarkan akun..." dan tombol dinonaktifkan (disabled) untuk mencegah multiple submission.
    - `authService.registerWithEmail` memanggil `supabase.auth.signUp`.
    - **Success State**: Karena konfirmasi email dinonaktifkan di Supabase, akun langsung aktif:
      - Muncul Success Toast: *"Registrasi berhasil"*.
      - Layar menampilkan kartu sambutan *"🎉 Akun Berhasil Dibuat"*.
      - Deskripsi: *"Silakan masuk menggunakan email dan password yang baru dibuat."*
      - Pengguna otomatis dialihkan ke layar Login dalam 1.5 detik, atau dapat menekan langsung tombol *"Masuk Sekarang"*.
 
 3. **Login Email & Password**:
    - Pengguna memasukkan Email dan Password.
    - Tombol menampilkan loading state "Memproses..." dan men-disable interaksi.
    - `authService.loginWithEmail` memanggil `supabase.auth.signInWithPassword`.
    - Jika gagal, error code Supabase diterjemahkan menjadi pesan yang ramah (`authError.ts`) baik di banner formulir maupun Toast.
    - Jika sukses, Toast sukses muncul dan pengguna dialihkan ke `(tabs)/home`.
 
 4. **Login Google OAuth**:
    - Pengguna menekan tombol "Lanjutkan dengan Google".
    - Browser sistem terbuka via `expo-web-browser` dengan redirect URI yang kompatibel lintas environment (Expo Go, Android APK, iOS Build) melalui `makeRedirectUri({ scheme: "ngegymyuk", path: "auth/callback" })`.
    - Mendukung **PKCE Authorization Code Flow** (`?code=...`) via `supabase.auth.exchangeCodeForSession(code)` maupun **Implicit Token Flow** (`#access_token=...`).
    - Jika pengguna membatalkan/menutup browser dialog (`cancel` / `dismiss`), sistem menampilkan pesan informatif *"Login Google dibatalkan"* tanpa silent fail.
 
 5. **Keluar Akun (Logout)**:
    - Pengguna membuka tab "Profile" dan menekan "Keluar dari Akun".
    - `authService.signOut` memanggil `supabase.auth.signOut()`.
    - Token dihapus dari storage lokal dan state Zustand di-reset ke kondisi awal.
    - Pengguna otomatis dikembalikan ke layar `(auth)/login`.

---

### Database & Security

Menggunakan **Supabase PostgreSQL**.

Tabel pengguna bawaan Supabase:
- `auth.users`: Menyimpan data autentikasi primer (id uuid, email, encrypted password, user_metadata).
- Row Level Security (RLS) diaktifkan untuk seluruh tabel yang berkaitan dengan data pengguna pada sprint berikutnya, dengan aturan kepemilikan `auth.uid() = user_id`.

---

### API / Service

Modul: `src/features/auth/services/authService.ts`

Method yang tersedia:
- `loginWithEmail({ email, password })`: Autentikasi menggunakan email dan kata sandi.
- `registerWithEmail({ email, password, displayName })`: Registrasi akun baru dengan metadata profil.
- `signInWithGoogle()`: Membuka alur autentikasi OAuth Google.
- `signOut()`: Mengakhiri sesi aktif pengguna di Supabase dan membersihkan session lokal.
- `getInitialSession()`: Mengambil sesi yang tersimpan di storage lokal saat aplikasi cold start.
- `mapSupabaseUser(user)`: Mengonversi payload objek Supabase User ke model domain `AuthUser`.

---

### State Management

Store: `src/stores/authStore.ts` (Zustand)

State:
- `session`: Object sesi aktif dari Supabase (`Session | null`).
- `user`: Object profil pengguna (`AuthUser | null`).
- `isLoading`: Boolean status pemrosesan permintaan auth.
- `isInitialized`: Boolean status kesiapan pembacaan sesi awal aplikasi.

Actions:
- `setSession(session)`
- `setUser(user)`
- `setLoading(isLoading)`
- `setInitialized(isInitialized)`
- `reset()`

---

### Environment Variables

Daftar variable yang wajib diset di file `.env`:

| Variabel | Deskripsi | Contoh Nilai |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | URL endpoint project Supabase Anda | `https://xyzcompany.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Public Anon Key untuk akses client-side Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

> [!WARNING]
> File `.env` berisi konfigurasi lokal dan telah dimasukkan ke dalam `.gitignore`. Jangan pernah commit file `.env` ke repository publik. Gunakan `.env.example` sebagai referensi struktur environment variable.

---

### Panduan Menjalankan Aplikasi di HP (Expo Go)

Untuk menjalankan dan menguji aplikasi langsung di smartphone fisik Android atau iOS:

1. **Persiapan di HP**:
   - Pasang aplikasi **Expo Go** dari Google Play Store (Android) atau Apple App Store (iOS).
   - Pastikan HP dan komputer terhubung ke jaringan Wi-Fi lokal yang sama.

2. **Konfigurasi Environment**:
   - Salin file `.env.example` menjadi `.env` jika belum ada:
     ```bash
     cp .env.example .env
     ```
   - Masukkan URL dan Anon Key project Supabase Anda pada file `.env`.

3. **Jalankan Server Development**:
   - Buka terminal di folder root project (`d:/ngegymYuk`):
     ```bash
     npx expo start
     ```
   - Terminal akan menampilkan QR Code interaktif.

4. **Buka Aplikasi**:
   - **Android**: Buka aplikasi Expo Go, pilih "Scan QR code", lalu arahkan kamera ke QR Code di terminal.
   - **iOS**: Buka aplikasi Kamera bawaan iPhone, arahkan ke QR Code, lalu tap notifikasi banner untuk membuka di Expo Go.
   - *Alternatif Jaringan Berbeda (Tunneling)*: Jika HP dan komputer tidak satu Wi-Fi:
     ```bash
     npx expo start --tunnel
     ```

---

### Checklist Verifikasi Sebelum Commit

- [x] Struktur folder mematuhi kaidah `AGENTS.md` (`src/app/`, `src/features/auth/`, `src/components/`, `src/stores/`, `src/lib/`, `src/types/`).
- [x] File-based routing Expo Router berjalan dengan layout, tabs, dan navigation guards.
- [x] NativeWind v4 terkonfigurasi dengan color token DESIGN.md (Background `#0A0A0A`, Surface `#161616`, Primary `#FC4C02`).
- [x] Supabase Client terkonfigurasi dengan persistent storage adapter.
- [x] File `.env.example` tersedia dan `.env` terdaftar di `.gitignore`.
- [x] TypeScript strict pass (`npx tsc --noEmit` berhasil tanpa error).
- [x] Setiap file berukuran jauh di bawah batas 500 lines.
- [x] Sentuhan UI ramah gym: touch target minimal 44x44 px, input height 52px, tombol jelas.
- [x] Dokumentasi `documentation.md` diperbarui dalam Bahasa Indonesia.

---

## UI/UX Audit & Navigation Refactor (Production Ready Architecture)

### 1. Tujuan
Menciptakan arsitektur UI/UX production-ready yang bersih, konsisten, dan memenuhi standar estetika fitness app kelas dunia (Hevy, Strong, Strava, Lyfta) dengan:
- 5 Main Bottom Tabs: `Home`, `Workout`, `History`, `Analytics`, `Profile`.
- Memindahkan `Exercise Library` keluar dari Bottom Navigation menjadi sub-layar yang diakses melalui alur workout (`Workout -> Add Exercise -> Exercise Library`).
- Standarisasi palet tema gelap murni (#0A0A0A Background, #161616 Surface, #252525 Border, #FC4C02 Primary, #FFFFFF Text Primary, #A1A1AA Text Secondary) tanpa ketergantungan mode terang/gelap sistem perangkat.
- Eliminasi tumpang tindih elemen (overlapping), collision antara floating action buttons (FAB) dan tab bar, kartu bertingkat berlebihan (nested card slop), dan inkonsistensi safe area/padding.

### 2. Final Navigation Architecture

```txt
Root Layout (Stack)
├── (auth)
│   ├── login
│   └── register
├── (tabs) [Bottom Tab Bar: 5 Tabs]
│   ├── home (Hero, Start Workout CTA, Stats, PR, Recent Activity)
│   ├── workout (Workout Templates, New Workout FAB)
│   ├── history (Activity Log & Session History)
│   ├── analytics (Volume & Muscle Distribution)
│   ├── profile (User Profile, Stats, Settings, Logout)
│   └── exercises [HIDDEN from tab bar, href: null] (Exercise Library subpage with ← Kembali button)
└── workout/[id] (Workout Detail & Exercise Target Builder)
```

### 3. Perbaikan Tata Letak (Layout) & Inset
- **Bottom Tab Safe Inset**: Seluruh layar `FlatList` dan `ScrollView` menggunakan `contentContainerStyle={{ paddingBottom: 110 }}` atau `paddingBottom: 120` sehingga item terakhir tidak terhalang oleh Floating Action Button maupun Bottom Tab Bar.
- **Visual Hierarchy Streamlined**:
  - `Home`: Hero greeting atletis → `[ Mulai Workout Baru ]` Primary CTA → Weekly Stats horizontal strip → PR Personal Records preview → Recent Workouts list.
  - `Workout`: Daftar template bergaya Hevy tanpa border tebal ganda, status latihan jelas, dan FAB responsif.
  - `Workout Detail Builder`: Konfigurasi target set difokuskan pada ringkasan set x reps x rest yang padat (`4 × 8 Reps | ⏱ 120s Rest`) tanpa tampilan form CRUD yang kaku.
- **Card Hierarchy**: Menghilangkan kartu bertumpuk (nested cards), menyederhanakan border menjadi `#252525`, dan mengoptimalkan kontras teks `#FFFFFF` dan `#A1A1AA`.

---

## Sprint 2: Exercise Library

### Tujuan Fitur

Menyediakan pustaka database gerakan gym (Exercise Library) yang lengkap, cepat dicari, dan mudah difilter berdasarkan kelompok otot serta peralatan (FR-02 & DESIGN.md).

Fitur ini mencakup:
- Repositori 50+ gerakan latihan gym populer di seluruh kelompok otot utama.
- Pencarian cerdas berdasarkan nama latihan dan deskripsi gerakan.
- Filter interaktif berbasis chip kelompok otot (Chest, Back, Shoulders, Biceps, Triceps, Quads, Hamstrings, Glutes, Calves, Abs, Forearms).
- State penanganan komprehensif: Loading State, Empty State jika pencarian tidak ditemukan, dan modal detail gerakan.
- Arsitektur data hybrid (Supabase PostgreSQL query dengan graceful fallback ke local initial dataset).

---

### Flow Penggunaan

1. **Membuka Tab Exercises**:
   - Pengguna menekan tab "Exercises" di bottom navigation bar.
   - Layar menampilkan daftar latihan yang diurutkan secara alfabetis.
   - Indikator pemuatan (Loading State) muncul jika data sedang di-fetch dari Supabase.

2. **Pencarian Gerakan (Search by Name)**:
   - Pengguna mengetik nama latihan di search bar (misal: "bench", "squat", "curl").
   - Daftar otomatis terfilter secara real-time.
   - Tombol "✕" tersedia untuk menghapus input pencarian secara instan.

3. **Filter Berdasarkan Kelompok Otot (Muscle Chips)**:
   - Pengguna menekan salah satu chip otot horizontal (contoh: "Chest", "Back", "Legs").
   - Daftar diperbarui seketika hanya menampilkan latihan yang sesuai dengan target otot utama maupun sekunder.
   - Menekan "Semua Otot" akan mereset filter otot.

4. **Empty State**:
   - Jika kombinasi pencarian dan filter tidak menghasilkan data (misal pencarian "xyz123"), layar menampilkan ilustrasi pencarian kosong beserta tombol "Reset Filter & Pencarian".

5. **Melihat Detail Gerakan**:
   - Pengguna menekan salah satu kartu latihan (`ExerciseCard`).
   - Modal detail muncul menampilkan nama latihan, kelompok otot primer/sekunder, jenis peralatan, dan deskripsi/panduan teknis gerakan.

---

### Database & Security

Tabel: `public.exercises`

Skema:
```sql
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    primary_muscle TEXT NOT NULL,
    secondary_muscle TEXT,
    equipment TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

Row Level Security (RLS) Policy:
- Status: **Enabled**
- Aturan:
  ```sql
  CREATE POLICY "Allow read access for all users"
  ON public.exercises
  FOR SELECT
  USING (true);
  ```
  (Memberikan izin baca ke seluruh pengguna yang terautentikasi maupun publik, sementara modifikasi dibatasi hanya untuk role admin).

Migrasi & Seed:
- File SQL: `supabase/migrations/20260913_create_exercises.sql` berisi skema, RLS policy, dan 50+ seed data latihan populer.

---

### API / Service

Modul: `src/features/exercises/services/exerciseService.ts`

Method yang tersedia:
- `getAllExercises()`: Mengambil daftar seluruh exercise dari tabel Supabase `exercises` terurut berdasarkan nama. Jika koneksi atau tabel belum diset, service secara elegan mengembalikan fallback 50+ data lokal `initialExercises`.
- `filterExercises(exercises, query, muscle, equipment)`: Fungsi penyaring murni untuk mencocokkan kata kunci teks, kelompok otot, dan jenis peralatan.

---

### State Management

Store: `src/stores/exerciseStore.ts` (Zustand)

State:
- `exercises`: Array master seluruh latihan (`Exercise[]`).
- `filteredExercises`: Array latihan hasil kalkulasi pencarian dan filter aktif (`Exercise[]`).
- `searchQuery`: String query teks pencarian.
- `selectedMuscle`: Kelompok otot yang dipilih (`MuscleGroup`).
- `selectedEquipment`: Peralatan yang dipilih (`EquipmentType`).
- `isLoading`: Boolean indikator fetching data.
- `error`: Pesan kesalahan (`string | null`).

Actions:
- `fetchExercises()`: Mengambil data dan menerapkan filter aktif.
- `setSearchQuery(query)`: Memperbarui query dan menyaring daftar.
- `setSelectedMuscle(muscle)`: Memperbarui pilihan filter otot dan menyaring daftar.
- `setSelectedEquipment(equipment)`: Memperbarui pilihan peralatan.
- `resetFilters()`: Mengembalikan seluruh filter ke kondisi default ("All").

---

### Checklist Verifikasi Sprint 2

- [x] Skema SQL dan RLS Policy untuk tabel `exercises` dibuat di `supabase/migrations/20260913_create_exercises.sql`.
- [x] Seed minimal 50+ latihan gym populer (50 variasi mencakup seluruh otot utama).
- [x] Service layer `exerciseService.ts` terimplementasi dengan safe fallback.
- [x] Zustand store `exerciseStore.ts` terintegrasi reaktif.
- [x] Search by exercise name berfungsi secara real-time.
- [x] Filter by muscle group horizontal chips berfungsi lancar.
- [x] Loading state dan Empty state terimplementasi dengan tombol reset.
- [x] Tidak ada file yang melebihi batas 500 lines (semua $\le 490$ baris).
- [x] Strict TypeScript pass (`npx tsc --noEmit` 0 errors).
- [x] Dokumentasi `documentation.md` telah dimutakhirkan.

---

## Sprint 3: Workout Builder

### Tujuan Fitur

Memungkinkan pengguna membuat program latihan kustom (workout list / templates) seperti "Push Day", "Pull Day", atau "Leg Day", memasukkan latihan dari Exercise Library, mengatur urutan latihan (Move Up / Down), serta mengonfigurasi Target Sets, Target Reps, dan Waktu Istirahat (Rest Timer dalam satuan detik) sesuai FR-03, FR-04, dan panduan DESIGN.md.

---

### Flow Penggunaan

1. **Melihat Daftar Workout Templates**:
   - Pengguna membuka tab "Workout" di bottom navigation.
   - Aplikasi memuat daftar template milik pengguna beserta jumlah latihan yang tersimpan.
2. **Membuat Template Baru**:
   - Pengguna menekan tombol "+ New Workout".
   - Modal input muncul untuk mengisi nama template (misal: "Push Day").
   - Setelah menekan "Simpan", template dibuat dan pengguna langsung diarahkan ke layar Workout Detail.
3. **Menambahkan Latihan ke Template**:
   - Pengguna menekan tombol "+ Add Exercise" di layar detail.
   - Modal Exercise Picker terbuka dengan pencarian dan filter kelompok otot dari Exercise Library.
   - Pengguna memilih latihan, mengatur Target Sets (default 4), Target Reps (default 8), dan Rest Timer (default 90 detik).
   - Menekan "Tambahkan ke Workout" menyimpan latihan ke template.
4. **Mengubah Urutan Latihan (Reorder)**:
   - Pengguna menggunakan tombol ▲ (Move Up) dan ▼ (Move Down) di setiap kartu latihan untuk memindahkan urutan latihan secara instan.
5. **Mengubah Konfigurasi Target**:
   - Pengguna menekan "Ubah Target" pada kartu latihan untuk menyesuaikan sets, reps, atau durasi istirahat.
6. **Menghapus Latihan atau Template**:
   - Pengguna dapat menghapus latihan tertentu dari template dengan konfirmasi.
   - Pengguna dapat mengubah nama atau menghapus seluruh template dari daftar atau layar detail.

---

### Database & Security

Tabel 1: `public.workout_templates`
```sql
CREATE TABLE IF NOT EXISTS public.workout_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

Tabel 2: `public.workout_template_exercises`
```sql
CREATE TABLE IF NOT EXISTS public.workout_template_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.workout_templates(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    order_number INTEGER NOT NULL DEFAULT 1,
    target_sets INTEGER NOT NULL DEFAULT 4,
    target_reps INTEGER NOT NULL DEFAULT 8,
    rest_timer_seconds INTEGER NOT NULL DEFAULT 90,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

Row Level Security (RLS) Policy:
- Kedua tabel diaktifkan RLS (`ENABLE ROW LEVEL SECURITY`).
- Hanya pemilik data (`auth.uid() = user_id`) yang dapat melakukan SELECT, INSERT, UPDATE, dan DELETE.
- Skrip migrasi lengkap: `supabase/migrations/20260913_create_workout_templates.sql`.

---

### API / Service Layer

1. `src/features/workouts/services/workoutTemplateService.ts`:
   - `getTemplates()`: Fetch seluruh template milik user dari Supabase (dengan fallback offline).
   - `createTemplate(name)`: Menambahkan template baru.
   - `updateTemplate(id, name)`: Mengubah nama template.
   - `deleteTemplate(id)`: Menghapus template beserta relasi latihannya.

2. `src/features/workouts/services/workoutTemplateExerciseService.ts`:
   - `getTemplateExercises(templateId)`: Mengambil daftar latihan dalam template terurut berdasarkan `order_number`.
   - `addExercise(input, currentCount)`: Memasukkan latihan baru ke template dengan konfigurasi target.
   - `updateExercise(templateId, exerciseId, input)`: Memperbarui sets, reps, dan rest timer.
   - `removeExercise(templateId, exerciseId)`: Menghapus latihan dan menyusun ulang nomor urut.
   - `reorderExercises(templateId, reorderedList)`: Menyimpan susunan urutan baru ke database.

---

### State Management

Store: `src/stores/workoutStore.ts` (Zustand)

State:
- `templates`: Daftar template pengguna (`WorkoutTemplate[]`).
- `activeTemplate`: Template yang sedang dibuka (`WorkoutTemplate | null`).
- `activeExercises`: Daftar latihan dari template aktif (`WorkoutTemplateExercise[]`).
- `isLoading`: Indikator pemrosesan data.
- `error`: Pesan kesalahan.

Actions:
- `fetchTemplates()`
- `createTemplate(name)`
- `updateTemplateName(id, name)`
- `deleteTemplate(id)`
- `fetchTemplateDetail(templateId)`
- `addExerciseToTemplate(...)`
- `updateExerciseConfig(...)`
- `removeExerciseFromTemplate(...)`
- `moveExercise(currentIndex, direction)`

---

### Notes

- Rest timer disimpan dalam satuan detik (contoh: 90 untuk 90 detik / 1m 30s, 120 untuk 2 menit) sesuai PRD.md.
- Layar didesain satu tangan (one-hand friendly) dengan touch target minimal 44x44 px dan form input 52px.
- Fitur eksekusi latihan (Workout Session) dan jalannya timer secara aktif tetap berada di luar scope Sprint 3 dan akan diimplementasikan pada Sprint 4.

---

## Sprint: Visual & UX Polish (Design System Alignment)

### Tujuan Fitur

Memoles seluruh tampilan visual dan micro-interaction aplikasi ngegymYuk agar mencapai standar produk kebugaran premium setara Strava, Hevy, Strong, dan Lyfta, dengan kepatuhan penuh terhadap DESIGN.md dan AGENTS.md. Sprint ini difokuskan murni pada User Interface, User Experience, dan performa visual tanpa mengubah skema basis data ataupun menambah fitur di luar cakupan Sprint 1-3.

### Perubahan Visual Berdasarkan Screen

1. **Login & Register (`(auth)/login.tsx` & `(auth)/register.tsx`)**:
   - Hero brand card container dengan badge oranye `#FC4C02` dan logo `💪 ngegymYuk`.
   - Form container berbasis `Card` gelap (`#161616`) dengan border tegas `#252525`.
   - Input field 52px dengan kontras tinggi (`#FFFFFF` text) dan border fokus.
   - Tombol Google SSO bergaya modern dengan logo Google berwarna dan border transparan yang elegan.
   - Switch auth link yang ramah jempol.

2. **Home Screen (`(tabs)/home.tsx`)**:
   - Header personalisasi: *"Halo Gym Bro 👋"* dengan status kesiapan harian.
   - Strava-style Weekly Stats Dashboard: 3 grid metriks mingguan (Workout, Volume, Durasi) dengan perbandingan target.
   - Hevy-style Last Workout Card: Ringkasan sesi terakhir (durasi, total volume angkatan, dan jumlah gerakan).
   - Personal Records (PR) Preview: Kartu highlight rekor Bench Press, Squat, dan Deadlift dengan badge bintang.
   - Quick Start Workout CTA besar yang responsif untuk langsung beralih ke builder.

3. **Exercise Library (`(tabs)/exercises.tsx`)**:
   - Search bar bergaya Lyfta dengan ikon pencarian, tombol clear instan, dan kontras tajam.
   - Filter chips horizontal kelompok otot dengan icon emoji tematik (`🏋️ Dada`, `🚣 Punggung`, `🦵 Kaki`, `💪 Bisep`, dll.) dan badge hitung total variasi.
   - Exercise card premium dengan badge otot oranye dan peralatan latihan.
   - Skeleton loading state beranimasi saat memuat pustaka latihan.
   - Empty state humanis saat pencarian tidak ditemukan dengan tombol reset filter.

4. **Workout Templates (`(tabs)/workout.tsx`)**:
   - Template cards Hevy-inspired (`TemplateCard.tsx`) dengan micro-interaction spring via React Native Reanimated.
   - Badge hitung gerakan (`X Gerakan`) dan indikator status template.
   - Empty state yang humanis: *"Belum ada workout. Buat workout pertamamu hari ini."* dilengkapi tombol pembuatan instan.
   - Floating Action Button (FAB) oranye ramah jempol satu tangan.

5. **Workout Detail Builder (`src/app/workout/[id].tsx`)**:
   - Kartu latihan dengan hierarki visual teratur: nama gerakan, badge otot utama, dan alat.
   - Grid spesifikasi konfigurasi latihan (Target Sets, Target Reps, Rest Timer) dengan kontras angka yang tinggi.
   - Tombol reorder gerakan (▲ Move Up / ▼ Move Down) dengan target sentuh $\ge 44 \times 44\text{ px}$.
   - Tombol aksi Ubah Target & Hapus dengan state warna status (merah untuk destruktif).

6. **Profile (`(tabs)/profile.tsx`)**:
   - Hero user card dengan inisial avatar berlingkar oranye ganda dan badge online hijau.
   - Lifetime summary cards: Total Workout dan Total Volume Angkatan.
   - Account detail card: User ID, status sinkronisasi cloud real-time, dan versi aplikasi.
   - Tombol Logout berdesain 'danger' dengan dialog konfirmasi alert.

7. **Micro-Interactions & Komponen UI Global (`Button.tsx`, `Card.tsx`)**:
   - Menggunakan `react-native-reanimated` untuk efek tactile spring press (`scale: 0.97` - `0.98`).
   - Seluruh touch target dijamin $\ge 44 \times 44\text{ px}$.

---

## Sprint 4A: Core Workout Session & Set Logging

### Tujuan Fitur

Menyediakan mesin pencatatan latihan aktif (*Active Workout Session*) yang cepat, stabil, ramah penggunaan satu tangan (*one-hand friendly*), dan berorientasi pada kecepatan gym.

Fitur ini mencakup:
- Inisiasi sesi aktif dari Workout Template.
- Penghitung stopwatch durasi latihan *real-time* (`MM:SS` atau `HH:MM:SS`).
- Penanda gerakan latihan aktif & target konfigurasi (contoh: `Target: 4 × 8 Reps`).
- Pencatatan set (*Weight & Reps*) dengan tombol instan penambah/pengurang (+ / -) stepper.
- Tombol aksi terbesar **COMPLETE SET** beraksen oranye `#FC4C02`.
- Kalkulasi otomatis volume per set (`weight × reps`) dan riwayat set yang telah diselesaikan untuk gerakan tersebut.
- Navigasi antar gerakan (*Gerakan Sebelumnya / Gerakan Berikutnya*).
- Modal ringkasan akhir latihan (*Summary Modal*) menampilkan durasi total, total set selesai, dan akumulasi volume angkatan (kg).

---

### Flow Penggunaan

1. **Memulai Sesi Latihan (Start Workout)**:
   - Pengguna menekan tombol **"▶ Mulai"** pada kartu template di tab *Workout* atau di layar *Workout Detail*.
   - Store `activeWorkoutStore.startWorkoutFromTemplate` membuat entri sesi baru di tabel `workout_sessions` (atau AsyncStorage fallback jika offline).
   - Pengguna otomatis dialihkan ke layar `/workout/active` dan stopwatch latihan langsung berjalan.

2. **Mencatat Set Latihan (Set Logging)**:
   - Layar menampilkan nama gerakan, badge otot utama, dan target set/reps.
   - Pengguna menyesuaikan beban (kg) dan jumlah repetisi menggunakan kontrol stepper (+ / -) atau input langsung.
   - Pengguna menekan tombol raksasa **COMPLETE SET**.
   - Set tersimpan di tabel `workout_sets` dengan data beban, repetisi, dan kalkulasi volume.
   - Nomor set otomatis bertambah (misal beralih dari Set 1 ke Set 2).

3. **Berpindah Gerakan**:
   - Pengguna dapat menekan tombol *Gerakan Berikutnya* atau *Gerakan Sebelumnya* di bagian bawah untuk berpindah antar gerakan dalam program latihan.

4. **Menyelesaikan Latihan (End Workout)**:
   - Pengguna menekan **"Selesai"** di sudut kanan atas header.
   - Dialog konfirmasi muncul untuk memastikan pengguna selesai berolahraga.
   - Saat disetujui, sesi latihan difinalisasi dengan mencatat `completed_at`, `duration_seconds`, `total_volume`, dan `total_sets`.
   - Modal pencapaian *Workout Selesai* muncul menampilkan metrik latihan (Durasi, Total Set, Total Volume Angkatan).
   - Menekan *Tutup & Kembali ke Home* membersihkan state latihan aktif dan mengarahkan kembali ke dashboard.

5. **Membatalkan Latihan**:
   - Pengguna dapat memilih opsi "Batal" di header kiri atas untuk membatalkan dan menghapus sesi jika tidak sengaja dimulai.

---

### Database & Security

Tabel 1: `public.workout_sessions`
- `id` (UUID, Primary Key)
- `user_id` (UUID, References `auth.users(id)` ON DELETE CASCADE)
- `template_id` (UUID, References `workout_templates(id)` ON DELETE SET NULL)
- `workout_name` (TEXT)
- `duration_seconds` (INTEGER)
- `total_volume` (NUMERIC(10,2))
- `total_sets` (INTEGER)
- `started_at` (TIMESTAMPTZ)
- `completed_at` (TIMESTAMPTZ)

Tabel 2: `public.workout_sets`
- `id` (UUID, Primary Key)
- `session_id` (UUID, References `workout_sessions(id)` ON DELETE CASCADE)
- `exercise_id` (UUID, References `exercises(id)` ON DELETE CASCADE)
- `set_number` (INTEGER)
- `weight` (NUMERIC(8,2))
- `reps` (INTEGER)
- `volume` (NUMERIC(10,2))
- `created_at` (TIMESTAMPTZ)

RLS Policies:
- Kedua tabel diisolasi penuh: hanya pemilik data yang dapat melakukan SELECT, INSERT, UPDATE, dan DELETE (`auth.uid() = user_id`).
- Skrip migrasi: `supabase/migrations/20260913_create_workout_sessions.sql`.

---

### State Management

Store: `src/stores/activeWorkoutStore.ts` (Zustand)

State:
- `activeSession`: Sesi aktif saat ini (`WorkoutSession | null`).
- `exercises`: Daftar latihan dalam sesi aktif (`WorkoutTemplateExercise[]`).
- `currentExerciseIndex`: Indeks gerakan yang sedang dikerjakan (`number`).
- `loggedSets`: Seluruh set yang telah dicatat selama sesi berjalan (`WorkoutSet[]`).
- `elapsedSeconds`: Stopwatch durasi berjalan dalam detik (`number`).
- `isTimerRunning`: Status jalan stopwatch (`boolean`).
- `lastSummary`: Objek ringkasan hasil latihan (`WorkoutSummary | null`).

---

### File Size Compliance

Seluruh file yang dibuat berada jauh di bawah batas 500 baris:
- `src/stores/activeWorkoutStore.ts` (~300 lines)
- `src/features/workouts/services/workoutSessionService.ts` (~260 lines)
- `src/app/workout/active.tsx` (~420 lines)
- `src/types/session.ts` (~50 lines)

---

## Sprint 4B: Workout Experience Layer

### Tujuan Fitur

Meningkatkan kualitas pengalaman sesi latihan aktif agar setara dengan standar produk kebugaran kelas dunia (*Hevy*, *Strong*, *Strava*). Sprint ini menghadirkan interaksi gym yang reaktif, minim friksi, dan memberikan feedback sensorik yang memuaskan.

Fitur ini mencakup:
1. **Input Validation & Clamping**: Menjamin semua input numerik berada dalam batas fisiologis aman (Sets: 1-20, Reps: 1-100, Weight: 1-1000 kg, Rest Timer: 0-600 detik). Tidak ada nilai negatif atau overflow.
2. **Auto Rest Timer Engine**:
   - Terpicu secara otomatis saat pengguna menekan tombol **COMPLETE SET**.
   - Mengambil durasi `rest_timer_seconds` yang telah dikonfigurasi pada gerakan tersebut di Workout Builder.
   - Banner kontrol di layar aktif dengan tombol **Pause**, **Resume**, dan **Skip**.
   - Saat timer selesai, sistem otomatis kembali memfokuskan pengguna ke set berikutnya tanpa klik tambahan.
3. **Sound Alert (`expo-av`)**:
   - Memainkan audio cue beep saat waktu istirahat (Rest Timer) habis.
   - Dilengkapi safe fallback jika perangkat dalam mode hening atau audio gagal dimuat.
4. **Haptic Tactile Feedback (`expo-haptics`)**:
   - Medium Impact saat menekan **Complete Set**.
   - Warning/Notice vibration saat **Rest Timer** selesai.
   - Success Notification pattern saat **Workout Complete** (latihan diselesaikan).
5. **Weight PR Detection & Celebration Modal**:
   - Setiap set yang dicatat diperiksa terhadap rekor beban tertinggi sebelumnya untuk latihan tersebut (`weight > previous_best_weight`).
   - Jika terpecahkan, modal selebrasi ringan bergaya dark orange muncul: `🔥 NEW PERSONAL RECORD [Exercise Name] [Weight] kg`.
   - Ringkasan rekor baru (`newPRs`) disertakan dalam modal Workout Complete di akhir sesi.
6. **Session Recovery (Resilience)**:
   - Status latihan aktif disimpan secara berkala ke penyimpanan lokal (`AsyncStorage`).
   - Jika aplikasi tertutup tidak sengaja, layar Home mendeteksi sesi yang belum selesai dan menampilkan banner interaktif: **Lanjutkan Workout** atau **Batalkan**.

---

### Verifikasi & Audit

- **TypeScript Strict**: `npx tsc --noEmit` lulus dengan 0 error.
- **Batasan File**: Seluruh berkas baru dan modifikasi berada di bawah batas 500 baris.
- **Out of Scope Guard**: Tidak ada implementasi history feed baru, kalkulasi 1RM, volume PR, grafik analytics, atau fitur sosial.

---

## Sprint 5: History & Personal Records

### Tujuan Fitur

Menyediakan linimasa riwayat sesi latihan komprehensif (*Activity History Feed* ala Strava), halaman rincian sesi (*History Detail*), deteksi rekor Personal Records (Weight PR, Volume PR, dan Estimated 1RM), serta linimasa perkembangan performa beban per gerakan (*Exercise Progress*).

Fitur ini mencakup:
1. **History Feed Screen (`(tabs)/history.tsx`)**:
   - Tab switcher: **Workout Sessions** vs **Personal Records**.
   - Daftar sesi yang telah selesai diurutkan dari yang terbaru (*Newest first*).
   - Menampilkan Nama Workout, Durasi, Total Volume Angkatan (kg), Total Sets, dan Tanggal pelaksanaan.
2. **History Detail Screen (`src/app/history/[id].tsx`)**:
   - Ringkasan sesi latihan (Durasi, Total Volume, Total Sets).
   - Pengelompokan latihan (*Exercise Groups*) beserta rincian per set (Nomor Set, Beban, Repetisi, dan Volume).
3. **Personal Records (PR Engine)**:
   - **Weight PR**: Beban tertinggi yang pernah diangkat untuk latihan tersebut.
   - **Volume PR**: Akumulasi tonase tertinggi dalam satu set (`weight × reps`).
   - **Estimated 1RM**: Dihitung menggunakan rumus standar industri:
     $$\text{1RM} = \text{Weight} \times \left(1 + \frac{\text{Reps}}{30}\right)$$
4. **Exercise Progress Screen (`src/app/history/progress.tsx`)**:
   - Menampilkan kronologi seluruh set dan beban yang pernah dicatat untuk gerakan tertentu dari waktu ke waktu.
   - Tanpa chart/grafik berat, disajikan dalam list bersih dan terstruktur.

---

### State & Services

- Modul Layanan:
  - `src/features/history/services/historyService.ts`: Mengambil sesi yang telah selesai dan membedah detail sesi berdasarkan kelompok gerakan.
  - `src/features/history/services/prService.ts`: Menghitung estimasi 1RM, rekor PR komprehensif per latihan, dan kronologi set.
- Store: `src/stores/historyStore.ts` (Zustand).

---

### File Size Compliance

- `src/features/history/services/historyService.ts` (~160 lines)
- `src/features/history/services/prService.ts` (~160 lines)
- `src/stores/historyStore.ts` (~60 lines)
- `src/app/(tabs)/history.tsx` (~260 lines)
- `src/app/history/[id].tsx` (~170 lines)
- `src/app/history/progress.tsx` (~130 lines)
- `src/types/history.ts` (~35 lines)

---

## Sprint 6: Analytics Dashboard & Visual Charts

### Tujuan Fitur

Menyediakan dasbor visual analitik performa kebugaran menyeluruh menggunakan pustaka grafik native `react-native-gifted-charts`, mencakup perhitungan total metrik seumur hidup (*Lifetime Totals*), statistik mingguan (*Weekly Stats*), statistik bulanan (*Monthly Stats*), visualisasi distribusi volume otot (*Muscle Group Volume*), serta menyambungkan layar Home Dashboard ke data nyata.

Fitur ini mencakup:
1. **Analytics Screen (`(tabs)/analytics.tsx`)**:
   - **Lifetime Totals**: Total Workout yang selesai, akumulasi jam latihan (*Total Duration*), dan total tonase angkatan (*Total Volume* dalam kg/k).
   - **Weekly Volume Bar Chart**: Diagram batang 7 hari terakhir menunjukkan distribusi beban harian (Sen-Min) dengan rounded bar oranye `#FC4C02`.
   - **Monthly Workout Trend Line Chart**: Diagram garis tren 5 bulan terakhir yang memperlihatkan konsistensi frekuensi sesi latihan.
   - **Muscle Group Volume Distribution**: Breakdown persentase kontribusi volume beban per kelompok otot (*Chest, Back, Legs, Shoulders, Arms, Abs, dll.*) lengkap dengan progress bar horizontal.
2. **Sinkronisasi Home Dashboard (`(tabs)/home.tsx`)**:
   - Menghapus semua placeholder / hardcoded data.
   - **Weekly Stats**: Mengambil jumlah workout, total jam durasi, dan total tonase 7 hari terakhir secara langsung dari `analyticsStore`.
   - **Personal Records Preview**: Menampilkan kartu horizontal rekor beban tertinggi aktual dari `historyStore`.
   - **Recent Workout**: Menampilkan kartu ringkasan sesi latihan terakhir yang baru diselesaikan pengguna.

---

### Formula Kalkulasi

1. **Volume Mingguan**:
   $$\text{Weekly Volume} = \sum \text{session.total\_volume} \quad \forall \text{ session} \in [\text{now} - 6\text{ hari}, \text{now}]$$
2. **Distribusi Otot**:
   $$\text{Muscle Percentage} = \frac{\sum \text{volume}_{\text{muscle}}}{\sum \text{volume}_{\text{all\_muscles}}} \times 100\%$$

---

---

## Product Identity Redesign V2: Athletic Performance System

### Tujuan Redesign

Menghilangkan kesan aplikasi buatan AI (*AI-generated slop / generic CRUD templates*) dan memberikan identitas visual orisinal bagi **ngegymYuk** yang berfokus pada **Athletic Performance** dan **Progressive Overload** setara standar Hevy, Strava, dan Athletic Editorial.

### Pilar Arsitektur Redesign V2

1. **Active Workout: "The Focus Arena" (`src/app/workout/active.tsx`)**:
   - **Telemetry HUD**: Stopwatch terpusat dengan tipografi mono tabular berpresisi tinggi tanpa border tebal ganda.
   - **Dynamic Rest Timer**: Terintegrasi flush di bawah header dengan kontrol `+30s`, `Pause/Resume`, dan `Skip`.
   - **Giant Set Controller**: Pengontrol Beban (`-5, -2.5, +2.5, +5`) dan Repetisi (`-1, +1`) besar dan responsif untuk penggunaan satu tangan di gym.
   - **Monolithic CTA Bar**: Tombol aksi `LOG SET [N] • [KG] × [REPS]` full-width berlatar oranye `#FC4C02` dengan tactile spring response.
   - **Record Breach Celebration Modal**: Selebrasi rekor beban baru (*NEW PERSONAL RECORD*) tanpa confetti kartun, berfokus pada perbandingan angka (`RECORD BROKEN`, `+X KG FROM PREVIOUS BEST`).

2. **Home: "The Training Command Center" (`src/app/(tabs)/home.tsx`)**:
   - **Athlete Passport Header**: Identitas atlet dan inisial monogram minimalis.
   - **Next Objective Hero**: Menghilangkan greeting kosong; langsung mengunci fokus ke target program latihan berikutnya dengan tombol `MULAI PROGRAM LATIHAN →`.
   - **Weekly Progress Ticker (Borderless)**: Tiga metrik mingguan tanpa bungkus kartu tebal (Sesi Selesai, Waktu Latihan, Total Volume).
   - **PR Hall of Fame**: Baris rekor beban tertinggi aktual atlet.
   - **Recent Activity Stream**: Log sesi latihan terakhir yang baru diselesaikan.

3. **Workout Templates (`src/features/workouts/components/TemplateCard.tsx`)**:
   - Desain terstruktur bergaya program latihan atletik, bukan tabel database CRUD.
   - Border hairline bersih (`#27272A`), badge gerakan tegas, dan tombol instan `MULAI LATIHAN`.

---

### File Size Compliance

- `src/app/workout/active.tsx` (~420 baris)
- `src/app/(tabs)/home.tsx` (~280 baris)
- `src/features/workouts/components/TemplateCard.tsx` (~110 baris)
- `src/app/(tabs)/analytics.tsx` (~235 baris)
- `src/app/(tabs)/history.tsx` (~260 baris)

---

## Sprint 6: Audit Fixes & Performance Hardening

### Perbaikan Audit Sprint 6
1. **Timezone Day-Shift Bug (P0)**:
   - Mengganti pemotongan string UTC `toISOString().split("T")[0]` dengan helper lokal `getLocalDateKey(d: Date)` yang memanfaatkan `getFullYear()`, `getMonth()`, dan `getDate()`.
   - Menghindari pergeseran tanggal sesi latihan pada zona waktu lokal (contoh WIB UTC+7), sehingga sesi malam (misal pukul 21:00 WIB) tidak lagi tergeser ke hari kemarin karena konversi UTC.
2. **Eliminasi Duplicate Fetch Home Screen (P1)**:
   - `analyticsService.getAnalyticsSummary()` sekarang menerima opsional parameter `providedSessions?: WorkoutSession[]`.
   - `HomeScreen` mem-fetch data sesi `useHistoryStore` terlebih dahulu kemudian meneruskan data sesi ke `fetchAnalytics(currentSessions)`.
   - Mencegah query ganda `historyService.getCompletedSessions()` ke Supabase saat membuka Home.
3. **Optimasi Kinerja Agregasi (P2 - Single-Pass Indexing)**:
   - Menggantikan multiple repeated `.filter()` (7 kali untuk weekly chart dan 5 kali untuk monthly chart) dengan single-pass iteration $O(N)$ menggunakan Map indexing (`dailyVolumeMap` & `monthlyCountMap`).
   - Siap menangani 1,000+ sesi latihan tanpa frame drop atau latency tinggi.
4. **Resiliensi State Kosong / 0 Workout (P2)**:
   - Perhitungan persentase distribusi otot dilindungi dengan penjaga `totalMuscleVolume > 0` dan clamping `Math.min(100, Math.max(0, ...))` untuk mencegah `NaN` atau `Infinity`.
   - Chart volume harian dan bulanan terjamin mengembalikan 7 hari dan 5 bulan dengan nilai 0 bila tidak ada sesi.
5. **Konsistensi Label Hari Indonesia (P3)**:
   - Penamaan hari `Min, Sen, Sel, Rab, Kam, Jum, Sab` dipetakan secara konsisten dan akurat terhadap indeks hari lokal `getDay()`.

---

## UI Hardening: Reusable ConfirmModal (Alert.alert Replacement)

### Tujuan Fitur
Menggantikan seluruh dialog popup bawaan sistem (`Alert.alert` Android / iOS / Web) dengan komponen modal konfirmasi kustom yang seragam, konsisten dengan tema gelap (`DESIGN.md`), dan menggunakan animasi Reanimated yang halus.

### Komponen
- [ConfirmModal.tsx](file:///d:/ngegymYuk/src/components/ui/ConfirmModal.tsx)

### Spesifikasi Desain & Interaksi
1. **Top-Most Layering & Backdrop**:
   - Menghilangkan transparansi bocor dengan mengunci backdrop container modal `style={{ backgroundColor: "rgba(0,0,0,0.75)" }}` solid menyeluruh.
   - Background screen diblokir sepenuhnya dari sentuhan berkat layer backdrop berukuran layar penuh (`absolute inset-0`).
   - Modal card menggunakan background `#161616`, radius `20px`, padding `24px`, hairline border `#252525`, dan `elevation: 20` / `zIndex: 999`.
2. **Animasi & Transisi**:
   - Menggunakan `animationType="fade"` bawaan React Native Modal yang konsisten di Android, iOS, dan Web tanpa resiko desinkronisasi worklet Reanimated.
3. **Varian Dialog & Buttons**:
   - Tombol Batal: Gaya secondary background abu-abu gelap dengan border hairline.
   - Tombol Konfirmasi: Warna oranye primer `#FC4C02` (atau merah `#EF4444` untuk bahaya/destruktif).
4. **Touch Targets & Cross-Platform**:
   - Tombol minimal tinggi 48px, memenuhi standar gym-friendly & thumb-friendly.
   - Menjamin modal menjadi layer paling atas di atas header, list, dan floating CTA bawah.

### Lokasi Migrasi
1. `src/app/workout/[id].tsx`: Delete Exercise, Delete Template, Duplicate Exercise, Empty Exercise Alert.
2. `src/app/workout/active.tsx`: Finish Workout, Discard Workout.
3. `src/app/(tabs)/workout.tsx`: Create Template Validation, Delete Template, Empty Template Alert.
4. `src/app/(tabs)/profile.tsx`: Logout Confirmation, SignOut Error Alert.

---

## UI Hardening: Touch Interaction & Gesture Hierarchy Fixes

### Tujuan Fitur
Menyelesaikan masalah tombol tidak responsif atau sporadic unresponsive taps yang disebabkan oleh gesture responder conflicts, unmanaged absolute overlays, dan nested touchables.

### Perbaikan Utama
1. **Eliminasi Nested Touchables pada `TemplateCard`**:
   - Memisahkan area sentuh body kartu (`TouchableOpacity` untuk navigasi detail) dari footer bar aksi (`Mulai Latihan`, `Ubah`, `Hapus`).
   - Tombol anak tidak lagi berada di dalam `TouchableOpacity` parent, menjamin sentuhan tap jempol di gym selalu sampai ke callback tanpa di-hijack oleh parent responder.
2. **Overlay Pointer Events Pass-Through**:
   - Menambahkan `pointerEvents="box-none"` pada container absolut floating CTA di `src/app/(tabs)/workout.tsx` dan tombol "Simpan Set" di `src/app/workout/active.tsx`.
   - Mencegah transparent bounding box menutupi item list bagian bawah.
3. **Koreksi Toast `pointerEvents`**:
   - Memperbaiki class typo NativeWind `pointer-events-box-none` menjadi prop JSX resmi `pointerEvents="box-none"`.
4. **Active Press Feedback & HitSlop Expansion**:
   - Menambahkan `activeOpacity={0.7}` dan `hitSlop` pada tombol navigasi header (`← Kembali`, `Batal`, `Selesai`, `Lihat Semua`, `Detail Grafik`).

---

## P0 Android Bug Fix: Modal TextInput Focus & Keyboard Interaction

### Tujuan Fitur
Menyelesaikan bug kritis pada Android di mana input field di dalam modal (`ConfigureExerciseModal`, template rename, dialog form) tidak dapat difokuskan ketika disentuh, sehingga keyboard virtual tidak muncul dan user tidak dapat mengedit nilai (Target Sets, Target Reps, Rest Timer).

### Investigasi & Root Cause
1. **Touch Interception oleh `TouchableWithoutFeedback`**:
   - Di Android, membungkus container modal dengan `<TouchableWithoutFeedback onPress={Keyboard.dismiss}>` menyebabkan gesture responder Android (`ViewGroup` `onInterceptTouchEvent`) mencegat semua event sentuh sebelum sampai ke `TextInput` di dalamnya.
   - Pada iOS, `UITextField` mengenali touch secara independen, namun pada Android gesture touchable parent menelan sentuhan tersebut.
2. **Backdrop Architecture**:
   - Memisahkan dismiss keyboard ke layer backdrop mandiri (`Pressable` posisi absolute di belakang modal card) dengan `pointerEvents="box-none"` pada container wrapper `KeyboardAvoidingView`.
   - Menghubungkan container `Input` ke `TextInput.focus()` via `TouchableOpacity` wrapper sehingga sentuhan pada seluruh area box setinggi 56px langsung mengaktifkan `TextInput`.

### File Terkait
- `src/components/ui/AppModal.tsx`
- `src/components/ui/Input.tsx`

---

## P0 Bug Fix: State Synchronization Between Workout Detail & Workout Template List

### Tujuan Fitur
Memastikan perubahan konfigurasi latihan (Target Sets, Target Reps, Rest Timer, Reorder Gerakan, Tambah/Hapus Latihan) yang dilakukan pada layar Workout Detail (`/workout/[id]`) langsung terefleksi secara real-time pada Workout Template List (`/(tabs)/workout`) tanpa memerlukan refresh aplikasi atau restart state.

### Investigasi & Root Cause
1. **Store Synchronization Issue (Missing Template Tree Update)**:
   - Pada [workoutStore.ts](file:///d:/ngegymYuk/src/stores/workoutStore.ts), saat `updateExerciseConfig(exerciseTemplateId, input)` atau `moveExercise(...)` dieksekusi, store hanya memperbarui array `activeExercises`.
   - Objek `templates` di dalam Zustand store yang menaungi template tersebut tidak diperbarui daftar latihan (`exercises`)-nya ataupun `updated_at`-nya.
2. **Component Local Cache Desynchronization**:
   - [HeroTemplateCard.tsx](file:///d:/ngegymYuk/src/features/workouts/components/HeroTemplateCard.tsx) menggunakan `useState<WorkoutTemplateExercise[]>([])` internal yang hanya di-fetch sekali pada `useEffect([template.id])`.
   - Karena dependensi `useEffect` hanya `[template.id]`, perubahan konfigurasi set/reps pada template yang sama tidak memicu re-render atau sinkronisasi state kartu preview.
3. **Screen Focus Stale State**:
   - Layar `src/app/(tabs)/workout.tsx` hanya memanggil `fetchTemplates()` di dalam `useEffect([], [fetchTemplates])` saat initial mount. Saat user kembali (`router.back()`) dari layar detail, halaman list tidak melakukan revalidasi cache data.

### Solusi & Fix Diterapkan
1. **Zustand Store Reactivity (`workoutStore.ts`)**:
   - Pada `updateExerciseConfig`, `removeExerciseFromTemplate`, `moveExercise`, dan `addExerciseToTemplate`, store kini secara deterministik mengimutasikan `templates` array dengan menyematkan `exercises: updatedExercises` dan `updated_at: new Date().toISOString()`.
2. **HeroTemplateCard Real-time Reflection (`HeroTemplateCard.tsx`)**:
   - Menjadikan `template.exercises` sebagai initial state dan menambahkan listener `useEffect([template.exercises, template.updated_at])` untuk langsung meng-update visual badge preview secara instan begitu store berubah.
   - Menambahkan `template.updated_at` pada efek query service.
3. **Screen Focus Revalidation (`src/app/(tabs)/workout.tsx`)**:
   - Menggunakan `useFocusEffect(useCallback(() => { fetchTemplates(); }, [fetchTemplates]))` agar saat user berpindah/kembali ke tab Workout, seluruh data template otomatis tersinkronisasi dengan local storage & Supabase.

### File Terkait
- `src/stores/workoutStore.ts`
- `src/features/workouts/components/HeroTemplateCard.tsx`
- `src/app/(tabs)/workout.tsx`

---

## UI Hardening: Phase 7B - UI Stability & Layout Fixes

### Tujuan Fitur
Menyelesaikan temuan audit UI Stability dan layout issues: modal backdrop transparan, keyboard collision, exercise picker overlap, bottom safe area padding pada scrollable screens, header truncation, chart responsiveness pada layar kecil, dan standardisasi design tokens.

### Detail Perbaikan

1. **Modal System Stability (P0)**:
   - **Backdrop & Opacity**: Menggantikan `className="bg-black/80"` yang sering bocor transparan atau terhambat CSS rendering dengan `style={{ backgroundColor: "rgba(0,0,0,0.75)" }}` solid pada `ConfigureExerciseModal.tsx`, modal Create/Edit Template (`(tabs)/workout.tsx`), dan `ExercisePickerModal.tsx`.
   - **Keyboard Avoidance & Dismiss**: Menambahkan `KeyboardAvoidingView` (dengan behavior `padding` di iOS / `height` di Android) dan `TouchableWithoutFeedback onPress={Keyboard.dismiss}` pada seluruh modal yang memiliki input teks agar field input tidak tertutup keyboard virtual.
   - **Card Geometry**: Standardisasi background `#161616`, radius `20px` (`rounded-[20px]`), padding `24px` (`p-6`).

2. **Exercise Picker Modal Overlap Elimination (P0)**:
   - Menempatkan `MuscleChipList` di dalam container terisolasi `View className="py-1"` di antara Search Bar dan Exercise FlatList.
   - Memastikan tidak ada layout overlap antara search input, filter chips horizontal, dan list latihan vertikal.
   - Membungkus form konfigurasi set/reps/weight dengan `ScrollView` dan `keyboardShouldPersistTaps="handled"`.

3. **Safe Area Standardization (P1)**:
   - Standardisasi `contentContainerStyle={{ paddingBottom: 120 }}` pada seluruh ScrollView dan FlatList utama di:
     - `src/app/(tabs)/home.tsx`
     - `src/app/(tabs)/workout.tsx`
     - `src/app/(tabs)/history.tsx`
     - `src/app/(tabs)/analytics.tsx`
     - `src/app/(tabs)/profile.tsx`
     - `src/app/history/[id].tsx`
     - `src/app/history/progress.tsx`
   - Menjamin 100% konten paling bawah tidak tertutup oleh bottom tab bar navbar (56-64px) maupun floating action button CTA.

4. **Header Resilience (P1)**:
   - Memperbaiki `src/app/history/[id].tsx` dan `src/app/history/progress.tsx`.
   - Menghapus spacer statis `<View className="w-16" />` dan `<View className="w-10" />`.
   - Menggunakan flex layout adaptif (`flex-1 px-2 items-center justify-center` dengan `numberOfLines={1}`) serta penyeimbang dinamis `min-w-[44px]` agar judul panjang tidak terpotong pada layar compact (320px - 375px).

5. **Chart Responsiveness (P1)**:
   - Memperbaiki `src/app/(tabs)/analytics.tsx`.
   - Menggantikan hardcoded width pada `BarChart` dan `LineChart` dengan perhitungan lebar layar dinamis via `useWindowDimensions()`.
   - Menghitung `availableChartWidth = screenWidth - 72`, `dynamicBarSpacing`, dan `dynamicLineSpacing` secara proporsional sehingga chart tidak overflow horizontal melampaui kartu container pada viewport kecil.

6. **Design Consistency Standardization (P2)**:
   - Mengunci radius kartu dan modal pada `20px` (`rounded-[20px]`).
   - Standardisasi tinggi input pada `52px` (`h-[52px]`).
   - Standardisasi tombol ukuran besar pada `56px` (`h-14` / `h-[56px]`) di `src/components/ui/Button.tsx`.

---

## UI Hardening: Phase 7C - Component System Unification

### Tujuan Fitur
Membangun satu design system terpadu untuk seluruh aplikasi, mengeliminasi duplikasi styling ad-hoc, merampingkan sistem modal dan empty state, mengunci design tokens (Radius 20px, Button 56px, Input 52px, Spacing scale 4/8/12/16/24/32), serta memastikan seluruh interaksi dan presentasi visual konsisten tanpa mengubah business logic atau alur aplikasi.

### Komponen Inti Baru & Terpadu

1. **`src/components/ui/AppModal.tsx` (Single Source of Truth Modal System)**:
   - Mendukung dua mode presentasi: `center` (dialog kartu terpusat) dan `bottom-sheet` (drawer lembar bawah 90% height).
   - Mengintegrasikan solid backdrop `style={{ backgroundColor: "rgba(0,0,0,0.75)" }}`, `KeyboardAvoidingView`, `TouchableWithoutFeedback` keyboard dismiss, dan radius token `20px` / `28px` (sheet).
   - Seluruh modal ad-hoc di aplikasi kini menggunakan `AppModal`:
     - Create / Edit Template Modal (`(tabs)/workout.tsx`)
     - ConfigureExerciseModal (`features/workouts/components/ConfigureExerciseModal.tsx`)
     - ExercisePickerModal (`features/workouts/components/ExercisePickerModal.tsx`)
     - Exercise Detail Modal (`(tabs)/exercises.tsx`)
     - Personal Record Modal (`workout/active.tsx`)
     - Workout Summary Modal (`workout/active.tsx`)

2. **`src/components/ui/ConfirmModal.tsx`**:
   - Komponen konfirmasi terpusat untuk semua aksi destruktif dan validasi (`Delete Exercise`, `Delete Template`, `Discard Workout`, `Finish Workout`, `Logout`).
   - 0 penggunaan `Alert.alert` di seluruh aplikasi.

3. **`src/components/ui/EmptyState.tsx` (Single Source of Truth Empty State)**:
   - Komponen reusable untuk semua keadaan kosong dengan props `icon`, `title`, `message`, `actionLabel`, `onAction`.
   - Dipakai seragam di:
     - `(tabs)/home.tsx` (Empty workout plan, empty PR records, empty recent activity)
     - `(tabs)/workout.tsx` (Empty templates list)
     - `(tabs)/history.tsx` (Empty workout sessions, empty personal records)
     - `(tabs)/exercises.tsx` (Empty search/filter results)
     - `(tabs)/analytics.tsx` (Empty muscle distribution)
     - `workout/[id].tsx` (Empty exercises in template)
     - `history/progress.tsx` (Empty exercise progress history)
     - `features/workouts/components/ExercisePickerModal.tsx`

4. **`src/components/ui/Button.tsx` (Unified Button System)**:
   - Varian lengkap: `primary`, `secondary`, `outline`, `danger`, `ghost`.
   - Ukuran terkunci: `size="lg"` tinggi 56px (`h-14`) dengan radius 20px (`rounded-[20px]`); `size="md"` tinggi 44px (`h-11`) dengan radius 14px (`rounded-[14px]`).
   - Menggunakan micro-animation Reanimated spring feedback untuk sentuhan gym yang responsif.
   - Menggantikan seluruh tombol CTA penting yang sebelumnya memakai `TouchableOpacity` inline.

5. **`src/components/ui/Card.tsx` (Unified Card System)**:
   - Permukaan gelap `#161616`, border `#252525`, corner radius terkunci `20px` (`rounded-[20px]`), padding default `p-4.5` / `p-5`.
   - Mendukung prop `interactive` dan `onPress` dengan spring scale feedback.
   - Menggantikan container `View className="bg-surface rounded-2xl border..."` di seluruh screen.

6. **`src/components/ui/Input.tsx` (Unified Input System)**:
   - Tinggi terstandarisasi `52px` (`h-[52px]`), border `#252525`, background `#161616`, radius `20px` (`rounded-[20px]`).
   - Mendukung `label`, `error`, `isPassword` toggle, `suffix`, dan `isNumeric`.
   - Seluruh input manual di form auth, modal template, modal kalkulasi, dan search bar telah distandarisasi.

---

## Phase 7D: Analytics UX Optimization

### Tujuan Fitur
Menghilangkan kompleksitas pembacaan analitik untuk pengguna awam gym agar dapat memahami progres latihan dalam 3 detik tanpa perlu membaca angka mentah satu per satu.

### Flow & Insight
1. **Headline Metric & Comparison**:
   - Menampilkan total volume mingguan sebagai angka besar (4xl bold) disertai pill trend badge week-over-week (misal: `+18% vs mgg lalu 🔥` dengan warna emerald hijau atau `Turun 10%` dengan warna rose merah).
2. **Weekly Volume Chart Threshold (< 3 vs >= 3 Hari)**:
   - Jika hari aktif latihan dalam 7 hari terakhir < 3 hari: Bar chart tidak dipaksakan render untuk mencegah visual terasa kosong atau rusak. Digantikan dengan **educational empty state**: *"Belum cukup data untuk melihat tren mingguan"* disertai ringkasan volume minggu ini dan jumlah sesi latihan.
   - Jika hari aktif ≥ 3 hari: Menampilkan bar chart dengan tinggi yang lebih proporsional (`height={160}`), rounded corners, dan **value labels** kontras putih (`#FFFFFF`) di atas setiap batang aktif.
3. **Kartu Insight Minggu Ini**:
   - Menganalisis otomatis 3 poin ringkas:
     - Dinamika Beban: Persentase kenaikan/penurunan beban terhadap minggu sebelumnya.
     - Latihan Paling Sering: Template atau latihan yang paling sering dieksekusi pekan ini beserta frekuensinya.
     - Kelompok Otot Dominan: Otot dengan alokasi volume beban terbesar beserta persentasenya.
4. **Penyajian Frekuensi Bulanan yang Edukatif**:
   - Jika data aktif < 3 bulan, line chart disembunyikan dan diganti dengan pesan edukasi bahwa grafik tren membutuhkan minimal 3 bulan aktif agar tren tidak misleading.
5. **Format Metrik Ramah Manusia**:
   - Menggantikan format angka mentah seperti `0.1h` menjadi `"6 menit"` atau `"1 jam 12 menit"`.
   - Menggunakan utility `src/utils/formatters.ts` (`formatDurationHuman`, `formatDurationCompact`, `formatKg`).
6. **Chart Readability**:
   - Penataan ulang skala Y-axis dan pembulatan maksimal agar bar tidak terpotong.
   - Peningkatan kontras label X-axis (`#A1A1AA`, semibold, 11px) dan jarak bar proporsional.
   - Empty state layar penuh jika user belum memiliki riwayat workout sama sekali.

### Database & Service
- `analyticsService.ts` menghitung `previousWeeklyVolume` (7 hari sebelumnya, hari ke-7 s.d. ke-13), `activeWeeklyDaysCount`, `weeklyInsight`, dan `activeMonthDataPoints`.
- `analyticsStore.ts` & `src/types/analytics.ts` diperbarui dengan interface `WeeklyInsight` dan property `activeWeeklyDaysCount`.

### Notes
- Formula week-over-week mengandalkan kalender lokal perangkat via `getLocalDateKey` agar tidak terjadi pergeseran zona waktu (WIB UTC+7).

---

## Phase 7E: Profile Statistics Unification

### Tujuan Fitur
Menghilangkan mock data hardcoded pada tab Profile (`Total Latihan: 24` dan `Total Tonase: 128 Ton`) dan menyelaraskannya dengan single source of truth yang sama persis dengan tab Analytics (`useAnalyticsStore` dan `analyticsService`).

### Perubahan Utama
1. **Penyelarasan Sumber Data**:
   - `Total Latihan` kini mengambil `summary.totalWorkouts` (yaitu `COUNT(completed sessions)`).
   - `Total Tonase` kini mengambil `summary.totalVolume` (yaitu `SUM(total_volume)`).
2. **Format Tonase Terstandarisasi (`formatTonnage`)**:
   - Jika volume $\ge 1.000$ kg: dikonversi dan diformat menjadi satuan ton bersih (contoh: `12.8` dengan unit `Ton beban`).
   - Jika volume $< 1.000$ kg: ditampilkan dalam satuan kilogram berformat lokal (contoh: `850` dengan unit `kg beban`).
3. **Fallback Name Hygiene**:
   - Mengganti fallback hardcoded `"Ahmad"` menjadi `"Sobat Gym"`, seragam dengan sapaan di tab Home.

---

## Phase 7E: UI Hierarchy & Layout Refactor (Home & Active Workout)

### Tujuan Fitur
Meningkatkan UX Hierarchy dan Layout Quality pada 2 layar inti aplikasi: **Home** dan **Active Workout**, menghilangkan dashboard syndrome, mencegah layout shift pada rest timer, dan menyajikan performa sesi sebelumnya (*Previous Performance*) secara instan tanpa mengorbankan kecepatan interaksi gym.

### Perubahan Utama

1. **Active Workout (`src/app/workout/active.tsx`)**:
   - **Previous Performance Anchor**: Menampilkan data performa sesi terakhir (`Sesi Terakhir: 80 kg × 8 reps`) tepat di bawah nama gerakan menggunakan `prService.getExerciseProgress(exerciseId)`.
   - **Compact Exercise Stepper Navigator**: Mengganti 2 tombol navigasi raksasa di bagian bawah layar (`← Gerakan Sebelumnya` dan `Gerakan Berikutnya →`) dengan kontrol pill compact di atas nama latihan: `‹ Gerakan 2 / 5 ›`. Menghemat lebih dari 65px ruang vertikal.
   - **Rest Timer Terintegrasi ke Header**: Menghilangkan layout shift (dorongan konten ke bawah) saat rest timer aktif. Stopwatch dan countdown istirahat kini bertempat di top navigation bar dengan aksi tombol `+30d`, `Jeda/Lanjut`, dan `Lewati` yang terintegrasi rapi.
   - **Penyelarasan Hierarki Visual (L1/L2/L3)**:
     - **L1**: Nama Latihan, Input Beban & Reps, Floating CTA `Simpan Set`.
     - **L2**: Sesi Terakhir, Set yang Sedang Berjalan, Timer.
     - **L3**: Quick Stepper buttons (`+2.5`, `+5`, `+1`), riwayat set selesai.

2. **Home Screen (`src/app/(tabs)/home.tsx`)**:
   - **Single Prominent Hero**: Mengangkat *"Rencana Latihan Hari Ini"* sebagai satu-satunya elemen fokus utama (Hero) yang menyajikan Nama Program, Jumlah Gerakan, Estimasi Durasi, dan tombol CTA utama `Mulai Latihan →`.
   - **Eliminasi Dashboard Syndrome**: Menghilangkan widget ringkasan 3 kolom aktivitas 7 hari terakhir yang menduplikasi isi dari tab Analytics, sehingga perhatian pengguna tidak terpecah.
   - **Secondary De-emphasis**: Menjadikan Rekor Angkatan Pribadi (PR) dan Riwayat Latihan Terakhir sebagai elemen pendukung (L2/L3) dengan tipografi yang tenang (Sentence Case, font-bold) tanpa penggunaan warna oranye agresif yang tidak perlu.

3. **Anti-Slop & Design Consistency**:
   - Menghilangkan badge dan divider berlebih.
   - Mengatur penggunaan warna oranye `#FC4C02` secara eksklusif hanya untuk Primary CTA, Active State, dan PR badge.
   - Menyesuaikan spacing sesuai skala token: `8`, `12`, `16`, `24`, `32`.

---

## Phase 8: Motion Optimization (Fast, Physical, Precise)

### Tujuan Fitur
Mengoptimalkan pergerakan dan feedback mikro-interaksi di seluruh aplikasi sesuai Motion Design Philosophy:
- **No decorative animation**: Tidak ada animasi melayang, confetti, bounce/overshoot berlebihan, atau paralaks.
- **Tujuan Gerak**: Setiap animasi wajib *explain state*, *confirm actions*, atau *improve spatial orientation*.
- **Karakter**: Cepat ($\le 250$ms), Fisik (haptic feedback instan), Presisi (Reanimated UI thread worklets tanpa frame drops).

### Implementasi Berdasarkan Prioritas

#### P0 (Action & State Critical)
1. **Complete Set (`src/app/workout/active.tsx`)**:
   - Entry animasi baris set baru: `FadeInDown.duration(200).easing(Easing.bezier(0.23, 1, 0.32, 1))`.
   - Menegaskan bahwa set berhasil dicatat secara instan tanpa menggeser fokus pengguna.
2. **Rest Timer (`src/app/workout/active.tsx`)**:
   - Masuknya countdown timer di header menggunakan `FadeIn.duration(150)`.
   - Audio-tactile feedback: Tepat pada countdown $\le 3$ detik, haptic tick (`Haptics.impactAsync(Light)`) terpicu untuk menyiapkan atlet mengangkat beban kembali tanpa harus terus menatap layar.
3. **Navigation Tabs (`src/app/(tabs)/_layout.tsx`)**:
   - `TabBarItemButton` kustom dengan `useAnimatedStyle` & `withSpring({ damping: 18, stiffness: 350 })`.
   - Skala mikro $0.92$ saat ditekan + `Haptics.selectionAsync()` untuk konfirmasi fisik instan saat berpindah tab.
4. **PR Experience (`src/app/workout/active.tsx`)**:
   - Badge PR modal muncul dengan `FadeInDown.duration(250)` dipadukan dengan getaran `Haptics.notificationAsync(Success)`.
   - Memberikan konfirmasi pencapaian rekor tanpa confetti atau penundaan interaksi gym.
5. **Session Complete Experience (`src/app/workout/active.tsx`)**:
   - Summary modal muncul terstruktur dengan `FadeInDown.duration(250)` + `Haptics.notificationAsync(Success)`.
   - Menutup sesi secara tegas dan memandu pengguna melihat ringkasan volume tanpa friksi.

#### P1 (Orientation & Content Hierarchy)
6. **Hero Workout Card (`src/components/ui/Card.tsx`)**:
   - Komponen `Card` interaktif mendukung `onPress` dengan mikro-kompresi fisik `scale: 0.98` (`withSpring({ damping: 15, stiffness: 300 })`) dan `Haptics.impactAsync(Light)`.
7. **Empty State (`src/components/ui/EmptyState.tsx`)**:
   - Transisi muncul yang halus dan cepat melalui `Animated.View entering={FadeIn.duration(200)}`.
8. **Analytics Entrance (`src/app/(tabs)/analytics.tsx`)**:
   - Staggered entrance card ringkas (5 sections) menggunakan `FadeInDown.duration(200).delay(idx * 50)`.
   - Membantu orientasi mata atlet saat membaca metrik mingguan, insight, total statistik, tren bulanan, dan distribusi otot secara berurutan.

---

## Phase 9: UI Synchronization with DESIGN.md

### Tujuan Fitur
Menyelaraskan seluruh antarmuka (UI), hirarki visual, tata letak (layout), dan token desain aplikasi agar 100% patuh terhadap spesifikasi [DESIGN.md](file:///d:/ngegymYuk/DESIGN.md) terbaru (Athletic Performance Dashboard for Lifters), tanpa mengubah alur bisnis, database, skema Supabase, maupun routing navigasi.

### Perubahan Utama

1. **Color System & Design Tokens (`tailwind.config.js`)**:
   - **Primary**: Berganti ke **Performance Lime (`#C7FF41`)** untuk Primary CTA button, active state, dan progress indicator.
   - **Accent**: Menambahkan **Electric Blue (`#4DA6FF`)** khusus analitik data, line charts, dan insight visual.
   - **Canvas & Surfaces**: Background `#080808`, Surface `#101010`, Elevated `#171717`, Border `rgba(255,255,255,0.08)`.

2. **Navigation: Floating Performance Dock (`src/app/(tabs)/_layout.tsx`)**:
   - Menghilangkan bottom tab bar konvensional. Menggantinya dengan dock kapsul mengapung (`bottom: 16-24px`, `rounded-full`, semi-transparan `#171717`, elevated shadow).
   - Tab aktif bertransformasi dinamis menjadi kapsul penuh (`bg-[#C7FF41]` dengan icon & teks kontras tinggi `#080808`).

3. **Komponen Inti**:
   - **Button (`src/components/ui/Button.tsx`)**: Primary variant menggunakan `#C7FF41` dengan teks `#080808` tebal untuk kontras maksimal di bawah pencahayaan gym. Radius terstandarisasi `18px` (`h-56px` lg, `h-44px` md).
   - **Card (`src/components/ui/Card.tsx`)**: Radius terstandarisasi `24px` (`rounded-[24px]`), padding `20px` (`p-5`), border `rgba(255,255,255,0.08)`.
   - **Input (`src/components/ui/Input.tsx`)**: Tinggi terstandarisasi `56px` (`h-[56px]`), radius `16px` (`rounded-[16px]`).
   - **Modal (`AppModal.tsx`, `ConfirmModal.tsx`)**: Elevated surface `#171717`, border radius `24px`.

4. **Penyelarasan Layar (13 Screens)**:
   - **Home**: Command Center dengan Hero Performance Ring Goal (persentase target mingguan atletik), Weekly Stats metric strip, Last Workout, PR cards, dan primary CTA `START WORKOUT →`.
   - **Active Workout**: CTA terbesar `COMPLETE SET` dalam Performance Lime dengan teks gelap `#080808`, steppers compact, header stopwatch & countdown istirahat, serta perayaan PR dengan sentuhan Lime Glow.
   - **Analytics**: Weekly Volume Bar Chart beralih ke Performance Lime (`#C7FF41`), Monthly Frequency Line Chart beralih ke Electric Blue (`#4DA6FF`), dan kartu insight dengan aksen Electric Blue.
   - **Workout, Exercise Picker, History, Profile, Login, Register**: Seluruh token oranye hardcoded `#FC4C02` dibersihkan dan diselaraskan penuh dengan tema Performance Lime & Electric Blue.

---

## Phase RC: Rest Timer Audio & Feedback Improvements (P0 UX)

### Tujuan Fitur
Memastikan notifikasi penyelesaian waktu istirahat (Rest Timer) terdengar jelas, tidak tertunda, terasa di tangan pengguna melalui haptik kuat, dan terlihat jelas di layar saat berolahraga di gym.

### Perubahan Utama
1. **Audio Triple Beep (`assets/beep.wav` & `soundHapticService.ts`)**:
   - Menghapus ketergantungan remote HTTP URL audio yang memicu buffering delay hingga 800ms di Android.
   - Menggunakan asset audio lokal 16-bit PCM uncompressed dual-tone (988Hz B5 + 1975Hz harmonic) dengan full dynamic range (95% full scale).
   - Pola pemutaran Triple Beep: `beep (150ms) -> jeda 200ms -> beep (150ms) -> jeda 200ms -> beep (150ms)`.
   - Konfigurasi audio session `setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers' })` memastikan suara berbunyi bahkan saat ringer silent atau bersamaan dengan musik latar.
2. **Multi-Pulse Strong Haptic (`soundHapticService.ts`)**:
   - Pola 3 denyut haptik: `Warning Notification -> delay 200ms -> Heavy Impact -> delay 200ms -> Heavy Impact` untuk sensasi fisik yang tegas di saku/tangan pengguna.
3. **Visual Completion Feedback (`src/app/workout/active.tsx`)**:
   - Menampilkan status *"REST SELESAI"* pada header tengah dan banner animasi beraksen Performance Lime `⚡ REST SELESAI • SIAP UNTUK SET BERIKUTNYA` selama ~2 detik sebelum otomatis menghilang.

---

## Phase 10: Monthly Training Consistency Calendar (Analytics Screen)

### Tujuan Fitur
Menampilkan konsistensi latihan bulanan secara visual, cepat, dan mudah dipahami (< 2 detik) langsung di layar **Analisis** (`src/app/(tabs)/analytics.tsx`), tepat di bawah metrik hero volume dan di atas grafik mingguan.

Fitur ini membantu pengguna memantau:
1. Seberapa sering mereka berlatih di bulan berjalan.
2. Status streak latihan aktif saat ini (jumlah hari berturut-turut).
3. Pola hari latihan aktif vs hari istirahat/terlewat dalam tampilan grid kalender bulanan yang ringkas.

### Flow & Tampilan
- **Vertical Section Architecture (Tanpa Card-in-Card)**:
  1. **Section 1: Hero Volume 7 Hari Terakhir** (Kartu mandiri independen berfokus pada volume 5620kg dan status tren).
  2. **Section 2: Monthly Training Consistency Calendar** (Kartu mandiri independen untuk visualisasi konsistensi kalender bulanan, streak, dan hari aktif).
  3. **Section 3: Grafik Volume 7 Hari** (Kartu mandiri untuk bar chart atau empty state flat tanpa kartu di dalam kartu).
  4. **Section 4: Insight Minggu Ini** (Kartu mandiri dinamika beban, latihan tersering, dan kelompok otot dominan).
  5. **Section 5: Lifetime Totals** (Kartu mandiri total statistik keseluruhan).
  6. **Section 6: Frekuensi Bulanan** (Kartu mandiri line chart).
  7. **Section 7: Distribusi Otot** (Kartu mandiri persentase kelompok otot).
- **Header Kalender**:
  - Judul bulan & tahun dinamis sesuai tampilan aktif (contoh: *September 2026*, *Oktober 2026*).
  - Quick Reset Badge (`Hari Ini`) saat menelusuri bulan lain untuk kembali instan ke bulan berjalan.
  - **Month Step Navigation Arrows**: Tombol *Previous Month* dan *Next Month* (`chevron-back` & `chevron-forward`) dengan haptic feedback (`Haptics.impactAsync(Light)`).
  - Streak badge (`🔥 X Hari`) tetap konsisten menghitung streak beruntun saat ini.
- **Weekday Labels**: Strip baris hari Senin s/d Minggu (`Sen`, `Sel`, `Rab`, `Kam`, `Jum`, `Sab`, `Min`).
- **Calendar Grid (7-Kolom Simetris dengan Real Workout History)**:
  - Hari dengan latihan selesai: Indikator aktif berwarna **Performance Lime (`#C7FF41`)** dengan teks gelap kontras tinggi.
  - Hari ini (belum latihan): Indikator border `2px` lime tegas dengan background halus.
  - Hari lewat tanpa latihan: Permukaan istirahat subtle (`bg-white/[0.025]`) dengan teks abu-abu netral (`#71717A`).
  - Hari mendatang (Upcoming): Distinct upcoming style (`bg-white/[0.02]` border `border-white/[0.06]` teks `text-zinc-400 font-semibold`) tanpa pemudaran agresif.
- **Micro Legend & Footer**: Keterangan mini (Latihan vs Istirahat) serta ringkasan dinamis jumlah hari aktif di bulan yang sedang ditampilkan.

### Database & Data Source
- Menggunakan data riwayat latihan `completed workout_sessions` melalui `useHistoryStore` (`sessions`).
- Tidak ada penambahan tabel atau skema database baru.

### State & Logic
- Perhitungan kalender bulan berjalan, offset awal hari Senin, identifikasi tanggal lokal WIB/perangkat, streak beruntun, serta penghitungan sesi bulanan dimemoized menggunakan `useMemo`.

### Notes
- Sesuai prinsip anti-slop dan panduan `DESIGN.md`: Tidak menggunakan card-in-card berlebihan, tidak ada dekorasi timeline berulang, ukuran touch dan layout ramah mobile (thumb-friendly).

---

## Phase 11: Weekly Training Rhythm Audit & Calendar Correctness (History Screen)

### Tujuan Fitur
Menjamin akurasi matematis perhitungan kalender mingguan (*Weekly Consistency Rhythm Strip*) pada tab **Riwayat** (`src/app/(tabs)/history.tsx`) agar 100% dinamis, otomatis melakukan *week rollover* saat berganti minggu, tahan terhadap pergantian bulan/tahun, serta menghitung jumlah hari aktif unik (*unique active days*) secara presisi.

### Verifikasi & Logika Perhitungan
1. **Dinamis Tanpa Tanggal Hardcoded**:
   - Dihitung dari `new Date()` lokal perangkat pengguna.
   - Menggunakan formula `mondayOffset = currentDay === 0 ? -6 : 1 - currentDay` sehingga hari Senin selalu menjadi awal pekan ($T+0$) dan Minggu ($T+6$) sebagai penutup pekan.
2. **Perhitungan Hari Aktif Unik (Unique Active Days)**:
   - Metrik *"X dari 7 hari"* menghitung jumlah hari kalender unik yang memiliki sesi latihan (`uniqueActiveDaysCount`), bukan jumlah total sesi latihan (misalnya: jika pengguna latihan 2 sesi di hari Selasa, tetap dihitung sebagai 1 hari aktif).
3. **Format Tanggal Lokal (Timezone-Safe)**:
   - Menggunakan `getLocalDateKey(date)` (`YYYY-MM-DD` waktu lokal) untuk mencocokkan tanggal sesi latihan, mencegah pergeseran timezone (WIB UTC+7) yang sering memindahkan sesi malam ke hari sebelumnya pada pemanggilan `toISOString()`.
4. **Week Rollover Otomatis**:
   - Hari Minggu (contoh: 20 Sep 2026) tetap berada di pekan berjalan (`14 - 20 Sep 2026`).
   - Hari Senin berikutnya (21 Sep 2026 pukul 00:00) secara otomatis bergulir (*rollover*) menampilkan pekan baru (`21 - 27 Sep 2026`).
5. **Transisi Batas Bulan & Tahun**:
   - Transisi bulan (contoh: 28 Sep - 4 Okt 2026) otomatis menampilkan rentang bulan yang akurat.
   - Transisi tahun (contoh: 28 Des 2026 - 3 Jan 2027) secara otomatis menyertakan label tahun pada kedua sisi rentang tanggal.

---

## Phase 12: Modal Audit & Lightweight Dialog Polish

### Tujuan Fitur
Menghilangkan kesan *card-in-card* dan beban visual berlebih pada modal utilitas kecil (seperti *Rename Workout*, *Create Workout*, *Configure Exercise*, dan *ConfirmModal*), menjadikannya ringkas, cepat, dan berfokus pada alur input data atlet sesuai standar Apple Fitness, Linear, dan Notion Mobile.

### Aturan Hirarki Baru
- **Modal = Primary Container**: Permukaan modal (`#161616`, radius 20px, padding 20px) bertindak sebagai satu-satunya bingkai pembungkus.
- **Input = Secondary Surface**: Input teks langsung berada di bawah judul tanpa lapisan kartu pembungkus perantara atau sub-label redundan.
- **Actions = Clean Compact Strip**: Tombol aksi berukuran medium (`size="md"`, `h-[44px]`) dengan jeda ringkas (`gap-2.5`) tepat di bawah input.
- **Hirarki Tunggal**: `Title` $\rightarrow$ `Input` $\rightarrow$ `Actions` tanpa dekorasi atau seksi terselubung di dalam modal.

---

## Phase 13: Login & Register Input System Refinement

### Tujuan Fitur
Meningkatkan pengalaman formulir autentikasi (*Login* & *Register*) agar terasa seperti aplikasi kebugaran premium (*Apple Fitness, Linear, Notion Mobile, Arc Search, Hevy*), bukan formulir web admin generik yang berat.

### Peningkatan Komponen Input (`src/components/ui/Input.tsx`)
1. **Lime Active Focus State**:
   - Saat input aktif/focused, border beralih secara dinamis ke **Performance Lime (`#C7FF41`)** dan background sedikit terangkat ke `#141414`.
   - Label teks di atas input menyala dalam warna `#C7FF41` untuk memberikan sinyal visual yang tegas kepada atlet.
   - Text selection color selaras dalam `#C7FF41`.
2. **Integrated Field Icons**:
   - Mendukung prop `leftIcon` untuk ikon penjelas input yang terintegrasi rapi di sisi kiri (`mail-outline`, `lock-closed-outline`, `person-outline`, `shield-checkmark-outline`).
3. **Password Eye Icon Toggle**:
   - Mengganti tombol toggle teks manual ("Tampilkan" / "Sembunyikan") dengan tombol ikon mata yang elegan (`eye-outline` / `eye-off-outline`), didukung touch target melingkar dengan `hitSlop` luas (12px).
4. **Ergonomi & Kontras Placeholder**:
   - Placeholder contrast disesuaikan ke `#71717A` (kontras tinggi di dark mode tanpa terkesan seperti isian aktif).
   - Tinggi input terstandarisasi `54px` dengan radius `16px` (`rounded-[16px]`), ramah sentuhan satu tangan di gym.
5. **Harmonisasi Form Login & Register**:
   - Form Login ([`login.tsx`](file:///d:/ngegymYuk/src/app/(auth)/login.tsx)) dan Register ([`register.tsx`](file:///d:/ngegymYuk/src/app/(auth)/register.tsx)) kini memiliki ritme visual, spasi, dan ikonografi terpadu.---

## Phase 14: Global Input System Refactor

### Tujuan Fitur
Menjadikan standar input formulir Login dan Register sebagai **Single Source of Truth** untuk seluruh elemen input teks, numerik, pencarian, dan modal di seluruh aplikasi ngegymYuk. Mengeliminasi inkonsistensi tinggi, radius, placeholder, focus state, dan touch target tanpa mengubah flow, validasi, ataupun logika bisnis aplikasi.

### Spesifikasi Standar Input Global (`src/components/ui/Input.tsx`)
1. **Dimensi & Geometri**:
   - **Tinggi**: Standar universal `56px` (`h-[56px]`).
   - **Radius**: `18px` (`rounded-[18px]`).
   - **Padding**: Horizontal `16px` (`px-4`), diatur dinamis menjadi `pl-12` jika terdapat `leftIcon`.
2. **Focus State & Micro-Interactions**:
   - **Border Focused**: Performance Lime (`#C7FF41`) dengan glow subtil (`shadow-sm shadow-lime-950/20`).
   - **Background Focused**: `#141414` (surface terangkat dari idle `#0D0D0D`).
   - **Label Feedback**: Label berubah dinamis menjadi `#C7FF41` saat input aktif/focused.
   - **Kursor & Seleksi**: `cursorColor="#C7FF41"` dan `selectionColor="rgba(199, 255, 65, 0.3)"`.
3. **Typography & Placeholder**:
   - Text: `text-[15px] font-semibold text-white`.
   - Placeholder: `#71717A` (kontras ideal: terbaca jelas sebagai petunjuk/hint tanpa menyerupai value).
4. **Password & Search Inputs**:
   - **Password**: Menggunakan toggle ikon mata terpadu (`Ionicons eye-outline` / `eye-off-outline`) dengan `hitSlop={12}` (bukan tombol teks).
   - **Search**: Pola konsisten `[search-outline] Search...` dengan tombol clear `close-circle` yang otomatis muncul saat ada query pencarian.
5. **Numeric Workout Inputs** (`active.tsx`):
   - Kontainer input berat (kg) & repetisi (reps) diselaraskan ke background `#101010`, border `white/[0.08]`, dan radius `rounded-[18px]`, dengan kursor & selection color `#C7FF41` menjaga visual atletis ukuran `text-3xl font-black`.

### Layar & Komponen yang Diperbarui
- `src/components/ui/Input.tsx` (Komponen inti Single Input System)
- `src/app/(auth)/login.tsx` (Autentikasi masuk)
- `src/app/(auth)/register.tsx` (Autentikasi pendaftaran)
- `src/app/(tabs)/exercises.tsx` (Search Library Latihan)
- `src/features/workouts/components/ExercisePickerModal.tsx` (Search & Modal Tambah Latihan)
- `src/features/workouts/components/ConfigureExerciseModal.tsx` (Modal Konfigurasi Set, Reps, Rest Timer)
- `src/app/(tabs)/workout.tsx` (Modal Ubah Nama & Buat Workout Baru)
- `src/app/workout/active.tsx` (Numeric Weight & Reps Controller)
- `src/app/(tabs)/profile.tsx` (Metrik Beban kg & Audit Field Akun)

---

## Phase 15: Full Anti-Slop Copywriting Audit

### Tujuan Fitur
Melakukan peninjauan menyeluruh (*Full Copywriting Audit*) dan penulisan ulang seluruh teks, microcopy, label, empty states, toasts, dan pesan error di seluruh aplikasi ngegymYuk. Memastikan setiap kalimat terdengar seperti produk kebugaran nyata (*Hevy, Strong, Apple Fitness, Nike Run Club*), natural bagi lifter sungguhan, serta bebas dari motivational fluff, bahasa korporat, repetisi kata, dan pola kalimat buatan AI.

### Prinsip Copywriting Anti-Slop
1. **Direct & Action-Oriented**: Gunakan kata kerja langsung (contoh: *"Simpan Set"* bukan *"Selesaikan target latihan"*).
2. **Lifter-Authentic Tone**: Menggunakan bahasa gym yang biasa diucapkan lifter (contoh: *"Log Latihan"*, *"Volume"*, *"Set"*, *"Reps"*).
3. **Tanpa Artificial Grandeur**: Menghapus gelar dan badge buatan seperti *"AKUN ATLET TERVERIFIKASI"*, *"Member Aktif • Atletik"*, *"Selamat Datang Atlet"*.
4. **Natural Empty States**: To the point tanpa kalimat bertele-tele (contoh: *"Belum Ada Latihan"* bukan *"Belum ada item atau data yang dapat ditampilkan saat ini"*).
5. **Human Error Messages**: Pesan kegagalan yang ringkas dan solutif (contoh: *"Email atau password salah"* bukan *"Terjadi kesalahan saat memproses permintaan Anda"*).

### Layar & Modul yang Diperbarui
- `src/app/(auth)/login.tsx`: Menghapus "Selamat Datang, Lifter" dan "MASUK KE DASHBOARD →" menjadi "Masuk ke Akun" dan "Masuk".
- `src/app/(auth)/register.tsx`: Menghapus "AKUN ATLET TERVERIFIKASI" dan "Registrasi Lifter Baru" menjadi "Daftar Akun Baru", "Buat Akun", dan tombol "Daftar".
- `src/app/(tabs)/home.tsx`: Menghapus "START WORKOUT →" menjadi "Mulai Latihan →", "Aktivitas Terakhir" menjadi "Latihan Terakhir", dan standardisasi label volume.
- `src/app/(tabs)/workout.tsx`: Standardisasi istilah "Template latihan", aksi "Buat Template", dan pembersihan teks empty state.
- `src/app/workout/[id].tsx`: Standardisasi istilah "Latihan" (menggantikan "Gerakan Terdaftar"), tombol aksi "+ Tambah Latihan", dan konfirmasi modal.
- `src/features/workouts/components/ExercisePickerModal.tsx`: Header "Pilih Latihan", label "Target Set", "Target Repetisi", "Waktu Istirahat", dan empty state ringkas.
- `src/app/workout/active.tsx`: Tombol utama diganti menjadi "Simpan Set • {weight} kg × {reps} reps", banner rest "Istirahat Selesai", konfirmasi "Selesai Latihan" & "Hapus Sesi Latihan", serta ringkasan "Simpan & Tutup".
- `src/app/(tabs)/history.tsx`: Segmented control menjadi "Log Latihan" dan "Rekor Pribadi (PR)", empty state menjadi "Belum Ada Log Latihan".
- `src/app/history/[id].tsx`: Standardisasi metrik menjadi "Volume" (bukan "Total Beban").
- `src/app/history/progress.tsx`: Empty state diselaraskan menjadi "Belum Ada Log Latihan".
- `src/app/(tabs)/analytics.tsx`: Mengubah header menjadi "Statistik" (bukan KPI korporat "Analisis"), "Tren Volume", "Latihan Terbanyak", "Otot Terbanyak Dilatih", dan "Total Latihan".
- `src/app/(tabs)/profile.tsx`: Menghapus badge buatan "Member Aktif • Atletik", menyelaraskan metrik menjadi "Sesi Latihan" dan "Total Volume".
- `src/components/ui/EmptyState.tsx`: Fallback text disederhanakan menjadi "Belum ada data untuk ditampilkan saat ini.".
- `src/features/auth/utils/authError.ts`: Pesan error disederhanakan tanpa basa-basi korporat.

---

## Phase 16: Product Consistency & Real Data Integrity

### Masalah
Kartu di layar utama sebelumnya memuat target artifisial *"Target Pekan Ini: 2 dari 4 Sesi (50% TARGET)"*. Karena aplikasi belum memiliki fitur pengaturan target sesi mingguan oleh pengguna, angka "4 sesi" dan persentase tersebut tidak memiliki *source of truth* dan menyesatkan pengguna (*synthetic targets & fake percentages*).

### Solusi & Implementasi
1. **Penghapusan Target Sintetis**:
   - Menghapus bahasa berbasis target palsu (`"Target Pekan Ini"`, `"2 dari 4 Sesi"`, `"50% TARGET"`, `goalPercentage`).
2. **Berbasis 100% Data Nyata Pengguna**:
   - Kartu diganti menjadi **"Aktivitas Pekan Ini"**.
   - Menampilkan jumlah sesi latihan nyata dalam 7 hari terakhir dari store analitik (`summary.weeklyWorkoutsCount`).
   - Menampilkan total volume beban nyata dalam 7 hari terakhir (`summary.weeklyVolume`).
   - Badge kanan menampilkan counter angka sesi nyata yang telah diselesaikan (`{currentWeeklyWorkouts} Sesi`).
3. **Pemberdayaan Zero State**:
   - Jika pengguna belum berlatih di pekan ini: menampilkan `"Belum Ada Latihan"` dan instruksi *"Mulai sesi pertama pekan ini untuk mencatat beban"*.

---

## Phase 17: Anti-Slop UI & Layout Mobile Refactor

### Tujuan
Mengeliminasi seluruh sisa *UI slop* (sindrom *card-in-card*, *dashboard syndrome*, kompetisi warna aksen, dan duplikasi metrik) untuk mentransformasikan aplikasi dari sekadar "working MVP" menjadi "premium native fitness app" (berkiblat ke Hevy, Strong, dan Apple Fitness) tanpa mengubah skema basis data, flow aplikasi, maupun logika bisnis.

### Perubahan Utama

1. **Active Workout (`src/app/workout/active.tsx`)**:
   - Mengeliminasi struktur berlapis *Card-in-Card* (Weight Box, Reps Box, Stepper yang sebelumnya bersarang di dalam `#101010` di dalam `#161616`).
   - Seluruh input Beban & Repetisi kini berada langsung di satu permukaan datar `#121212` dengan angka besar `text-4xl font-black` dan garis pemisah halus (`white/[0.06]`).
   - Tombol stepper kuadran (`-5, -2.5, +2.5, +5`) diintegrasikan langsung pada elevasi yang sama tanpa kontainer ganda.

2. **Analytics (`src/app/(tabs)/analytics.tsx`)**:
   - Menghilangkan *Dashboard Syndrome* (7 kartu widget bertumpuk dengan bobot visual seragam).
   - Membangun hierarki 4 tingkatan jelas:
     - **Tingkat A**: *Primary Hero Metric* (Total Tonase Beban Mingguan `text-4xl font-black` dengan indikator sesi aktual).
     - **Tingkat B**: *Training Consistency Calendar* (Grid kalender 28 hari ritme latihan tanpa border tebal ganda).
     - **Tingkat C**: *Weekly Trend* (Diagram batang 7 hari langsung pada permukaan `#121212`).
     - **Tingkat D**: *Muscle Distribution* (Distribusi kelompok otot dengan progress bar minimalis).
   - Sub-metrik frekuensi (*Latihan Terbanyak* & *Otot Terbanyak*) disatukan dalam strip pembagi di bawah grafik tren.
   - Mengeliminasi aksen biru `#4DA6FF` dan menyatukan semua aksen performa ke *Performance Lime* `#C7FF41`.

3. **Hero Template Card (`src/features/workouts/components/HeroTemplateCard.tsx`)**:
   - Mengeliminasi *Stats Summary Strip* dan kontainer latihan berlapis.
   - Nama template dan tombol utama `"Mulai Latihan"` menjadi fokus visual nomor satu.
   - Daftar pratinjau latihan disajikan sebagai baris tipografi bersih dengan bullet dot tanpa border box individual.

4. **Home Dashboard (`src/app/(tabs)/home.tsx`)**:
   - Menghilangkan masalah *Triple Counting* (di mana jumlah sesi latihan muncul di headline, badge, dan strip metrik secara bersamaan).
   - Menjadikan total tonase beban mingguan (`Weekly Volume`) sebagai headline hero utama yang berwibawa.
   - Menampilkan ringkasan ringkas 2-kolom untuk sesi latihan dan rekor PR.

5. **Profile Screen (`src/app/(tabs)/profile.tsx`)**:
   - Mentransformasi tampilan dari *admin panel / settings dashboard* menjadi profil atlet terpadu.
   - Menyatukan statistik latihan (*Sesi Latihan*, *Total Jam*, *Total Volume*) ke dalam satu kontainer elevasi `#121212` dengan pembagi vertikal halus.
   - Mengelompokkan status akun dan aplikasi ke dalam satu permukaan bersih.

6. **Workout Detail (`src/app/workout/[id].tsx`)**:
   - Menghilangkan kesan "form edit konfigurasi" pada daftar latihan.
   - Tombol reorder diperkecil menjadi panah minimalis (28×28px), dan spesifikasi target (`{sets} set × {reps} reps`) disajikan secara inline langsung di samping nama latihan.

7. **Auth Screens (`src/app/(auth)/login.tsx` & `register.tsx`)**:
   - Menghapus pill marketing *"Encrypted Cloud Sync & Offline Support"* di bagian bawah untuk menjaga kemurnian antarmuka autentikasi.



