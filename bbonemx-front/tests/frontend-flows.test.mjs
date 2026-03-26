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

test('login y rutas protegidas', () => {
  const { resolveLoginRedirectPath, resolveProtectedRouteAccess } = loadTsModule(
    'src/lib/auth/auth-flow.ts',
  );

  assert.equal(resolveLoginRedirectPath('/admin'), '/admin');
  assert.equal(resolveLoginRedirectPath(undefined), '/');

  const unauthorized = resolveProtectedRouteAccess({
    isLoading: false,
    isAuthenticated: false,
    hasUser: false,
    isUserActive: false,
    activeRole: null,
    isBoss: false,
    allowedRoles: ['ADMIN'],
  });
  assert.equal(unauthorized, '/login');

  const authorized = resolveProtectedRouteAccess({
    isLoading: false,
    isAuthenticated: true,
    hasUser: true,
    isUserActive: true,
    activeRole: 'ADMIN',
    isBoss: false,
    allowedRoles: ['ADMIN'],
  });
  assert.equal(authorized, 'allow');
});

test('creación/cierre de OT', () => {
  const { canCreateWorkOrder, canCloseWorkOrder } = loadTsModule(
    'src/lib/work-orders/work-order-flow.ts',
  );

  assert.equal(canCreateWorkOrder('Falla de banda transportadora'), true);
  assert.equal(canCreateWorkOrder('   '), false);

  assert.equal(
    canCloseWorkOrder({
      isAveria: true,
      cause: 'Desgaste',
      actionTaken: 'Cambio de pieza',
      downtimeMinutes: 15,
    }),
    true,
  );
  assert.equal(
    canCloseWorkOrder({
      isAveria: false,
      observations: 'Ajuste preventivo realizado',
    }),
    true,
  );
});

test('manejo de errores GraphQL para refresh', () => {
  const { shouldAttemptRefresh } = loadTsModule(
    'src/lib/graphql/error-handling.ts',
  );

  assert.equal(
    shouldAttemptRefresh('GetWorkOrders', false, ['UNAUTHENTICATED']),
    true,
  );
  assert.equal(
    shouldAttemptRefresh('RefreshAuth', false, ['UNAUTHENTICATED']),
    false,
  );
  assert.equal(
    shouldAttemptRefresh('GetWorkOrders', true, ['UNAUTHENTICATED']),
    false,
  );
});
