# ngegymYuk Design

## Product Overview

ngegymYuk adalah aplikasi mobile fitness tracker untuk Android dan iOS yang berfokus pada:

- Workout Planning
- Workout Tracking
- Progress Tracking
- Personal Record (PR)
- Workout Analytics
- Cloud Sync

### Inspirasi Visual

- Linear
- Garmin Connect
- WHOOP
- Formula 1 Dashboard
- Modern Performance Analytics

### Design Goals

Menciptakan pengalaman yang:

- Modern
- Cepat digunakan saat gym
- Mudah digunakan dengan satu tangan
- Fokus pada data dan progres
- Premium
- Memiliki identitas visual unik
- Tidak terlihat seperti template fitness app generik

---

# Design Principles

## 1. Progress First

Informasi progres harus menjadi fokus utama.

Prioritas:

- Personal Record
- Current Workout
- Workout History
- Analytics

User harus langsung melihat perkembangan tanpa banyak klik.

---

## 2. Fast During Workout

Saat workout berlangsung:

- Input harus cepat
- Tombol besar
- Minim popup
- Seluruh flow bisa digunakan dengan satu tangan

Target:

- Mencatat 1 set < 3 detik

---

## 3. Data Driven

Dashboard harus menampilkan:

- Workout terakhir
- Total volume
- Total workout
- Personal Record
- Weekly progress
- Goal completion

Data harus terasa seperti dashboard performa atlet.

---

## 4. Premium Simplicity

Fokus pada:

- Typography
- Contrast
- Metric Display
- Cards
- Charts
- Progress Indicators

Dekorasi diminimalkan agar perhatian selalu tertuju pada progres.

---

# Platform

## Android

Target:

- Android 10+

## iOS

Target:

- iOS 16+

---

# Design Language

## Style Keywords

- Modern
- Premium
- Performance
- Athletic
- Data-Centric
- Dark First
- Dashboard Inspired

---

# Theme

## Default Theme

Dark Mode

Karena mayoritas pengguna gym berlatih di lingkungan dengan pencahayaan rendah.

## Light Mode

Opsional.

Mengikuti preferensi device.

---

# Color System

## Design Concept

### Performance Dashboard

Alih-alih menggunakan gaya Strava (Orange), ngegymYuk menggunakan identitas visual yang terinspirasi dashboard performa atlet.

---

## Primary

### Performance Lime

```css
#C7FF41
```

Digunakan untuk:

- CTA Button
- Active State
- Progress Indicator
- Achievement
- Goal Completion

---

## Secondary Accent

### Electric Blue

```css
#4DA6FF
```

Digunakan untuk:

- Analytics
- Charts
- Trend Visualizations
- Insights

---

## Background

```css
#080808
```

Main Background

---

## Surface

```css
#101010
```

Card Background

---

## Elevated Surface

```css
#171717
```

Untuk:

- Modal
- Bottom Sheet
- Overlay

---

## Border

```css
rgba(255,255,255,0.08)
```

---

## Text Primary

```css
#FFFFFF
```

---

## Text Secondary

```css
#A3A3A3
```

---

## Success

```css
#22C55E
```

---

## Warning

```css
#EAB308
```

---

## Error

```css
#EF4444
```

---

# Typography

## Heading Font

### Space Grotesk

Alasan:

- Kuat
- Sporty
- Modern
- Memiliki karakter visual yang lebih unik dibanding Inter

---

## Body Font

### Inter

Alasan:

- Sangat mudah dibaca
- Cocok untuk dashboard dan data berat

---

## Hierarchy

### H1

- 36px
- Bold

Contoh:

- Dashboard
- Progress

---

### H2

- 28px
- SemiBold

Contoh:

- Weekly Performance

---

### H3

- 20px
- SemiBold

Contoh:

- Bench Press

---

### Metric Display

- 48px
- Bold

Contoh:

```text
82,000 KG
```

Digunakan untuk statistik utama.

---

### Body

- 16px

### Caption

- 14px

---

# Navigation

## Floating Performance Dock

Menggantikan bottom navigation standar.

Karakteristik:

- Floating dari bawah layar
- Bentuk capsule
- Semi-transparan
- Premium
- Mudah dijangkau satu tangan

Menu:

- Home
- Workout
- History
- Analytics
- Profile

---

## Active State

Tab aktif berubah menjadi capsule penuh.

Contoh:

```text
[ Analytics ]
```

Tab lainnya tetap berupa icon.

---

# Main Screens

## 1. Home

### Tujuan

Memberikan ringkasan progres user.

### Hero Performance Ring

Komponen utama aplikasi.

Contoh:

```text
82%
Weekly Goal
```

---

### Weekly Stats

Menampilkan:

- Total Workout
- Total Duration
- Total Volume

