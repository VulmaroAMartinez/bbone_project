/**
 * Offline Sync — Cola de tareas pendientes para sincronización offline.
 *
 * Almacena fotos/firmas como Base64 en localforage y las reproduce
 * cuando se recupera la conexión.
 */

import localforage from 'localforage';

// ─── Constantes ───────────────────────────────────────────────
export const SYNC_QUEUE_KEY = 'offline-sync-queue';
export const MAX_RETRIES = 5;
/** Límite de tamaño de archivo para Base64 (10 MB). Exportado para reusar en validaciones de UI. */
export const MAX_FILE_BYTES = 10_485_760;

// ─── Tipos ────────────────────────────────────────────────────
export interface FilePayload {
  base64: string;
  fileName: string;
  mimeType: string;
}

interface SyncTaskBase {
  id: string;
  createdAt: string;
  retryCount: number;
  status: 'pending' | 'processing' | 'failed';
}

export interface UploadWOPhotoTask extends SyncTaskBase {
  type: 'UPLOAD_WO_PHOTO';
  payload: {
    workOrderId: string;
    file: FilePayload;
    photoType: 'BEFORE' | 'AFTER';
  };
}

export interface UploadWOSignatureTask extends SyncTaskBase {
  type: 'UPLOAD_WO_SIGNATURE';
  payload: {
    workOrderId: string;
    file: FilePayload;
  };
}

export interface CreateWorkOrderTask extends SyncTaskBase {
  type: 'CREATE_WORK_ORDER';
  payload: {
    areaId: string;
    subAreaId?: string;
    description: string;
    photo?: FilePayload;
  };
}

export interface CreateFindingTask extends SyncTaskBase {
  type: 'CREATE_FINDING';
  payload: {
    areaId: string;
    shiftId: string;
    description: string;
    photo?: FilePayload;
  };
}

/** Espejo de CompleteWorkOrderInput (sin importar tipos GraphQL en este módulo puro) */
export interface CompleteWOInput {
  finalStatus?: string;
  toolsUsed?: string;
  cause?: string;
  actionTaken?: string;
  downtimeMinutes?: number;
  observations?: string;
  breakdownDescription?: string;
  customSparePart?: string;
  customMaterial?: string;
}

export interface CompleteWorkOrderTask extends SyncTaskBase {
  type: 'COMPLETE_WORK_ORDER';
  payload: {
    workOrderId: string;
    input: CompleteWOInput;
    sparePartId?: string;
    materialId?: string;
    photo?: FilePayload;
  };
}

export type SyncTask =
  | UploadWOPhotoTask
  | UploadWOSignatureTask
  | CreateWorkOrderTask
  | CreateFindingTask
  | CompleteWorkOrderTask;

type SyncTaskInput = Omit<SyncTask, 'id' | 'createdAt' | 'retryCount' | 'status'>;

// ─── Conversión Base64 ↔ File ─────────────────────────────────

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_BYTES) {
      reject(new Error(`El archivo excede el límite de ${MAX_FILE_BYTES / 1_048_576} MB`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => {
      reader.abort(); // libera recursos inmediatamente tras el error
      reject(reader.error);
    };
    reader.readAsDataURL(file);
  });
}

export function base64ToFile(base64: string, fileName: string, mimeType: string): File {
  const [header, data] = base64.split(',');
  if (!data) {
    throw new Error('Formato Base64 inválido');
  }
  const isBase64 = header.includes('base64');
  const binaryStr = isBase64 ? atob(data) : decodeURIComponent(data);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return new File([bytes], fileName, { type: mimeType });
}

// ─── CRUD de cola ─────────────────────────────────────────────
// Todos los accesos a localforage están envueltos en try/catch para manejar
// fallas de IndexedDB (modo privado, cuota excedida, políticas del navegador).

export async function getQueue(): Promise<SyncTask[]> {
  try {
    const queue = await localforage.getItem<SyncTask[]>(SYNC_QUEUE_KEY);
    return queue ?? [];
  } catch {
    // IndexedDB no disponible; tratar la cola como vacía para no bloquear la UI
    return [];
  }
}

export async function enqueueTask(input: SyncTaskInput): Promise<SyncTask> {
  const task: SyncTask = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    retryCount: 0,
    status: 'pending',
  } as SyncTask;

  const queue = await getQueue();
  // Si el setItem falla, la tarea se pierde pero el usuario ya recibió feedback positivo;
  // propagar el error para que el llamador pueda mostrar un mensaje de fallo.
  await localforage.setItem(SYNC_QUEUE_KEY, [...queue, task]);
  return task;
}

export async function removeTask(taskId: string): Promise<void> {
  try {
    const queue = await getQueue();
    await localforage.setItem(SYNC_QUEUE_KEY, queue.filter((t) => t.id !== taskId));
  } catch {
    // No fatal: la tarea se reintentará en el próximo ciclo de sync
  }
}

export async function updateTask(
  taskId: string,
  updates: Partial<Pick<SyncTaskBase, 'retryCount' | 'status'>>,
): Promise<void> {
  try {
    const queue = await getQueue();
    await localforage.setItem(
      SYNC_QUEUE_KEY,
      queue.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    );
  } catch {
    // No fatal: el estado en memoria puede divergir del storage en casos extremos
  }
}

export async function clearFailedTasks(): Promise<void> {
  try {
    const queue = await getQueue();
    await localforage.setItem(SYNC_QUEUE_KEY, queue.filter((t) => t.status !== 'failed'));
  } catch {
    // Ignorar; se reintentará
  }
}

export async function getQueueSize(): Promise<number> {
  const queue = await getQueue();
  return queue.filter((t) => t.status === 'pending').length;
}
