/**
 * GlobalSyncManager — Componente invisible que sincroniza tareas offline.
 *
 * Escucha el evento `online` y un intervalo periódico para procesar
 * la cola de tareas pendientes (fotos, firmas, creación de OTs, hallazgos
 * y cierres de órdenes almacenados como Base64).
 */

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { client } from '@/lib/graphql/client';
import { uploadFileToBackend } from '@/lib/utils/uploads';
import {
  CreateWorkOrderDocument,
  CreateFindingDocument,
  CompleteWorkOrderDocument,
  UploadWorkOrderPhotoDocument,
  SignWorkOrderDocument,
  type CompleteWorkOrderInput,
} from '@/lib/graphql/generated/graphql';
import {
  ADD_WORK_ORDER_SPARE_PART_MUTATION,
  ADD_WORK_ORDER_MATERIAL_MUTATION,
} from '@/lib/graphql/operations/work-orders';

import {
  getQueue,
  removeTask,
  updateTask,
  base64ToFile,
  MAX_RETRIES,
  type SyncTask,
} from '@/lib/offline-sync';

const POLL_INTERVAL_MS = 60_000;

async function processTask(task: SyncTask): Promise<void> {
  switch (task.type) {
    // ── FASE 3: fotos y firmas ──────────────────────────────────────────────
    case 'UPLOAD_WO_PHOTO': {
      const { workOrderId, file, photoType } = task.payload;
      const reconstructed = base64ToFile(file.base64, file.fileName, file.mimeType);
      const uploadRes = await uploadFileToBackend(reconstructed);

      await client.mutate({
        mutation: UploadWorkOrderPhotoDocument,
        variables: {
          input: {
            workOrderId,
            fileName: file.fileName,
            mimeType: file.mimeType,
            photoType,
            filePath: uploadRes.url,
          },
        },
      });
      break;
    }

    case 'UPLOAD_WO_SIGNATURE': {
      const { workOrderId, file } = task.payload;
      const reconstructed = base64ToFile(file.base64, file.fileName, file.mimeType);
      const uploadRes = await uploadFileToBackend(reconstructed);

      await client.mutate({
        mutation: SignWorkOrderDocument,
        variables: {
          input: {
            workOrderId,
            signatureImagePath: uploadRes.url,
          },
        },
      });
      break;
    }

    // ── FASE 4: flujos críticos ─────────────────────────────────────────────
    case 'CREATE_WORK_ORDER': {
      const { areaId, subAreaId, description, photo } = task.payload;

      const result = await client.mutate({
        mutation: CreateWorkOrderDocument,
        variables: { input: { areaId, subAreaId, description } },
      });

      const workOrderId = result.data?.createWorkOrder.id;
      if (!workOrderId) throw new Error('CREATE_WORK_ORDER: sin workOrderId en la respuesta');

      if (photo) {
        const reconstructed = base64ToFile(photo.base64, photo.fileName, photo.mimeType);
        const uploadRes = await uploadFileToBackend(reconstructed);
        await client.mutate({
          mutation: UploadWorkOrderPhotoDocument,
          variables: {
            input: {
              workOrderId,
              fileName: photo.fileName,
              mimeType: photo.mimeType,
              photoType: 'BEFORE',
              filePath: uploadRes.url,
            },
          },
        });
      }
      break;
    }

    case 'CREATE_FINDING': {
      const { areaId, shiftId, description, photo } = task.payload;

      const photoPath = photo
        ? await uploadFileToBackend(base64ToFile(photo.base64, photo.fileName, photo.mimeType)).then(
            (r) => r.url,
          )
        : 'sin-foto.jpg';

      await client.mutate({
        mutation: CreateFindingDocument,
        variables: { input: { areaId, shiftId, description, photoPath } },
      });
      break;
    }

    case 'COMPLETE_WORK_ORDER': {
      const { workOrderId, input, sparePartId, materialId, photo } = task.payload;

      await client.mutate({
        mutation: CompleteWorkOrderDocument,
        variables: { id: workOrderId, input: input as CompleteWorkOrderInput },
      });

      if (sparePartId) {
        await client.mutate({
          mutation: ADD_WORK_ORDER_SPARE_PART_MUTATION,
          variables: { input: { workOrderId, sparePartId, quantity: 1 } },
        });
      }

      if (materialId) {
        await client.mutate({
          mutation: ADD_WORK_ORDER_MATERIAL_MUTATION,
          variables: { input: { workOrderId, materialId, quantity: 1 } },
        });
      }

      if (photo) {
        const reconstructed = base64ToFile(photo.base64, photo.fileName, photo.mimeType);
        const uploadRes = await uploadFileToBackend(reconstructed);
        await client.mutate({
          mutation: UploadWorkOrderPhotoDocument,
          variables: {
            input: {
              workOrderId,
              fileName: photo.fileName,
              mimeType: photo.mimeType,
              photoType: 'AFTER',
              filePath: uploadRes.url,
            },
          },
        });
      }
      break;
    }
  }
}

async function processQueue(): Promise<void> {
  if (!navigator.onLine) return;

  const queue = await getQueue();

  // Recuperar tareas que quedaron atascadas en 'processing' por un crash anterior
  // (p.ej. si el tab se cerró o IndexedDB falló a mitad del ciclo previo).
  const stuckTasks = queue.filter((t) => t.status === 'processing');
  for (const t of stuckTasks) {
    await updateTask(t.id, { status: 'pending' });
  }

  const pending = queue.filter((t) => t.status === 'pending' || t.status === 'processing');
  if (pending.length === 0) return;

  let synced = 0;

  for (const task of pending) {
    await updateTask(task.id, { status: 'processing' });

    try {
      await processTask(task);
      await removeTask(task.id);
      synced += 1;
    } catch {
      const nextRetry = task.retryCount + 1;
      if (nextRetry >= MAX_RETRIES) {
        await updateTask(task.id, { status: 'failed', retryCount: nextRetry });
        toast.error(`No se pudo sincronizar una tarea después de ${MAX_RETRIES} intentos.`);
      } else {
        await updateTask(task.id, { status: 'pending', retryCount: nextRetry });
      }
    }
  }

  if (synced > 0) {
    const label = synced === 1 ? 'archivo sincronizado' : 'archivos sincronizados';
    toast.success(`${synced} ${label} correctamente.`);
  }
}

export function GlobalSyncManager(): null {
  const processingRef = useRef(false);

  useEffect(() => {
    const safeProcess = async () => {
      if (processingRef.current) return;
      processingRef.current = true;
      try {
        await processQueue();
      } finally {
        processingRef.current = false;
      }
    };

    // Procesar tareas pendientes de sesiones anteriores
    safeProcess();

    window.addEventListener('online', safeProcess);
    const intervalId = setInterval(safeProcess, POLL_INTERVAL_MS);

    return () => {
      window.removeEventListener('online', safeProcess);
      clearInterval(intervalId);
    };
  }, []);

  return null;
}
