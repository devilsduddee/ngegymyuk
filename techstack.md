# Tech Stack

# ngegymYuk Mobile App

## Overview

ngegymYuk adalah aplikasi mobile untuk mencatat workout, membuat workout plan, melacak progres latihan, melihat personal record (PR), dan menyimpan seluruh data secara cloud-sync.

Target platform:

- Android
- iOS

---

# Frontend

## Framework

### React Native + Expo

Alasan:

- Satu codebase untuk Android dan iOS.
- Development lebih cepat.
- Mudah mengakses fitur mobile seperti notification, audio, dan storage.
- Mendukung OTA (Over The Air) Updates.

---

## Routing

### Expo Router

Alasan:

- File-based routing.
- Struktur project lebih rapi.
- Mudah di-maintain saat aplikasi berkembang.

Contoh:

app/
├── (auth)/
│ ├── login.tsx
│ └── register.tsx
├── (tabs)/
│ ├── home.tsx
│ ├── workout.tsx
│ ├── history.tsx
│ └── profile.tsx
└── workout/
└── [id].tsx

---

## Styling

### NativeWind

Alasan:

- Menggunakan Tailwind CSS syntax.
- Mempercepat development UI.
- Mudah membuat dark mode.
- Konsisten di seluruh aplikasi.

---

## State Management

### Zustand

Digunakan untuk:

- Active workout session.
- Running timer.
- User profile.
- Workout state.
- Rest timer state.

Alasan:

- Ringan.
- Simple.
- Tidak banyak boilerplate.

---

# Backend & Cloud

## Database

### Supabase PostgreSQL

Digunakan untuk:

- Menyimpan user.
- Menyimpan exercise database.
- Menyimpan workout template.
- Menyimpan workout history.
- Menyimpan PR records.

Alasan:

- Relational database.
- Real-time support.
- Mudah diintegrasikan dengan React Native.
- Built-in authentication.

---

## Authentication

### Supabase Auth

Metode login:

#### Email & Password

- Register akun baru.
- Login menggunakan email.
- Reset password.

#### Sign In With Google

- Login menggunakan akun Google.
- Akun otomatis dibuat jika belum ada.
- Mendukung Android dan iOS.

---

## Storage

### Supabase Storage

Digunakan untuk:

- Exercise images.
- Exercise GIF.
- App assets yang perlu disimpan di cloud.

---

# Notification & Timer

## Local Notification

### Expo Notifications

Digunakan untuk:

- Notifikasi rest timer selesai.
- Notifikasi workout reminder (future feature).

Contoh:

- "Rest selesai!"
- "Lanjut set berikutnya."

---

## Audio

### expo-av

Digunakan untuk:

- Sound notification.
- Chime notification.
- Beep notification saat timer selesai.

---

# Analytics

## Chart Library

### react-native-gifted-charts

Digunakan untuk:

- Progress weight chart.
- Volume chart.
- Weekly workout chart.
- Monthly workout chart.

---

# Form Validation

## Zod

Digunakan untuk:

- Login validation.
- Register validation.
- Workout input validation.
- Exercise form validation.

---

# Data Fetching

## Supabase Javascript SDK

Digunakan untuk:

- Query database.
- Authentication.
- Realtime sync.
- CRUD workout data.

---

# Local Persistence

## AsyncStorage

Digunakan untuk:

- Menyimpan session login.
- Cache workout data.
- Offline-first experience.

---

# Crash Reporting

## Sentry

Digunakan untuk:

- Error monitoring.
- Crash analytics.
- Production debugging.

---

# Architecture

## Client Architecture

Presentation Layer
↓
State Layer (Zustand)
↓
Service Layer
↓
Supabase SDK
↓
Supabase Backend

---

# Database Schema

## users

Menyimpan data pengguna.

Fields:

- id (uuid)
- email
- display_name
- avatar_url
- created_at

---

## exercises

Database gerakan gym.

Fields:

- id (uuid)
- name
- primary_muscle
- secondary_muscle
- equipment
- description
- image_url
- created_at

Contoh:

- Bench Press
- Lat Pulldown
- Squat
- Cable Fly

---

## workout_templates

Menyimpan workout list milik pengguna.

Fields:

- id (uuid)
- user_id
- name
- created_at
- updated_at

Contoh:

- Push Day
- Pull Day
- Leg Day

---

## workout_template_exercises

Menyimpan detail exercise dalam workout template.

Fields:

- id (uuid)
- template_id
- exercise_id
- order_number
- target_sets
- target_reps
- rest_timer_seconds

---

## workout_sessions

Menyimpan sesi workout yang sudah selesai.

Fields:

- id (uuid)
- user_id
- template_id
- workout_name
- duration_seconds
- total_volume
- total_sets
- started_at
- completed_at

---

## workout_sets

Menyimpan detail setiap set.

Fields:

- id (uuid)
- session_id
- exercise_id
- set_number
- weight
- reps
- volume
- is_weight_pr
- is_volume_pr
- created_at

Volume Formula:

weight × reps

---

# Personal Record Logic

## Weight PR

Ambil weight tertinggi pada exercise yang sama.

Contoh:

Bench Press

- 80kg ✅
- 85kg ✅
- 90kg ✅ PR

---

## Volume PR

Volume = Weight × Reps

Contoh:

100kg × 10 reps

= 1000 volume

---

## Estimated 1RM

Formula:

1RM = Weight × (1 + Reps / 30)

Contoh:

100kg × 5 reps

= 116.6kg (estimated 1RM)

---

# Offline Support (Future)

Jika internet tidak tersedia:

- Workout tetap bisa berjalan.
- Data disimpan lokal.
- Otomatis sync saat internet kembali tersedia.

---

# Folder Structure

src/
├── app/
├── components/
├── features/
│ ├── auth/
│ ├── exercises/
│ ├── workouts/
│ ├── history/
│ ├── analytics/
│ └── profile/
├── services/
├── stores/
├── hooks/
├── lib/
├── types/
└── utils/

---

# MVP Stack Summary

Frontend

- React Native
- Expo
- Expo Router
- NativeWind
- Zustand

Backend

- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage

Authentication

- Email & Password
- Sign In With Google

Features

- Exercise Library
- Workout Builder
- Workout Session Tracking
- Rest Timer
- Audio Notification
- Personal Record Tracking
- Workout History
- Cloud Sync

Analytics

- Total Volume
- Total Sets
- Total Duration
- Exercise Progress

Monitoring

- Sentry

Deployment

- Android (Google Play Store)
- iOS (Apple App Store)