---

### Last Workout

Card berisi:

```text
Push Day
1h 18m
12,540kg
28 Sets
```

---

### Personal Records

Horizontal Cards

```text
Bench Press
100kg PR

Squat
140kg PR
```

---

### Quick Start Workout

Primary CTA

```text
START WORKOUT
```

Menggunakan warna Performance Lime.

---

## 2. Workout Builder

### Layout

Header

```text
Push Day
```

Exercise List

```text
Bench Press
4 x 8
120s Rest

Incline Bench
4 x 10
90s Rest
```

Floating Action Button

```text
+ Add Exercise
```

---

## 3. Exercise Library

### Search

```text
Search Exercise...
```

### Filter Chips

- Chest
- Back
- Shoulder
- Arms
- Legs
- Abs

### Exercise Card

Menampilkan:

- Exercise Image
- Exercise Name
- Muscle Group
- Equipment Type

---

## 4. Active Workout Screen

Halaman paling penting dalam aplikasi.

### Header

Workout Timer

```text
00:42:17
```

---

### Active Exercise

```text
Bench Press

4 Sets
8 Reps
```

---

### Input Area

```text
Set 1
Weight: 80
Reps: 8

Set 2
Weight: 85
Reps: 8
```

---

### Complete Set Button

Tombol terbesar dalam aplikasi.

```text
COMPLETE SET
```

Background:

```css
#C7FF41
```

---

### Rest Timer Overlay

```text
01:30
```

Actions:

- Pause
- Skip

---

### PR Celebration

Saat PR tercapai.

```text
🔥 NEW PR
100 KG
```

Efek:

- Lime Glow
- Pulse Animation
- Haptic Success

---

## 5. History

### Activity Feed

Menampilkan:

```text
Push Day
12,540 KG
78 Min
28 Sets
```

---

### Detail History

Menampilkan:

- Seluruh Exercise
- Semua Set
- Weight
- Reps
- Volume

---

## 6. Analytics

Fokus pada perkembangan performa.

### Weekly Volume Chart

Bar Chart

Accent:

```css
#C7FF41
```

---

### Monthly Workout Chart

Line Chart

Accent:

```css
#4DA6FF
```

---

### Muscle Distribution

```text
Chest       22%
Back        20%
Legs        35%
Shoulders   15%
Others       8%
```

---

### Personal Records

```text
Bench Press
100kg

Squat
140kg
```

---

## 7. Profile

### User Information

- Name
- Email

### Statistics

- Total Workout
- Total Volume
- Total Duration

### Account

- Edit Profile
- Sync Status
- Logout

---

# Components

## Buttons

### Primary

- Performance Lime
- Radius 18px

### Secondary

- Dark Surface
- Subtle Border

---

## Cards

Radius:

```css
24px
```

Padding:

```css
20px
```

Style:

- Soft Glass Effect
- Minimal Border
- Clean Surface
- No Heavy Shadow

---

## Inputs

Height:

```css
56px
```

Radius:

```css
16px
```

Large touch target untuk penggunaan saat workout.

---

## Chips

Digunakan untuk:

- Muscle Filters
- Equipment Filters
- Body Part Categories

---

# Signature Components

## Performance Ring

Elemen identitas utama aplikasi.

Menampilkan:

- Weekly Goal
- Monthly Goal
- Consistency Score

---

## Metric Cards

Menampilkan angka besar sebagai fokus utama.

Contoh:

```text
82,000 KG
```

---

## Performance Insights

Komponen khusus yang memberi insight:

```text
Volume naik 12%
dibanding minggu lalu
```

---

# Animations

## Complete Set

- Scale Animation
- Haptic Feedback

---

## New PR

- Lime Burst Effect
- Pulse Animation
- Haptic Success

---

## Workout Complete

- Performance Summary
- Animated Counter
- Volume Breakdown

---

# Accessibility

- Touch area minimal 44x44 px
- Memenuhi WCAG Contrast Standard
- Mendukung Dynamic Font Size
- Mendukung Screen Reader

---

# Empty States

## No Workout Yet

```text
Belum ada workout.

Siap pecahin PR hari ini?
```

Button:

```text
Create Workout
```

---

## No History

```text
Belum ada riwayat latihan.

Mulai latihan pertama untuk melihat progresmu.
```

---

# Design USP

ngegymYuk bukan sekadar fitness tracker.

Visual identity dibangun sebagai:

## Personal Performance Dashboard for Lifters

Perpaduan:

- Garmin (Performance Metrics)
- Linear (Premium UI)
- WHOOP (Progress Focus)
- Formula 1 Dashboard (Data Visualization)

Dengan fokus utama:

> Track workout secepat mungkin, lihat progres semudah mungkin, dan rasakan perkembangan seperti seorang atlet.