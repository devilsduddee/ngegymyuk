# Product Requirements Document (PRD)

# ngegymYuk

## Problem Statement

Banyak pengguna gym masih mencatat program latihan, progres beban, repetisi, dan durasi workout secara manual menggunakan notes atau spreadsheet. Cara ini kurang praktis, sulit dianalisis, dan berisiko kehilangan data.

Pengguna membutuhkan aplikasi yang memungkinkan mereka untuk:

- Membuat workout plan sendiri.
- Mencari exercise berdasarkan kelompok otot.
- Mencatat progres latihan (weight, set, reps).
- Mengetahui Personal Record (PR).
- Menggunakan timer workout dan rest timer otomatis.
- Melihat histori serta statistik latihan.
- Menyimpan data melalui cloud sync agar dapat diakses dari berbagai perangkat.

---

## Goals

### Business Goals

- Meningkatkan user retention melalui fitur progress tracking.
- Menjadi aplikasi pendamping workout harian.
- Membangun habit tracking latihan jangka panjang.
- Menyediakan sinkronisasi data lintas perangkat.

### User Goals

- Menyusun workout routine sendiri.
- Menemukan exercise sesuai target otot.
- Mencatat progres latihan dengan cepat.
- Melihat perkembangan kekuatan dan volume latihan.
- Menggunakan rest timer otomatis.
- Mengakses histori workout kapan saja.

---

## Target Users

### Beginner Gym Goers

- Baru mulai gym.
- Membutuhkan referensi exercise berdasarkan otot.
- Ingin mencatat progres secara sederhana.

### Intermediate Lifters

- Sudah memiliki program latihan sendiri.
- Fokus pada progressive overload.
- Membutuhkan histori latihan yang lengkap.

### Advanced Lifters

- Melacak volume latihan secara detail.
- Memantau personal record dan performa historis.
- Menginginkan statistik latihan yang akurat.

---

## User Stories

### Workout Planning

**US-01**
Sebagai pengguna, saya ingin membuat workout list sendiri agar dapat mengikuti program latihan yang sesuai kebutuhan.

**US-02**
Sebagai pengguna, saya ingin menambahkan exercise ke workout list agar sesi latihan tersusun dengan baik.

**US-03**
Sebagai pengguna, saya ingin mencari exercise berdasarkan nama agar cepat menemukan gerakan yang diinginkan.

**US-04**
Sebagai pengguna, saya ingin memfilter exercise berdasarkan muscle group agar mudah menyusun program latihan.

### Workout Tracking

**US-05**
Sebagai pengguna, saya ingin memulai workout session agar progres latihan dapat direkam.

**US-06**
Sebagai pengguna, saya ingin mencatat weight, set, dan reps untuk setiap exercise agar perkembangan latihan terdokumentasi.

**US-07**
Sebagai pengguna, saya ingin menggunakan rest timer yang telah diatur saat menyusun workout agar waktu istirahat konsisten.

**US-08**
Sebagai pengguna, saya ingin menerima notifikasi suara saat rest timer selesai agar tidak perlu terus melihat layar.

**US-09**
Sebagai pengguna, saya ingin melihat durasi workout yang sedang berjalan agar mengetahui lama sesi latihan.

### Progress & Analytics

**US-10**
Sebagai pengguna, saya ingin melihat histori latihan agar dapat memantau perkembangan saya.

**US-11**
Sebagai pengguna, saya ingin melihat Personal Record (PR) agar mengetahui performa terbaik saya.

**US-12**
Sebagai pengguna, saya ingin melihat total volume latihan, total set, dan durasi workout agar dapat mengevaluasi program latihan saya.

### Account & Sync

**US-13**
Sebagai pengguna, saya ingin login menggunakan akun agar data tersimpan di cloud.

**US-14**
Sebagai pengguna, saya ingin mengakses data yang sama dari perangkat berbeda melalui cloud sync.

---

## Functional Requirements

### FR-01 Authentication

- User dapat register menggunakan email dan password.
- User dapat login.
- User dapat logout.
- User dapat reset password.
- Data tersimpan berdasarkan akun pengguna.
- Data tersinkronisasi setelah login.

### FR-02 Exercise Library

Sistem menyediakan database exercise.

Setiap exercise memiliki:

- Nama exercise
- Primary muscle
- Secondary muscle
- Equipment
- Deskripsi
- Gambar atau animasi gerakan

User dapat melakukan:

- Search berdasarkan nama exercise.
- Filter berdasarkan muscle group.
- Filter berdasarkan equipment.

Contoh muscle group:

- Chest
- Back
- Shoulders
- Biceps
- Triceps
- Forearms
- Abs
- Quads
- Hamstrings
- Glutes
- Calves

### FR-03 Workout List Management

