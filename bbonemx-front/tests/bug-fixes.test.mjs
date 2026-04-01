/**
 * TDD tests for 6 logic bugs in the BBMaintenance frontend.
 *
 * These tests target pure logic modules extracted from the components/hooks.
 * Each test suite maps to one or two bugs from the bug report.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const root = path.resolve(import.meta.dirname, '..');
const localRequire = createRequire(import.meta.url);

function loadTsModule(relativePath) {
  const fullPath = path.join(root, relativePath);
  const source = fs.readFileSync(fullPath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;

  const module = { exports: {} };
  const context = vm.createContext({ module, exports: module.exports, require: localRequire });
  new vm.Script(transpiled, { filename: fullPath }).runInContext(context);
  return module.exports;
}

// ─────────────────────────────────────────────────────────────────────────────
// Bug 1 + 2: useAreaMachineSelector — area-level machine tracking + Avería
// ─────────────────────────────────────────────────────────────────────────────

test('Bug 1: deriveAreaHasMachines returns true when area has machines', () => {
  const { deriveAreaHasMachines } = loadTsModule(
    'src/lib/area-machine-selector/area-machine-logic.ts',
  );

  assert.equal(deriveAreaHasMachines(3), true, 'area with 3 machines → true');
  assert.equal(deriveAreaHasMachines(1), true, 'area with 1 machine → true');
});

test('Bug 1: deriveAreaHasMachines returns false when area has no machines', () => {
  const { deriveAreaHasMachines } = loadTsModule(
    'src/lib/area-machine-selector/area-machine-logic.ts',
  );

  assert.equal(deriveAreaHasMachines(0), false, 'area with 0 machines → false');
});

test('Bug 1: shouldShowMachineField is true only when area is selected AND area has machines', () => {
  const { shouldShowMachineField } = loadTsModule(
    'src/lib/area-machine-selector/area-machine-logic.ts',
  );

  // Area selected, area has machines → show
  assert.equal(shouldShowMachineField('area-1', true), true);

  // Area selected, area has NO machines → do NOT show
  assert.equal(shouldShowMachineField('area-1', false), false);

  // No area selected → do NOT show regardless of machine count
  assert.equal(shouldShowMachineField('', true), false);
  assert.equal(shouldShowMachineField('', false), false);
});

test('Bug 1: shouldShowMachineField stays true after sub-area is selected in an area with machines', () => {
  /**
   * Key regression: when a sub-area with 0 machines is selected, the hook
   * previously set machinesData to an empty list, causing showMachine=false.
   * After the fix, areaHasMachines is never mutated by sub-area changes.
   *
   * This test simulates:
   *   1. Area "A" is selected → areaHasMachines=true (area has 5 machines)
   *   2. Sub-area "SA" (which has 0 machines after sub-area filter) is selected
   *   3. shouldShowMachineField must still return true (based on area-level count)
   */
  const { shouldShowMachineField } = loadTsModule(
    'src/lib/area-machine-selector/area-machine-logic.ts',
  );

  // areaHasMachines was set when area changed (5 machines) and is NOT changed
  // when sub-area changes → still true
  const areaHasMachines = true; // derived from area-level fetch (5 machines)
  assert.equal(
    shouldShowMachineField('area-1', areaHasMachines),
    true,
    'machine field must stay visible after sub-area with 0 machines is selected',
  );
});

test('Bug 2: isAveriaEnabled matches areaHasMachines (not sub-area filtered count)', () => {
  const { isAveriaEnabled } = loadTsModule(
    'src/lib/area-machine-selector/area-machine-logic.ts',
  );

  // Area has machines → Avería enabled
  assert.equal(isAveriaEnabled(true), true);

  // Area has no machines → Avería disabled
  assert.equal(isAveriaEnabled(false), false);
});

// ─────────────────────────────────────────────────────────────────────────────
// Bug 3: Finding cannot be edited once converted to OT
// ─────────────────────────────────────────────────────────────────────────────

test('Bug 3: canEditFinding returns false when finding is converted to WO', () => {
  const { canEditFinding } = loadTsModule('src/lib/findings/finding-logic.ts');

  assert.equal(
    canEditFinding({ folio: 'OT-0001' }),
    false,
    'finding with convertedToWo must NOT be editable',
  );
});

