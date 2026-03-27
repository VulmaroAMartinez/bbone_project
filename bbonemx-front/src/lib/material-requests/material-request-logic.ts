/**
 * Pure logic for material request form behaviour.
 */

const SERVICE_CATEGORIES = new Set(['SERVICE']);

const MATERIAL_CATEGORIES = new Set([
  'MATERIAL_WITH_SKU',
  'NON_INVENTORY_MATERIAL',
  'REQUEST_SKU_MATERIAL',
  'UPDATE_SKU',
  'SERVICE_WITH_MATERIAL',
]);

const SPARE_PART_CATEGORIES = new Set([
  'SPARE_PART_WITH_SKU',
  'NON_INVENTORY_SPARE_PART',
  'REQUEST_SKU_SPARE_PART',
]);

/** Returns true when the category is a pure service (no items). */
export function isServiceCategory(category: string): boolean {
  return SERVICE_CATEGORIES.has(category);
}

/** Returns true when the category uses the material catalog. */
export function isMaterialCategory(category: string): boolean {
  return MATERIAL_CATEGORIES.has(category);
}

/** Returns true when the category uses the spare-part catalog. */
export function isSparePartCategory(category: string): boolean {
  return SPARE_PART_CATEGORIES.has(category);
}

/**
 * Determines whether the items list should be cleared when switching
 * between categories.
 *
 * Items must be cleared when:
 *   1. Switching TO a service category (services have no items).
 *   2. Switching FROM a material category TO a spare-part category (or vice
 *      versa) because the catalogId stored in each item references a different
 *      catalog table — keeping stale catalogIds causes backend errors.
 *
 * Items are NOT cleared when switching within the same catalog family (e.g.
 * MATERIAL_WITH_SKU → NON_INVENTORY_MATERIAL both use the material catalog).
 */
export function shouldClearItemsOnCategoryChange(
  prevCategory: string,
  nextCategory: string,
): boolean {
  if (!prevCategory || !nextCategory) return false;
  if (prevCategory === nextCategory) return false;

  // Switching to service always clears
  if (isServiceCategory(nextCategory)) return true;

  // Switching between material ↔ spare-part catalogs clears
  const prevIsMaterial = isMaterialCategory(prevCategory);
  const prevIsSparePart = isSparePartCategory(prevCategory);
  const nextIsMaterial = isMaterialCategory(nextCategory);
  const nextIsSparePart = isSparePartCategory(nextCategory);

  if (prevIsMaterial && nextIsSparePart) return true;
  if (prevIsSparePart && nextIsMaterial) return true;

  return false;
}