User dapat:

- Membuat workout list.
- Mengubah workout list.
- Menghapus workout list.
- Menambahkan exercise.
- Menghapus exercise.
- Mengatur urutan exercise.
- Menyimpan workout list sebagai template.

Contoh:

Push Day

1. Bench Press
2. Incline Bench Press
3. Dips
4. Tricep Pushdown

### FR-04 Exercise Configuration

Saat menyusun workout list, user dapat menentukan:

- Target set.
- Target reps.
- Rest timer per exercise.

Contoh:

Bench Press

- 4 set
- 8 reps
- Rest timer 120 detik

### FR-05 Workout Session

Saat workout dimulai:

- Workout timer berjalan otomatis.
- Menampilkan exercise aktif.
- Menampilkan target set dan reps.
- Menampilkan progres set yang telah selesai.

User dapat:

- Input weight.
- Input reps aktual.
- Menandai set selesai.
- Berpindah ke exercise berikutnya.
- Mengakhiri workout.

### FR-06 Rest Timer

Setelah set selesai:

- Rest timer berjalan otomatis.
- User dapat pause timer.
- User dapat skip timer.
- User dapat restart timer.

Saat timer selesai:

- Sistem mengeluarkan notifikasi suara.
- Sistem menampilkan notifikasi visual.

### FR-07 Personal Record (PR)

Sistem menghitung PR secara otomatis untuk setiap exercise.

Jenis PR:

#### Weight PR

Beban tertinggi yang pernah dicapai.

#### Volume PR

Volume = Weight × Reps × Set

#### Estimated 1RM PR

1RM = Weight × (1 + Reps / 30)

### FR-08 Workout History

Setelah workout selesai sistem menyimpan:

- Tanggal workout.
- Nama workout.
- Total durasi workout.
- Daftar exercise.
- Weight per set.
- Reps per set.
- Total set.
- Total volume.

### FR-09 Analytics Dashboard

#### Per Workout

- Total duration.
- Total exercises.
- Total sets.
- Total volume.

#### Per Muscle Group

- Total volume.
- Total sets.
- Frekuensi latihan.

#### Per Exercise

- Weight PR.
- Volume PR.
- Estimated 1RM PR.
- Riwayat progres.

### FR-10 Cloud Sync

- Data tersimpan otomatis ke cloud.
- Data tersinkronisasi antar perangkat.
- Data dapat dipulihkan saat login kembali.

---

## Non Functional Requirements

### Performance

- Login < 2 detik.
- Search exercise < 1 detik.
- Load workout history < 2 detik.
- Cloud sync < 5 detik.

### Reliability

- Auto-save setelah setiap set selesai.
- Tidak kehilangan data ketika aplikasi tertutup tiba-tiba.
- Uptime minimal 99,5%.

### Security

- Password terenkripsi.
- HTTPS untuk seluruh komunikasi.
- User hanya dapat mengakses data miliknya sendiri.
- Mendukung JWT Authentication.

### Scalability

- Mendukung minimal 100.000 pengguna.
- Mendukung jutaan workout records.

### Usability

- Memulai workout maksimal 3 klik.
- Input hasil set kurang dari 5 detik.
- UI mudah digunakan saat berada di gym.

---

## Scope

### MVP (Version 1)

#### Authentication

- Register
- Login
- Logout
- Cloud Sync

#### Exercise Library

- Search exercise
- Filter muscle group

#### Workout List

- Create workout list
- Edit workout list
- Delete workout list
- Add exercise
- Configure set, reps, dan rest timer

#### Workout Tracking

- Start workout
- Input weight
- Input reps
- Input set
- End workout

#### Timer

- Workout duration timer
- Rest timer
- Sound notification

#### PR Tracking

- Weight PR
- Volume PR
- Estimated 1RM PR

#### History & Analytics

- Workout history
- Total sets
- Total volume
- Total duration
- Exercise progress history

---

### Future Scope (Version 2)

#### Analytics

- Progress charts
- Weekly statistics
- Monthly statistics
- Muscle volume charts

#### Smart Features

- Auto PR detection
- Progressive overload recommendation
- Workout streak tracking

#### Social Features

- Share workout
- Share PR achievement
- Community workout templates

---

## Out of Scope

- Nutrition tracking
- Calorie tracking
- Meal planning
- Smartwatch integration
- AI workout coach
- Community forum
- Video recording workout

---

## Success Metrics (KPI)

- 80% user berhasil membuat workout list pertama dalam 24 jam.
- 60% user mencatat minimal 3 workout per minggu.
- 70% workout session diselesaikan hingga end workout.
- D30 Retention ≥ 35%.
- 95% cloud sync berhasil tanpa error.
- Rata-rata durasi penggunaan ≥ 20 menit per workout session.