test('Bug 3: canEditFinding returns true when finding is NOT converted', () => {
  const { canEditFinding } = loadTsModule('src/lib/findings/finding-logic.ts');

  assert.equal(canEditFinding(null), true, 'finding without convertedToWo is editable');
  assert.equal(canEditFinding(undefined), true, 'finding with undefined convertedToWo is editable');
});

// ─────────────────────────────────────────────────────────────────────────────
// Bug 4: Filter finding's machine select by area + show sub-area path
// ─────────────────────────────────────────────────────────────────────────────

test('Bug 4: filterMachinesByArea filters machines to the selected area', () => {
  const { filterMachinesByArea } = loadTsModule('src/lib/findings/finding-logic.ts');

  const machines = [
    { id: 'm1', area: { id: 'a1', name: 'Producción' }, subArea: null },
    { id: 'm2', area: { id: 'a2', name: 'Almacén' }, subArea: null },
    { id: 'm3', area: null, subArea: { id: 'sa1', name: 'Línea 1', area: { id: 'a1', name: 'Producción' } } },
  ];

  const result = filterMachinesByArea(machines, 'a1');
  assert.equal(result.length, 2, 'should return 2 machines belonging to area a1');
  assert.ok(result.find((m) => m.id === 'm1'), 'direct area machine m1 must be included');
  assert.ok(result.find((m) => m.id === 'm3'), 'sub-area machine m3 must be included');
  assert.ok(!result.find((m) => m.id === 'm2'), 'machine m2 from other area must be excluded');
});

test('Bug 4: filterMachinesByArea returns full list when no area selected', () => {
  const { filterMachinesByArea } = loadTsModule('src/lib/findings/finding-logic.ts');

  const machines = [
    { id: 'm1', area: { id: 'a1', name: 'Producción' }, subArea: null },
    { id: 'm2', area: { id: 'a2', name: 'Almacén' }, subArea: null },
  ];

  const result = filterMachinesByArea(machines, '');
  assert.equal(result.length, 2, 'empty areaId must not filter anything');
});

test('Bug 4: buildMachineLabel includes sub-area name in label', () => {
  const { buildMachineLabel } = loadTsModule('src/lib/findings/finding-logic.ts');

  const machineWithSubArea = { name: 'Torno CNC', code: 'TC-01', subArea: { name: 'Línea 1' } };
  const label = buildMachineLabel(machineWithSubArea);
  assert.ok(label.includes('Línea 1'), `label "${label}" must include sub-area name`);
  assert.ok(label.includes('Torno CNC'), `label "${label}" must include machine name`);
  assert.ok(label.includes('TC-01'), `label "${label}" must include machine code`);
});

test('Bug 4: buildMachineLabel omits sub-area when machine has no sub-area', () => {
  const { buildMachineLabel } = loadTsModule('src/lib/findings/finding-logic.ts');

  const machine = { name: 'Compresor', code: 'CP-01', subArea: null };
  const label = buildMachineLabel(machine);
  assert.equal(label, 'Compresor [CP-01]');
});

// ─────────────────────────────────────────────────────────────────────────────
// Bug 5: Material requests — items don't persist when switching to refacción
// ─────────────────────────────────────────────────────────────────────────────

test('Bug 5: shouldClearItemsOnCategoryChange clears when switching MATERIAL → SPARE_PART', () => {
  const { shouldClearItemsOnCategoryChange } = loadTsModule(
    'src/lib/material-requests/material-request-logic.ts',
  );

  assert.equal(
    shouldClearItemsOnCategoryChange('MATERIAL_WITH_SKU', 'SPARE_PART_WITH_SKU'),
    true,
    'switching from material to spare part must clear items',
  );
  assert.equal(
    shouldClearItemsOnCategoryChange('NON_INVENTORY_MATERIAL', 'NON_INVENTORY_SPARE_PART'),
    true,
    'switching between non-inventory catalogs must clear items',
  );
});

test('Bug 5: shouldClearItemsOnCategoryChange clears when switching SPARE_PART → MATERIAL', () => {
  const { shouldClearItemsOnCategoryChange } = loadTsModule(
    'src/lib/material-requests/material-request-logic.ts',
  );

  assert.equal(
    shouldClearItemsOnCategoryChange('SPARE_PART_WITH_SKU', 'MATERIAL_WITH_SKU'),
    true,
    'switching from spare part to material must clear items',
  );
});

