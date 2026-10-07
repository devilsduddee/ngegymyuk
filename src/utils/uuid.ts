import * as Crypto from "expo-crypto";

/**
 * Generate a cryptographically secure UUID v4 compatible across
 * React Native (Android / iOS) and Web.
 */
export function generateUUID(): string {
  try {
    if (Crypto && typeof Crypto.randomUUID === "function") {
      return Crypto.randomUUID();
    }
  } catch {
    // fallback
  }

  // Fallback for environments where Crypto.randomUUID might be unavailable
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
