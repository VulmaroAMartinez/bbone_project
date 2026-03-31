import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const root = path.resolve(import.meta.dirname, '..');
const localRequire = createRequire(import.meta.url);

function loadTsModule(relativePath, { mocks = {}, extraContext = {} } = {}) {
  const fullPath = path.join(root, relativePath);
  let source = fs.readFileSync(fullPath, 'utf8');
  source = source.replaceAll('import.meta.env', '__IMPORT_META_ENV__');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;

  const module = { exports: {} };
  const mockRequire = (id) => {
    if (id in mocks) return mocks[id];
    return localRequire(id);
  };

  const context = vm.createContext({
    module,
    exports: module.exports,
    require: mockRequire,
    setInterval,
    clearInterval,
    navigator: globalThis.navigator,
    window: globalThis.window,
    ...extraContext,
  });

  new vm.Script(transpiled, { filename: fullPath }).runInContext(context);
  return module.exports;
}

function passthroughComponent(tag = 'div') {
  return ({ children, ...props }) => React.createElement(tag, props, children);
}

test('PWAPrompt renderiza aviso cuando hay actualización disponible', () => {
  const module = loadTsModule('src/components/layout/PWAPrompt.tsx', {
    mocks: {
      'virtual:pwa-register/react': {
        useRegisterSW: () => ({
          needRefresh: [true, () => {}],
          updateServiceWorker: () => {},
        }),
      },
      '@/components/ui/card': {
        Card: passthroughComponent('section'),
        CardContent: passthroughComponent('div'),
        CardFooter: passthroughComponent('footer'),
      },
      '@/components/ui/button': { Button: passthroughComponent('button') },
      'lucide-react': { RefreshCw: passthroughComponent('svg') },
    },
  });

  const html = renderToStaticMarkup(React.createElement(module.PWAPrompt));
  assert.ok(html.includes('Nueva versión disponible'));
  assert.ok(html.includes('Actualizar ahora'));
});

test('PWAPrompt no renderiza contenido cuando no hay actualización', () => {
  const module = loadTsModule('src/components/layout/PWAPrompt.tsx', {
    mocks: {
      'virtual:pwa-register/react': {
        useRegisterSW: () => ({
          needRefresh: [false, () => {}],
          updateServiceWorker: () => {},
        }),
      },
      '@/components/ui/card': {
        Card: passthroughComponent('section'),
        CardContent: passthroughComponent('div'),
        CardFooter: passthroughComponent('footer'),
      },
      '@/components/ui/button': { Button: passthroughComponent('button') },
      'lucide-react': { RefreshCw: passthroughComponent('svg') },
    },
  });

  const html = renderToStaticMarkup(React.createElement(module.PWAPrompt));
  assert.equal(html, '');
});

test('GlobalSyncManager: offline → enqueue → online → sync', async () => {
  const originalNavigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const updateCalls = [];
  const removed = [];
  const queue = [
    {
      id: 'task-1',
      type: 'CREATE_WORK_ORDER',
      retryCount: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      payload: {
        areaId: 'area-1',
        subAreaId: 'sub-1',
        description: 'OT offline',
      },
    },
  ];

  const mutateCalls = [];
  const toastSuccess = [];
  const toastError = [];

  Object.defineProperty(globalThis, 'navigator', { value: { onLine: false }, configurable: true });

  const buildModule = () => loadTsModule('src/components/GlobalSyncManager.tsx', {
    mocks: {
      '@/lib/graphql/client': {
        client: {
          mutate: async (input) => {
            mutateCalls.push(input);
            return { data: { createWorkOrder: { id: 'wo-1' } } };
          },
        },
      },
      '@/lib/utils/uploads': {
        uploadFileToBackend: async () => ({ url: 'https://files.local/mock.jpg' }),
      },
      '@/lib/graphql/generated/graphql': {
        CreateWorkOrderDocument: {},
        CreateFindingDocument: {},
        CompleteWorkOrderDocument: {},
        UploadWorkOrderPhotoDocument: {},
        SignWorkOrderDocument: {},
      },
      '@/lib/graphql/operations/work-orders': {
        ADD_WORK_ORDER_SPARE_PART_MUTATION: {},
        ADD_WORK_ORDER_MATERIAL_MUTATION: {},
      },
      '@/lib/offline-sync': {
        MAX_RETRIES: 5,
        base64ToFile: () => ({}),
        getQueue: async () => queue,
        removeTask: async (id) => {
          removed.push(id);
          const idx = queue.findIndex((t) => t.id === id);
          if (idx >= 0) queue.splice(idx, 1);
        },
        updateTask: async (id, changes) => {
          updateCalls.push({ id, changes });
          const item = queue.find((t) => t.id === id);
          if (item) Object.assign(item, changes);
        },
      },
      sonner: {
        toast: {
          success: (msg) => toastSuccess.push(msg),
          error: (msg) => toastError.push(msg),
        },
      },
    },
    extraContext: {
      navigator: globalThis.navigator,
    },
  });

  let module = buildModule();
  await module.__test__.processQueue();
  assert.equal(mutateCalls.length, 0);

  Object.defineProperty(globalThis, 'navigator', { value: { onLine: true }, configurable: true });
  module = buildModule();
  await module.__test__.processQueue();

  assert.equal(mutateCalls.length, 1);
  assert.equal(removed[0], 'task-1');
  assert.ok(updateCalls.some((c) => c.changes.status === 'processing'));
  assert.equal(toastError.length, 0);
  assert.equal(toastSuccess.length, 1);

  if (originalNavigatorDescriptor) {
    Object.defineProperty(globalThis, 'navigator', originalNavigatorDescriptor);
  }
});