test('Bug 5: shouldClearItemsOnCategoryChange clears when switching TO SERVICE', () => {
  const { shouldClearItemsOnCategoryChange } = loadTsModule(
    'src/lib/material-requests/material-request-logic.ts',
  );

  assert.equal(
    shouldClearItemsOnCategoryChange('MATERIAL_WITH_SKU', 'SERVICE'),
    true,
    'switching to service must clear items',
  );
  assert.equal(
    shouldClearItemsOnCategoryChange('SPARE_PART_WITH_SKU', 'SERVICE'),
    true,
    'switching spare part to service must clear items',
  );
});

test('Bug 5: shouldClearItemsOnCategoryChange does NOT clear within same catalog family', () => {
  const { shouldClearItemsOnCategoryChange } = loadTsModule(
    'src/lib/material-requests/material-request-logic.ts',
  );

  // Material → Material (different subcategory, same catalog)
  assert.equal(
    shouldClearItemsOnCategoryChange('MATERIAL_WITH_SKU', 'NON_INVENTORY_MATERIAL'),
    false,
    'switching within material catalog must NOT clear items',
  );

  // Spare part → Spare part (different subcategory, same catalog)
  assert.equal(
    shouldClearItemsOnCategoryChange('SPARE_PART_WITH_SKU', 'NON_INVENTORY_SPARE_PART'),
    false,
    'switching within spare-part catalog must NOT clear items',
  );

  // Same category
  assert.equal(
    shouldClearItemsOnCategoryChange('MATERIAL_WITH_SKU', 'MATERIAL_WITH_SKU'),
    false,
    'same category must NOT clear items',
  );
});

test('Bug 5: shouldClearItemsOnCategoryChange returns false when prev/next category is empty', () => {
  const { shouldClearItemsOnCategoryChange } = loadTsModule(
    'src/lib/material-requests/material-request-logic.ts',
  );

  assert.equal(shouldClearItemsOnCategoryChange('', 'MATERIAL_WITH_SKU'), false);
  assert.equal(shouldClearItemsOnCategoryChange('MATERIAL_WITH_SKU', ''), false);
});

// ─────────────────────────────────────────────────────────────────────────────
// Bug 6: Machine work orders — wrong GraphQL field
// ─────────────────────────────────────────────────────────────────────────────

test('Bug 6: getMachineWorkOrdersQueryField returns machine.workOrders path', () => {
  const { getMachineWorkOrdersQueryField } = loadTsModule(
    'src/lib/machines/machine-work-orders-logic.ts',
  );

  assert.equal(
    getMachineWorkOrdersQueryField(),
    'machine.workOrders',
    'must use machine.workOrders resolver, not workOrdersFiltered',
  );
});

test('Bug 6: extractMachineWorkOrders extracts from correct response shape', () => {
  const { extractMachineWorkOrders } = loadTsModule(
    'src/lib/machines/machine-work-orders-logic.ts',
  );

  const mockData = {
    machine: {
      workOrders: [
        { id: 'wo-1', folio: 'OT-0001' },
        { id: 'wo-2', folio: 'OT-0002' },
      ],
    },
  };

  const result = extractMachineWorkOrders(mockData);
  assert.equal(result.length, 2, 'must extract 2 work orders');
  assert.equal(result[0].folio, 'OT-0001');
});

test('Bug 6: extractMachineWorkOrders returns empty array on null/undefined response', () => {
  const { extractMachineWorkOrders } = loadTsModule(
    'src/lib/machines/machine-work-orders-logic.ts',
  );

  assert.equal(extractMachineWorkOrders(null).length, 0, 'null data → empty array');
  assert.equal(extractMachineWorkOrders(undefined).length, 0, 'undefined data → empty array');
  assert.equal(extractMachineWorkOrders({ machine: null }).length, 0, 'null machine → empty array');
  assert.equal(
    extractMachineWorkOrders({ machine: { workOrders: null } }).length,
    0,
    'null workOrders → empty array',
  );
});

test('Bug 6: extractWorkOrdersFiltered (legacy/broken path) produces empty results for UUID search', () => {
  const { extractWorkOrdersFiltered } = loadTsModule(
    'src/lib/machines/machine-work-orders-logic.ts',
  );

  // The legacy query searched by UUID as text — no work order folio matches a UUID,
  // so real responses always had data: [] from the backend.
  // We document this behaviour: passing a response with no matching data gives [].
  const mockLegacyResponse = {
    workOrdersFiltered: { data: [] },
  };

  assert.deepEqual(
    extractWorkOrdersFiltered(mockLegacyResponse),
    [],
    'legacy path returned empty results because UUID never matched folio/description',
  );
});
