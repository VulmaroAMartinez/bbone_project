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

export function isSparePartCategory(category: string): boolean {
  return SPARE_PART_CATEGORIES.has(category);
}


export function shouldClearItemsOnCategoryChange(
  prevCategory: string,
  nextCategory: string,
): boolean {
  if (!prevCategory || !nextCategory) return false;
  if (prevCategory === nextCategory) return false;

  if (isServiceCategory(nextCategory)) return true;

  const prevIsMaterial = isMaterialCategory(prevCategory);
  const prevIsSparePart = isSparePartCategory(prevCategory);
  const nextIsMaterial = isMaterialCategory(nextCategory);
  const nextIsSparePart = isSparePartCategory(nextCategory);

  if (prevIsMaterial && nextIsSparePart) return true;
  if (prevIsSparePart && nextIsMaterial) return true;

  return false;
}
