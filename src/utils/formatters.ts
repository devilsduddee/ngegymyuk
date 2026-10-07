/**
 * Utility formatters for ngegymYuk app.
 * Provides human-friendly, readable metrics in Indonesian.
 */

/**
 * Formats seconds into human-readable Indonesian duration.
 * Examples:
 * - 0 -> "0 mnt"
 * - 360 -> "6 menit"
 * - 4320 -> "1 jam 12 menit"
 * - 7200 -> "2 jam"
 */
export function formatDurationHuman(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return "0 mnt";
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours > 0) {
    if (mins === 0) {
      return `${hours} jam`;
    }
    return `${hours} jam ${mins} menit`;
  }
  return `${mins} menit`;
}

/**
 * Compact duration for tight card widgets (e.g. "1j 12m" or "45m")
 */
export function formatDurationCompact(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return "0 mnt";
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (hrs > 0) {
    return `${hrs}j ${remainingMins}m`;
  }
  return `${mins} mnt`;
}

/**
 * Formats kg weight cleanly:
 * - 12500 -> "12.5k"
 * - 850 -> "850"
 */
export function formatKg(val: number): string {
  if (val >= 1000) {
    return `${(val / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `${Math.round(val)}`;
}

/**
 * Formats total tonnage clearly for athlete profiles:
 * - If >= 1000 kg: "12.8 ton"
 * - If < 1000 kg: "850 kg"
 */
export function formatTonnage(totalVolumeKg: number): { value: string; unit: string } {
  if (!totalVolumeKg || totalVolumeKg <= 0) {
    return { value: "0", unit: "kg beban" };
  }
  if (totalVolumeKg >= 1000) {
    const tons = (totalVolumeKg / 1000).toFixed(1).replace(/\.0$/, "");
    return { value: tons, unit: "Ton beban" };
  }
  return { value: Math.round(totalVolumeKg).toLocaleString("id-ID"), unit: "kg beban" };
}

