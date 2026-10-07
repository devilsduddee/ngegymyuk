/**
 * Menerjemahkan error code / message dari Supabase Auth menjadi pesan bahasa Indonesia yang ramah, jelas, dan actionable.
 */
export function getHumanAuthError(error: string | undefined | null): string {
  if (!error) return "Gagal memproses. Coba lagi sebentar lagi.";

  const err = error.toLowerCase();

  if (err.includes("invalid login credentials") || err.includes("invalid_credentials")) {
    return "Email atau password salah.";
  }

  if (err.includes("user already registered") || err.includes("already registered") || err.includes("email already in use")) {
    return "Email sudah terdaftar. Silakan langsung masuk.";
  }

  if (err.includes("password should be at least")) {
    return "Password minimal 6 karakter.";
  }

  if (err.includes("rate limit") || err.includes("too many requests")) {
    return "Terlalu banyak percobaan. Tunggu beberapa saat.";
  }

  if (err.includes("network request failed") || err.includes("fetch failed")) {
    return "Koneksi internet bermasalah. Periksa jaringanmu.";
  }

  if (
    err.includes("user cancelled") ||
    err.includes("canceled") ||
    err.includes("dibatalkan")
  ) {
    return "Login Google dibatalkan.";
  }

  return error;
}
