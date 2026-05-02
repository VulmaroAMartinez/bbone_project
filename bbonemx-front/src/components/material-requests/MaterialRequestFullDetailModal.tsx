import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  formatDate,
} from '@/components/material-requests/material-request.constants';
import { resolveBackendAssetUrl } from '@/lib/utils/uploads';
import type { GetMaterialRequestHistoriesQuery } from '@/lib/graphql/generated/graphql';

type MaterialRequestRow =
  GetMaterialRequestHistoriesQuery['materialRequestsWithDeleted'][number];

interface MaterialRequestFullDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request?: MaterialRequestRow;
  derivedArea?: string;
}

export function MaterialRequestFullDetailModal({
  open,
  onOpenChange,
  request,
  derivedArea,
}: MaterialRequestFullDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle completo de la solicitud</DialogTitle>
          <DialogDescription>
            {request?.folio} —{' '}
            {CATEGORY_LABELS[request?.category ?? ''] ?? request?.category}
          </DialogDescription>
        </DialogHeader>

        {request && (
          <div className="space-y-5">
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Datos generales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Folio:</span>{' '}
                  {request.folio}
                </p>
                <p>
                  <span className="text-muted-foreground">Solicitante:</span>{' '}
                  {request.requester.fullName}
                </p>
                <p>
                  <span className="text-muted-foreground">N. empleado:</span>{' '}
                  {request.requester.employeeNumber ?? '—'}
                </p>
                <p>
                  <span className="text-muted-foreground">Jefe a cargo:</span>{' '}
                  {request.boss ?? '—'}
                </p>
                <p>
                  <span className="text-muted-foreground">Categoría:</span>{' '}
                  {CATEGORY_LABELS[request.category] ?? request.category}
                </p>
                <p>
                  <span className="text-muted-foreground">Prioridad:</span>{' '}
                  {PRIORITY_LABELS[request.priority] ?? request.priority}
                </p>
                <p>
                  <span className="text-muted-foreground">Área derivada:</span>{' '}
                  {derivedArea ?? '—'}
                </p>
                <p>
                  <span className="text-muted-foreground">Creada:</span>{' '}
                  {formatDate(request.createdAt)}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Descripción:</span>{' '}
                  {request.description || '—'}
                </p>
                <p>
                  <span className="text-muted-foreground">Justificación:</span>{' '}
                  {request.justification || '—'}
                </p>
                <p>
                  <span className="text-muted-foreground">Comentarios:</span>{' '}
                  {request.comments || '—'}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    Proveedor sugerido:
                  </span>{' '}
                  {request.suggestedSupplier || '—'}
                </p>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Máquinas</h3>
              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipo</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Fabricante</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Subárea</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(request.machines ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground"
                        >
                          Sin máquinas
                        </TableCell>
                      </TableRow>
                    ) : (
                      (request.machines ?? []).map((mrm) => (
                        <TableRow key={mrm.id}>
                          <TableCell>
                            {mrm.machine?.name ?? mrm.customMachineName ?? '—'}
                          </TableCell>
                          <TableCell>{mrm.machine?.brand ?? '—'}</TableCell>
                          <TableCell>
                            {mrm.machine?.model ?? mrm.customMachineModel ?? '—'}
                          </TableCell>
                          <TableCell>
                            {mrm.machine?.manufacturer ??
                              mrm.customMachineManufacturer ??
                              '—'}
                          </TableCell>
                          <TableCell>
                            {mrm.machine?.area?.name ??
                              mrm.machine?.subArea?.area?.name ??
                              mrm.customMachineArea ??
                              '—'}
                          </TableCell>
                          <TableCell>{mrm.machine?.subArea?.name ?? '—'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Historial de seguimiento</h3>
              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estatus</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>S.C.</TableHead>
                      <TableHead>O.C.</TableHead>
                      <TableHead>E.M.</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>F. estimada</TableHead>
                      <TableHead>F. entrega</TableHead>
                      <TableHead>Progreso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(request.histories ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center text-muted-foreground"
                        >
                          Sin historial
                        </TableCell>
                      </TableRow>
                    ) : (
                      [...(request.histories ?? [])]
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime(),
                        )
                        .map((h) => (
                          <TableRow key={h.id}>
                            <TableCell>
                              {STATUS_LABELS[h.status] ?? h.status}
                            </TableCell>
                            <TableCell>
                              {h.createdAt ? formatDate(h.createdAt) : '—'}
                            </TableCell>
                            <TableCell>{h.purchaseRequest || '—'}</TableCell>
                            <TableCell>{h.purchaseOrder || '—'}</TableCell>
                            <TableCell>{h.deliveryMerchandise || '—'}</TableCell>
                            <TableCell>{h.supplier || '—'}</TableCell>
                            <TableCell>
                              {h.estimatedDeliveryDate
                                ? formatDate(h.estimatedDeliveryDate)
                                : '—'}
                            </TableCell>
                            <TableCell>
                              {h.deliveryDate ? formatDate(h.deliveryDate) : '—'}
                            </TableCell>
                            <TableCell>{h.progressPercentage ?? 0}%</TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Artículos</h3>
              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>N. parte</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead>Stock min/máx</TableHead>
                      <TableHead>Genérico</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(request.items ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center text-muted-foreground"
                        >
                          Sin artículos
                        </TableCell>
                      </TableRow>
                    ) : (
                      (request.items ?? []).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.sku || '—'}</TableCell>
                          <TableCell>
                            {item.description || item.customName || '—'}
                          </TableCell>
                          <TableCell>{item.brand || '—'}</TableCell>
                          <TableCell>{item.model || '—'}</TableCell>
                          <TableCell>{item.partNumber || '—'}</TableCell>
                          <TableCell className="text-right">
                            {item.requestedQuantity ?? '—'}
                          </TableCell>
                          <TableCell>{item.unitOfMeasure || '—'}</TableCell>
                          <TableCell>
                            {(item.proposedMinStock ??
                              item.proposedMaxStock ??
                              null) == null
                              ? '—'
                              : `${item.proposedMinStock ?? '—'} / ${item.proposedMaxStock ?? '—'}`}
                          </TableCell>
                          <TableCell>{item.isGenericAllowed ? 'Sí' : 'No'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Fotos</h3>
              {(request.photos ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin fotos adjuntas</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(request.photos ?? []).map((photo) => (
                    <a
                      key={photo.id}
                      href={resolveBackendAssetUrl(photo.filePath)}
                      target="_blank"
                      rel="noreferrer"
                      className="group border rounded-md overflow-hidden"
                    >
                      <img
                        src={resolveBackendAssetUrl(photo.filePath)}
                        alt={photo.fileName}
                        className="h-28 w-full object-cover group-hover:opacity-90 transition-opacity"
                      />
                      <div className="p-2">
                        <p className="text-[11px] truncate">{photo.fileName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(photo.uploadedAt)}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
