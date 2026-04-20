import { useState, useMemo, useEffect } from 'react';
import { useMutation, useQuery, useLazyQuery } from '@apollo/client/react';
import { useOfflineAwareQuery } from '@/hooks/useOfflineAwareQuery';
import { useNavigate } from 'react-router-dom';

import {
    GetFindingsFilteredDocument,
    ConvertToWorkOrderDocument,
    GetAreasDocument,
    AreaBasicFragmentDoc,
    GetFindingsCountByDateDocument,
    AssignCollectionByDateDocument,
    type FindingStatus,
    FindingBasicFragmentDoc,
} from '@/lib/graphql/generated/graphql';
import { useFragment, useFragment as unmaskFragment } from '@/lib/graphql/generated/fragment-masking';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { WorkOrderListSkeleton } from '@/components/ui/skeleton-loaders';
import { Combobox } from '@/components/ui/combobox';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Search, PlusCircle, AlertTriangle, Clock, MapPin, Wrench, RefreshCw, CheckCircle, ChevronLeft, ChevronRight, CalendarIcon, Layers } from 'lucide-react';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { toast } from 'sonner';

const PAGE_SIZE = 12;

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export default function FindingPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusTab, setStatusTab] = useState<FindingStatus | 'ALL'>('ALL');
    const [areaFilter, setAreaFilter] = useState<string>('all');
    const [collectionFilter, setCollectionFilter] = useState('');
    const [page, setPage] = useState(1);

    const debouncedCollection = useDebounce(collectionFilter, 300);

    // Selector de colección por fecha
    const [selectorOpen, setSelectorOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [collectionName, setCollectionName] = useState('');
    const [dateCount, setDateCount] = useState<number | null>(null);

    const { data: areasData } = useQuery(GetAreasDocument);
    const areas = useMemo(() => {
        const raw = areasData?.areas ? unmaskFragment(AreaBasicFragmentDoc, areasData.areas) : [];
        const seen = new Set<string>();
        return raw.filter((a) => {
            const id = String(a.id ?? '');
            if (!id || id === 'all' || seen.has(id)) return false;
            seen.add(id);
            return true;
        });
    }, [areasData?.areas]);

    const areaComboboxOptions = useMemo(
        () => [
            { value: 'all', label: 'Todas las áreas' },
            ...areas.map((a) => ({ value: a.id, label: a.name })),
        ],
        [areas],
    );

    const { data, loading, error, refetch, isOffline } = useOfflineAwareQuery(GetFindingsFilteredDocument, {
        variables: {
            filters: {
                status: statusTab !== 'ALL' ? statusTab : undefined,
                areaId: areaFilter !== 'all' ? areaFilter : undefined,
                collection: debouncedCollection.trim() || undefined,
            },
            pagination: { limit: 100, page: 1 }
        },
    });

    const [convertToWo, { loading: converting }] = useMutation(ConvertToWorkOrderDocument);

    const [queryCountByDate, { loading: countLoading }] = useLazyQuery(GetFindingsCountByDateDocument, {
        fetchPolicy: 'network-only',
    });
    const [assignCollection, { loading: assigning }] = useMutation(AssignCollectionByDateDocument);

    const findings = useFragment(FindingBasicFragmentDoc, data?.findingsFiltered.data || []);

    const filteredFindings = findings.filter(f => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return f.folio.toLowerCase().includes(term) || f.description.toLowerCase().includes(term);
    });

    const totalPages = Math.ceil(filteredFindings.length / PAGE_SIZE);
    const pageFindings = filteredFindings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleConvert = async (findingId: string) => {
        try {
            await convertToWo({ variables: { id: findingId } });
            refetch();
        } catch {
            toast.error('Error al convertir el hallazgo a orden de trabajo');
        }
    };

    const formatDateISO = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const handleDateSelect = async (d: Date | undefined) => {
        setSelectedDate(d);
        setDateCount(null);
        setCollectionName('');
        if (!d) return;
        const result = await queryCountByDate({ variables: { date: formatDateISO(d) } });
        setDateCount(result.data?.findingsCountByDate ?? 0);
    };

    const handleAssign = async () => {
        if (!selectedDate || !collectionName.trim()) return;
        try {
            const result = await assignCollection({
                variables: { input: { date: formatDateISO(selectedDate), collection: collectionName.trim() } },
            });
            const count = result.data?.assignCollectionByDate ?? 0;
            toast.success(`Colección "${collectionName.trim()}" asignada a ${count} hallazgo${count !== 1 ? 's' : ''}`);
            setSelectorOpen(false);
            setSelectedDate(undefined);
            setCollectionName('');
            setDateCount(null);
            refetch();
        } catch {
            toast.error('Error al asignar la colección');
        }
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (loading && !data) return <WorkOrderListSkeleton count={4} />;

    if (error && !data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                    <h3 className="mt-4 text-lg font-semibold text-foreground">Error al cargar hallazgos</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {isOffline && data && <OfflineBanner />}
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestión de Hallazgos</h1>
                    <p className="text-muted-foreground">
                        {data?.findingsFiltered.total || 0} hallazgos registrados
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setSelectorOpen(true)} className="gap-2">
                        <Layers className="h-4 w-4" /> Seleccionar Hallazgos
                    </Button>
                    <Button onClick={() => navigate('/hallazgos/nuevo')} className="gap-2">
                        <PlusCircle className="h-4 w-4" /> Nuevo Hallazgo
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por folio o descripción..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className="pl-9"
                    />
                </div>

                <Combobox
                    options={areaComboboxOptions}
                    value={areaFilter}
                    onValueChange={(val: string) => { setAreaFilter(val || 'all'); setPage(1); }}
                    placeholder="Filtrar por área"
                    triggerClassName="w-full md:w-56"
                />

                <div className="relative w-full md:w-52">
                    <Layers className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Filtrar por colección..."
                        value={collectionFilter}
                        onChange={(e) => { setCollectionFilter(e.target.value); setPage(1); }}
                        className="pl-9"
                    />
                </div>

                <Tabs value={statusTab} onValueChange={(val) => { setStatusTab(val as FindingStatus | 'ALL'); setPage(1); }} className="w-full md:w-auto">
                    <TabsList className="w-full md:w-auto grid grid-cols-3">
                        <TabsTrigger value="ALL">Todos</TabsTrigger>
                        <TabsTrigger value="OPEN">Abiertos</TabsTrigger>
                        <TabsTrigger value="CONVERTED_TO_WO">Convertidos</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Listado */}
            <div className="space-y-3">
                {filteredFindings.length === 0 ? (
                    <Card className="bg-card border-border shadow-sm">
                        <CardContent className="py-16 text-center animate-in fade-in">
                            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-foreground">Sin resultados</h3>
                            <p className="text-sm text-muted-foreground mt-1">No se encontraron hallazgos con los filtros actuales</p>
                        </CardContent>
                    </Card>
                ) : (
                    pageFindings.map((finding) => {
                        const isOpen = finding.status === 'OPEN';
                        const area = finding.area as unknown as { name?: string } | null;
                        const machine = finding.machine as unknown as { name?: string; code?: string } | null;

                        return (
                            <Card
                                key={finding.id}
                                className={`bg-card border-border shadow-sm transition-all group ${isOpen ? 'hover:border-primary/50 hover:shadow-md' : 'opacity-80'}`}
                                onClick={() => navigate(`/hallazgos/${finding.id}/editar`)}
                                >
                                <CardContent className="py-4">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className="font-mono text-sm font-bold text-primary group-hover:text-primary/80 transition-colors">{finding.folio}</span>
                                                {isOpen ? (
                                                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Abierto</Badge>
                                                ) : (
                                                    <Badge variant="default" className="bg-success text-success-foreground hover:bg-success/90">
                                                        <CheckCircle className="h-3 w-3 mr-1" /> Convertido a OT
                                                    </Badge>
                                                )}
                                                {finding.collection && (
                                                    <Badge variant="secondary" className="gap-1">
                                                        <Layers className="h-3 w-3" />
                                                        {finding.collection}
                                                    </Badge>
                                                )}
                                            </div>

                                            <p className="text-sm text-foreground line-clamp-2">{finding.description}</p>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-muted-foreground">
                                                {area && (
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>{area.name}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{new Date(finding.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                {machine && (
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <Wrench className="h-4 w-4" />
                                                        <span>{machine.name} [{machine.code}]</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {isOpen && (
                                                <Button
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleConvert(finding.id);
                                                    }}
                                                    disabled={converting}
                                                    className="gap-2 shadow-sm"
                                                >
                                                    <RefreshCw className={`h-4 w-4 ${converting ? 'animate-spin' : ''}`} />
                                                    Convertir a Orden de Trabajo
                                                </Button>
                                            )}
                                            {!isOpen && finding.convertedToWo && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/admin/ordenes/${finding.convertedToWo?.id}`);
                                                    }}
                                                    className="text-primary border-primary/50"
                                                >
                                                    Ver Orden: {finding.convertedToWo.folio}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                        <ChevronLeft className="h-4 w-4" /> Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                        Siguiente <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Dialog: Seleccionar Hallazgos por Fecha */}
            <Dialog open={selectorOpen} onOpenChange={(open) => {
                if (!open) {
                    setSelectorOpen(false);
                    setSelectedDate(undefined);
                    setCollectionName('');
                    setDateCount(null);
                }
            }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                            Seleccionar Hallazgos por Fecha
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col items-center gap-4">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            disabled={(date) => date >= today}
                            className="rounded-md border border-border"
                        />

                        {countLoading && (
                            <p className="text-sm text-muted-foreground animate-pulse">Buscando hallazgos...</p>
                        )}

                        {!countLoading && dateCount !== null && (
                            <div className="w-full space-y-3">
                                {dateCount === 0 ? (
                                    <p className="text-sm text-center text-muted-foreground">
                                        No hay hallazgos para esta fecha.
                                    </p>
                                ) : (
                                    <>
                                        <p className="text-sm text-center text-foreground font-medium">
                                            Se encontraron <span className="text-primary">{dateCount}</span> hallazgo{dateCount !== 1 ? 's' : ''}.
                                        </p>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="collection-name">Asignar a colección</Label>
                                            <Input
                                                id="collection-name"
                                                placeholder="Ej: Auditoría, Turno noche..."
                                                value={collectionName}
                                                onChange={(e) => setCollectionName(e.target.value)}
                                                maxLength={100}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {dateCount !== null && dateCount > 0 && (
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSelectorOpen(false);
                                    setSelectedDate(undefined);
                                    setCollectionName('');
                                    setDateCount(null);
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                disabled={!collectionName.trim() || assigning}
                                onClick={handleAssign}
                                className="gap-2"
                            >
                                {assigning && <RefreshCw className="h-4 w-4 animate-spin" />}
                                Asignar Colección
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
