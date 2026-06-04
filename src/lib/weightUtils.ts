/**
 * Weight unit utilities for GadoApp.
 *
 * In Brazil, live cattle weight uses 1 arroba (@) = 30 kg,
 * because approximately 50% of the live weight is carcass
 * (rendimento de carcaça). The 15 kg arroba is only used
 * for carcass weight after slaughter.
 */

export type WeightUnit = "kg" | "arroba";

export const KG_PER_ARROBA = 30;

const STORAGE_KEY = "gadoapp_weight_unit";

export function getStoredWeightUnit(): WeightUnit {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "arroba" ? "arroba" : "kg";
}

export function setStoredWeightUnit(unit: WeightUnit): void {
  localStorage.setItem(STORAGE_KEY, unit);
}

export function convertWeight(kg: number, unit: WeightUnit): number {
  return unit === "arroba"
    ? parseFloat((kg / KG_PER_ARROBA).toFixed(2))
    : kg;
}

export function formatWeight(value: number, unit: WeightUnit): string {
  return unit === "arroba" ? `${value} @` : `${value} kg`;
}

export function formatWeightFromKg(kg: number, unit: WeightUnit): string {
  return formatWeight(convertWeight(kg, unit), unit);
}

export function unitLabel(unit: WeightUnit): string {
  return unit === "arroba" ? "@" : "kg";
}

/** Converts user input to kg for storage (always stored in kg) */
export function inputToKg(value: number, inputUnit: WeightUnit): number {
  return inputUnit === "arroba" ? value * KG_PER_ARROBA : value;
}
