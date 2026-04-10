import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import {
    GetMaterialRequestDocument,
    GetMaterialRequestsDocument,
    SendMaterialRequestEmailDocument,
    type GetMaterialRequestQuery,
} from '@/lib/graphql/generated/graphql';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    ArrowLeft,
    Mail,
    Edit2,
    Package,
    User,
    Cog,
    MapPin,
    Calendar,
    Info,
    Camera,
} from 'lucide-react';
import { resolveBackendAssetUrl } from '@/lib/utils/uploads';

import {
    CATEGORY_LABELS,
    PRIORITY_LABELS,
    IMPORTANCE_LABELS,
    PRIORITY_COLORS,
    IMPORTANCE_COLORS,
} from '@/components/material-requests/material-request.constants';

// ─── Email modal ─────────────────────────────────────────────────────────────

interface EmailModalProps {
    open: boolean;
    onClose: () => void;
    materialRequestId: string;
    folio: string;
}

function EmailModal({ open, onClose, materialRequestId, folio }: EmailModalProps) {
    const [to, setTo] = useState('');
    const [cc, setCc] = useState('');
    const [message, setMessage] = useState(
        `Estimado equipo,\n\nAdjunto la solicitud de material ${folio} para su revisión y aprobación.\n\nSaludos.`,
    );

    const [sendEmail, { loading: sending }] = useMutation(SendMaterialRequestEmailDocument, {
        refetchQueries: [
            { query: GetMaterialRequestDocument, variables: { id: materialRequestId } },
            GetMaterialRequestsDocument,
        ],
    });

    const handleClose = () => {
        setTo('');
        setCc('');
        onClose();
    };

    const parseEmails = (raw: string): string[] =>
        raw.split(',').map((e) => e.trim()).filter(Boolean);

    const handleSend = async () => {
        const toEmails = parseEmails(to);
        if (toEmails.length === 0) return;

        try {
            await sendEmail({
                variables: {
                    input: {
                        materialRequestId,
                        to: toEmails,
                        cc: cc.trim() ? parseEmails(cc) : undefined,
                        message: message.trim() || undefined,
                    },
                },
            });
            toast.success('Correo enviado exitosamente');
            handleClose();
        } catch {
            toast.error('Error al enviar el correo. Intenta de nuevo.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md w-full">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        Enviar solicitud por correo
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="email-to">
                            Para <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="email-to"
                            type="text"
                            placeholder="destinatario@empresa.com"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Separa múltiples correos con coma
                        </p>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="email-cc">Con copia a</Label>
                        <Input
                            id="email-cc"
                            type="text"
                            placeholder="copia@empresa.com"
                            value={cc}
                            onChange={(e) => setCc(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="email-msg">Mensaje</Label>
                        <Textarea
                            id="email-msg"
                            rows={5}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handleClose} disabled={sending}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={sending || !to.trim()}
                        className="gap-2"
                    >
                        {sending ? (
                            'Enviando...'
                        ) : (
                            <>
                                <Mail className="h-4 w-4" />
                                Enviar
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MaterialRequestDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [emailOpen, setEmailOpen] = useState(false);

    const { data, loading } = useQuery<GetMaterialRequestQuery>(GetMaterialRequestDocument, {
        variables: { id: id! },
        skip: !id,
        fetchPolicy: 'cache-and-network',
    });

    const request = data?.materialRequest ?? null;

    const formatDateLong = (d: string) =>
        new Date(d).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading && !data) {
        return (
            <div className="space-y-4 pb-20">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-36 w-full" />
                <Skeleton className="h-36 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        );
    }

    // ── Not found ─────────────────────────────────────────────────────────────
    if (!request) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Info className="h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">Solicitud no encontrada.</p>
                <Button variant="outline" onClick={() => navigate('/solicitud-material')}>
                    Volver al listado
                </Button>
            </div>
        );
    }

    // ── Data ──────────────────────────────────────────────────────────────────
    const machineEntities = (request.machines ?? []).map((mrm) => mrm.machine);
    const areaNames = new Set(
        machineEntities.map((m) => m?.area?.name ?? m?.subArea?.area?.name).filter(Boolean),
    );
    const derivedAreaName = areaNames.size === 1
        ? [...areaNames][0]
        : areaNames.size > 1
            ? 'Diversas áreas'
            : null;

    const isServiceOnlyCategory = request.category === 'SERVICE';
    const showItemsCard = !isServiceOnlyCategory;
    const showServiceCard = isServiceOnlyCategory || request.category === 'SERVICE_WITH_MATERIAL';

    return (
        <div className="space-y-5 pb-24">
            {/* Header */}
            <div className="space-y-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/solicitud-material')}
                    className="gap-1.5 -ml-2 text-muted-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Solicitudes
                </Button>

                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold font-mono text-foreground tracking-wide">
                            {request.folio}
                        </h1>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDateLong(request.createdAt)}
                        </p>
                        {request.emailSentAt && (
                            <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                                <Mail className="h-3 w-3" />
                                Correo enviado: {formatDateLong(request.emailSentAt)}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setEmailOpen(true)}
                            disabled={!!request.emailSentAt}
                        >
                            <Mail className="h-4 w-4" />
                            {request.emailSentAt ? 'Correo enviado' : 'Enviar correo'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => navigate(`/solicitud-material/${id}/editar`)}
                            disabled={!!request.emailSentAt}
                        >
                            <Edit2 className="h-4 w-4" />
                            Editar
                        </Button>
                    </div>
                </div>

                {/* Badges estado */}
                <div className="flex flex-wrap gap-1.5">
                    <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[request.priority] ?? ''}`}>
                        {PRIORITY_LABELS[request.priority] ?? request.priority}
                    </span>
                    <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full border ${IMPORTANCE_COLORS[request.importance] ?? ''}`}>
                        {IMPORTANCE_LABELS[request.importance] ?? request.importance}
                    </span>
                    <Badge variant="outline" className="text-xs font-normal">
                        {CATEGORY_LABELS[request.category] ?? request.category}
                    </Badge>
                    {!request.isActive && (
                        <Badge variant="destructive" className="text-xs">Inactiva</Badge>
                    )}
                </div>
            </div>

            {/* Información general */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        Información de la solicitud
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Solicitante</p>
                            <p className="font-medium flex items-center gap-1">
                                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                {request.requester.fullName}
                            </p>
                            {request.requester.employeeNumber && (
                                <p className="text-xs text-muted-foreground font-mono">{request.requester.employeeNumber}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Jefe a cargo</p>
                            <p className="font-medium">{request.boss}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Equipo */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Cog className="h-4 w-4 text-muted-foreground" />
                        Equipo / Estructura
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-sm">
                    {derivedAreaName && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <p className="text-sm font-medium">{derivedAreaName}</p>
                        </div>
                    )}
                    {machineEntities.map((machine, idx: number) => {
                        const mArea = machine?.area?.name ?? machine?.subArea?.area?.name;
                        const mSubArea = machine?.subArea?.name;
                        return (
                            <div key={machine?.id ?? idx} className="flex items-start gap-2.5">
                                <Cog className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-medium">{machine?.name}</p>
                                    {(machine?.brand || machine?.model) && (
                                        <p className="text-xs text-muted-foreground">
                                            {[machine?.brand, machine?.model].filter(Boolean).join(' · ')}
                                        </p>
                                    )}
                                    {mArea && machineEntities.length > 1 && (
                                        <p className="text-xs text-muted-foreground">
                                            {mArea}{mSubArea && ` › ${mSubArea}`}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {/* Servicio */}
            {showServiceCard && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Cog className="h-4 w-4 text-muted-foreground" />
                            Servicio
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                        <p className="text-xs text-muted-foreground mb-0.5 font-medium">Descripción</p>
                        <p className="text-foreground whitespace-pre-line leading-relaxed">
                            {request.description?.trim() || 'Sin descripción.'}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Artículos (solo si la categoría requiere artículos) */}
            {showItemsCard && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            Artículos solicitados
                            <Badge variant="secondary" className="ml-auto text-xs font-normal">
                                {request.items.length} artículo{request.items.length !== 1 ? 's' : ''}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {request.items.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Sin artículos registrados.
                            </p>
                        ) : (
                            request.items.map((item, i) => {
                                // material y sparePart son non-null en el schema pero pueden ser
                                // objetos placeholder; verificamos el ID para saber si son reales
                                const hasMaterialRef = !!item.materialId && item.material?.description;
                                const hasSparePartRef = !!item.sparePartId && item.sparePart?.partNumber;

                                return (
                                    <div
                                        key={item.id}
                                        className="border border-border rounded-lg p-3 space-y-2 text-sm"
                                    >
                                        {/* Cabecera del ítem */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                Artículo {i + 1}
                                            </span>
                                            <span className="font-mono font-bold text-primary text-sm">
                                                ×{item.requestedQuantity} {item.unitOfMeasure}
                                            </span>
                                        </div>

                                        {item.description && (
                                            <p className="text-foreground">{item.description}</p>
                                        )}

                                        {/* Referencia de catálogo */}
                                        {(hasMaterialRef || hasSparePartRef) && (
                                            <div className="text-xs bg-muted/40 rounded px-2 py-1.5 border border-border/50">
                                                <span className="text-muted-foreground">
                                                    {hasMaterialRef ? 'Material: ' : 'Refacción: '}
                                                </span>
                                                <span className="font-medium">
                                                    {hasMaterialRef
                                                        ? item.material?.description ?? ''
                                                        : item.sparePart?.partNumber ?? ''}
                                                </span>
                                            </div>
                                        )}

                                        {/* Atributos */}
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                            {item.brand && (
                                                <div>
                                                    <span className="text-muted-foreground">Marca: </span>
                                                    {item.brand}
                                                </div>
                                            )}
                                            {item.model && (
                                                <div>
                                                    <span className="text-muted-foreground">Modelo: </span>
                                                    {item.model}
                                                </div>
                                            )}
                                            {item.partNumber && (
                                                <div>
                                                    <span className="text-muted-foreground">No. Parte: </span>
                                                    <span className="font-mono">{item.partNumber}</span>
                                                </div>
                                            )}
                                            {item.sku && (
                                                <div>
                                                    <span className="text-muted-foreground">SKU: </span>
                                                    <span className="font-mono">{item.sku}</span>
                                                </div>
                                            )}
                                            {item.proposedMaxStock != null && (
                                                <div>
                                                    <span className="text-muted-foreground">Stock Máx: </span>
                                                    {item.proposedMaxStock}
                                                </div>
                                            )}
                                            {item.proposedMinStock != null && (
                                                <div>
                                                    <span className="text-muted-foreground">Stock Mín: </span>
                                                    {item.proposedMinStock}
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-muted-foreground">Genérico: </span>
                                                {item.isGenericAllowed ? 'Sí' : 'No'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Justificación / Comentarios */}
            {(request.justification || request.comments || request.suggestedSupplier) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Observaciones</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        {request.justification && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5 font-medium">Justificante</p>
                                <p className="text-foreground whitespace-pre-line leading-relaxed">
                                    {request.justification}
                                </p>
                            </div>
                        )}
                        {request.comments && (
                            <div className={request.justification ? 'pt-2 border-t border-border/40' : ''}>
                                <p className="text-xs text-muted-foreground mb-0.5 font-medium">Comentarios</p>
                                <p className="text-foreground whitespace-pre-line leading-relaxed">
                                    {request.comments}
                                </p>
                            </div>
                        )}
                        {request.suggestedSupplier && (
                            <div className={(request.justification || request.comments) ? 'pt-2 border-t border-border/40' : ''}>
                                <p className="text-xs text-muted-foreground mb-0.5">Proveedor sugerido</p>
                                <p className="font-medium">{request.suggestedSupplier}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Fotografías */}
            {request.photos && request.photos.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Camera className="h-4 w-4 text-muted-foreground" />
                            Fotografías
                            <Badge variant="secondary" className="ml-auto text-xs font-normal">
                                {request.photos.length}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {request.photos.map((photo) => (
                                <a
                                    key={photo.id}
                                    href={resolveBackendAssetUrl(photo.filePath)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    <img
                                        src={resolveBackendAssetUrl(photo.filePath)}
                                        alt={photo.fileName}
                                        className="w-24 h-24 object-cover rounded-md border border-border hover:opacity-80 transition-opacity cursor-pointer"
                                    />
                                </a>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Email modal */}
            <EmailModal
                open={emailOpen}
                onClose={() => setEmailOpen(false)}
                materialRequestId={id!}
                folio={request.folio}
            />
        </div>
    );
}