test('OfflineBanner y OfflineFallback renderizan mensajes de estado offline', () => {
  const sharedMocks = {
    'lucide-react': { WifiOff: passthroughComponent('svg') },
    '@/components/ui/button': { Button: passthroughComponent('button') },
  };

  const bannerModule = loadTsModule('src/components/ui/offline-banner.tsx', {
    mocks: sharedMocks,
  });
  const fallbackModule = loadTsModule('src/components/ui/offline-fallback.tsx', {
    mocks: sharedMocks,
    extraContext: {
      window: { location: { reload: () => {} } },
    },
  });

  const bannerHtml = renderToStaticMarkup(React.createElement(bannerModule.OfflineBanner));
  const fallbackHtml = renderToStaticMarkup(React.createElement(fallbackModule.OfflineFallback));

  assert.ok(bannerHtml.includes('Sin conexión. Mostrando datos almacenados en caché.'));
  assert.ok(fallbackHtml.includes('Sin conexión a internet'));
  assert.ok(fallbackHtml.includes('Reintentar'));
});

test('Apollo cache: restaura y persiste estado en localforage', async () => {
  const persisted = { ROOT_QUERY: { __typename: 'Query', ping: 'pong' } };
  let storedRaw = JSON.stringify(persisted);

  const restoreCalls = [];
  let extractCalls = 0;
  let persistedValue = null;
  const intervals = [];

  const module = loadTsModule('src/lib/graphql/client.ts', {
    mocks: {
      '@apollo/client': {
        ApolloClient: class {
          constructor(config) {
            this.config = config;
          }
        },
        InMemoryCache: class {
          restore(value) {
            restoreCalls.push(value);
          }
          extract() {
            extractCalls += 1;
            return persisted;
          }
        },
        HttpLink: class {},
        ApolloLink: class {
          static from() {
            return {};
          }
          constructor(handler) {
            this.handler = handler;
          }
        },
        Observable: class {},
      },
      '@apollo/client/link/error': { ErrorLink: class {} },
      '@apollo/client/link/retry': { RetryLink: class {} },
      '@apollo/client/errors': {
        CombinedGraphQLErrors: { is: () => false },
        CombinedProtocolErrors: { is: () => false },
      },
      localforage: {
        getItem: async () => storedRaw,
        setItem: async (_key, value) => {
          persistedValue = value;
        },
        removeItem: async () => {
          storedRaw = null;
        },
      },
      '../logging': {
        logDevWarning: () => {},
        reportError: () => {},
      },
      './error-handling': {
        shouldAttemptRefresh: () => false,
      },
    },
    extraContext: {
      __IMPORT_META_ENV__: { VITE_GRAPHQL_URL: 'http://localhost/graphql', DEV: false },
      setInterval: (fn) => {
        intervals.push(fn);
        return 1;
      },
    },
  });

  await module.initApolloCache();
  assert.equal(restoreCalls.length, 1);
  assert.equal(JSON.stringify(restoreCalls[0]), JSON.stringify(persisted));

  assert.equal(intervals.length, 1);
  intervals[0]();

  assert.equal(extractCalls, 1);
  assert.equal(persistedValue, JSON.stringify(persisted));
});
