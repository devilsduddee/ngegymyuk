import { z } from "zod";

const envSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z
    .string()
    .min(1, "EXPO_PUBLIC_SUPABASE_URL wajib diisi"),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "EXPO_PUBLIC_SUPABASE_ANON_KEY wajib diisi"),
});

const rawEnv = {
  EXPO_PUBLIC_SUPABASE_URL:
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    "https://placeholder-project.supabase.co",
  EXPO_PUBLIC_SUPABASE_ANON_KEY:
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
};

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  console.warn(
    "Peringatan Environment Variables:",
    parsed.error.flatten().fieldErrors
  );
}

export const env = {
  SUPABASE_URL: rawEnv.EXPO_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: rawEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY,
};
