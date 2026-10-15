export interface OceanCreatureConfig {
  rollMin: number;
  rollMax: number;
  whaleChance: number;
  megaChance: number;
  cooldownMin: number;
  cooldownMax: number;
  whaleDepth: number;
  megaDepth: number;
}

/**
 * Konfigurasi pemunculan Paus dan Megalodon (disinkronkan dengan acuan HTML).
 */
export const PROD_OCEAN_CONFIG: OceanCreatureConfig = {
  rollMin: 1,
  rollMax: 3,
  whaleChance: 0.5,
  megaChance: 0.5,
  cooldownMin: 2,
  cooldownMax: 5,
  whaleDepth: 120,
  megaDepth: 150,
};

/**
 * Konfigurasi mode uji untuk memudahkan verifikasi visual cepat.
 * Hanya aktif jika query URL berisi ?ocean=test atau env NEXT_PUBLIC_OCEAN_TEST=true.
 */
export const TEST_OCEAN_CONFIG: OceanCreatureConfig = {
  rollMin: 1,
  rollMax: 3,
  whaleChance: 0.5,
  megaChance: 0.5,
  cooldownMin: 2,
  cooldownMax: 5,
  whaleDepth: 120,
  megaDepth: 150,
};

export function getOceanConfig(): OceanCreatureConfig {
  if (typeof window !== "undefined") {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("ocean") === "test" || process.env.NEXT_PUBLIC_OCEAN_TEST === "true") {
        return TEST_OCEAN_CONFIG;
      }
    } catch {
      // Ignore URL parsing errors
    }
  }
  return PROD_OCEAN_CONFIG;
}
