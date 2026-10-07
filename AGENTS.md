# AGENTS.md

# ngegymYuk Agent Guidelines

## Project Overview

ngegymYuk adalah aplikasi mobile fitness tracker yang berjalan di:

- Android
- iOS

Tech Stack:

- React Native
- Expo
- Expo Router
- NativeWind
- Zustand
- Supabase
- PostgreSQL
- Reanimated
- Expo Notifications
- Expo Haptics
- Expo AV

---

# Source of Truth

Selalu jadikan dokumen berikut sebagai acuan utama sebelum melakukan perubahan:

1. PRD.md
2. DESIGN.md
3. techstack.md
4. documentation.md

Jika terjadi konflik:

```txt
PRD.md
↓
DESIGN.md
↓
techstack.md
↓
documentation.md
```

---

# Mandatory Skills

Agent WAJIB menggunakan skill yang telah terpasang sebelum melakukan implementasi.

## Planning

- spec-driven-development
- incremental-implementation

## Frontend

- frontend-ui-engineering
- design-taste-frontend
- high-end-visual-design

## Mobile

- antislop-layoutmobile
- imagegen-frontend-mobile

## Quality

- antislop
- antislop-code
- antislop-ui
- code-review-and-quality

## Performance

- performance-optimization

## Security

- security-and-hardening

## Animation

- animate-expo
- review-animations
- find-animation-opportunities

## Product Polish

- hallmark
- apple-design

## Debugging

- debugging-and-error-recovery

## Documentation

- documentation-and-adrs

---

# Development Rules

## Build Incrementally

Jangan membuat seluruh aplikasi sekaligus.

Implementasi dilakukan per fitur.

Contoh:

Phase 1

```txt
Authentication
```

Phase 2

```txt
Exercise Library
```

Phase 3

```txt
Workout Builder
```

Phase 4

```txt
Workout Session
```

Phase 5

```txt
Analytics
```

---

## Keep Files Small

Target maksimal:

```txt
500 lines per file
```

Jika mendekati batas:

- Pecah menjadi component
- Pecah menjadi hook
- Pecah menjadi service
- Pecah menjadi utility

Jangan membuat file monster 1000+ lines.

---

## Feature-Based Architecture

Gunakan struktur:

```txt
src/
│
├── app/
├── components/
├── features/
├── stores/
├── hooks/
├── services/
├── lib/
├── types/
└── utils/
```

---

# Architecture

## Feature Structure

```txt
features/
│
├── auth/
│
├── exercises/
│
├── workouts/
│
├── history/
│
├── analytics/
│
└── profile/
```

Contoh:

```txt
features/
└── workouts/
    ├── components/
    ├── hooks/
    ├── services/
    ├── types/
    ├── screens/
    └── utils/
```

---

# UI Rules

Referensi utama:

- Strava
- Hevy
- Strong
- Lyfta

Prioritas:

1. Usability
2. Readability
3. Speed
4. Consistency
5. Aesthetics

---

## Avoid

Jangan menggunakan:

- Glassmorphism berlebihan
- Gradient berlebihan
- Fancy animation tanpa tujuan
- Tiny touch targets
- Desktop-first layouts

---

## Mobile First

Seluruh UI harus:

- Android first
- iOS compatible
- Thumb friendly
- Gym friendly

Minimal touch area:

```txt
44x44 px
```

---

# Styling Rules

Gunakan:

```txt
NativeWind
```

Prioritaskan:

```txt
className
```

Daripada:

```tsx
style={{}}
```

Hindari inline style kecuali diperlukan.

---

# State Management Rules

Gunakan:

```txt
Zustand
```

Untuk:

- Active Workout
- User Session
- Timer State
- Workout State

Hindari Redux.

---

# Database Rules

Gunakan:

```txt
Supabase PostgreSQL
```

Semua tabel user-owned wajib memakai:

```txt
user_id
```

---

## Security

Wajib menggunakan:

```txt
RLS (Row Level Security)
```

Pada seluruh tabel user data.

User tidak boleh mengakses data user lain.

---

# Authentication

Support:

- Email & Password
- Google Sign In

Wajib:

- Session persistence
- Secure storage
- Cloud sync

---

# Performance Rules

Target:

```txt
60 FPS
```

Optimasi:

- FlatList
- Memoization
- Reanimated
- Lazy Loading

Kurangi:

- Re-render tidak perlu
- Heavy computations di UI

---

# Animation Rules

Gunakan:

- React Native Reanimated
- Gesture Handler
- Expo Haptics

Jangan gunakan:

- GSAP

Kecuali ada justifikasi teknis yang kuat.

---

# Workout Experience

Prioritas tertinggi aplikasi adalah:

```txt
Workout Session Experience
```

Semua keputusan desain harus mengutamakan:

- Kecepatan mencatat set
- Kecepatan melihat progres
- Kejelasan data latihan

---

# Code Quality Rules

Selalu:

- Type-safe
- Reusable
- Predictable
- Readable

Hindari:

- Premature abstraction
- Deep nesting
- God Components
- Duplicate logic

---

# Documentation Rules

Setiap fitur baru WAJIB memperbarui:

```txt
documentation.md
```

Gunakan Bahasa Indonesia.

Dokumentasi minimal berisi:

### Tujuan Fitur

Penjelasan singkat fitur.

### Flow

Alur penggunaan fitur.

### Database

Tabel yang digunakan.

### API / Service

Method yang digunakan.

### State

Store atau state terkait.

### Notes

Catatan penting untuk developer.

---

Contoh:

# Workout Builder

## Tujuan

Membuat dan mengelola workout list.

## Flow

1. User membuat workout.
2. User menambahkan exercise.
3. User menentukan set.
4. User menentukan reps.
5. User menentukan rest timer.

## Database

- workout_templates
- workout_template_exercises

## State

- workout-store

## Notes

Rest timer disimpan dalam satuan detik.

---

# Before Submitting Any Work

Pastikan:

- Mengikuti PRD.md
- Mengikuti DESIGN.md
- Mengikuti techstack.md
- Mengikuti documentation.md
- Menggunakan skill yang relevan
- Tidak membuat file > 500 lines
- Tidak menambah dependency tanpa alasan jelas
- Tidak membuat fitur di luar scope MVP

---

# Definition of Done

Suatu task dianggap selesai jika:

- Fitur berjalan sesuai PRD
- UI sesuai Design System
- TypeScript tanpa error
- Tidak ada lint error
- Dokumentasi diperbarui
- Code review berhasil
- Mobile responsive
- Android & iOS compatible

# Environment Rules

Setiap kali menambahkan environment variable baru:

1. Tambahkan ke `.env.example`
2. Tambahkan penjelasan di `documentation.md`
3. Jangan pernah commit file `.env`

Semua environment variable wajib memiliki dokumentasi.

---

# Documentation Enforcement

Setiap perubahan berikut WAJIB memperbarui documentation.md:

- Fitur baru
- Database schema baru
- API baru
- State management baru
- Environment variable baru
- Setup development baru

Pull Request dianggap belum selesai jika documentation.md belum diperbarui.

---

# Environment Enforcement

Jika menambahkan ENV baru:

- Update .env.example
- Update documentation.md
- Jangan hardcode secret
- Jangan commit .env
