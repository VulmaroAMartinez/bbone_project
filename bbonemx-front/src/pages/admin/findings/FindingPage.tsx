import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';

import {
    GetFindingsFilteredDocument,
    ConvertToWorkOrderDocument,
    type FindingStatus,
    FindingBasicFragmentDoc,
} from '@/lib/graphql/generated/graphql';
import { useFragment } from '@/lib/graphql/generated/fragment-masking';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { WorkOrderListSkeleton } from '@/components/ui/skeleton-loaders';
import { Search, PlusCircle, AlertTriangle, Clock, MapPin, Wrench, RefreshCw, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function FindingPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusTab, setStatusTab] = useState<FindingStatus | 'ALL'>('ALL');

    const { data, loading, error, refetch } = useQuery(GetFindingsFilteredDocument, {
        variables: {
            filters: {
                status: statusTab !== 'ALL' ? statusTab : undefined
            },
            pagination: { limit: 100, page: 1 }
        },
        fetchPolicy: 'cache-and-network'
    });

    const [convertToWo, { loading: converting }] = useMutation(ConvertToWorkOrderDocument);

    const findings = useFragment(FindingBasicFragmentDoc, data?.findingsFiltered.data || []);

    const filteredFindings = findings.filter(f => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return f.folio.toLowerCase().includes(term) || f.description.toLowerCase().includes(term);
    });

    const handleConvert = async (findingId: string) => {
        try {
            await convertToWo({ variables: { id: findingId } });
            refetch();
        } catch {
            toast.error('Error al convertir el hallazgo a orden de trabajo');
        }
    };

    if (loading && !data) return <WorkOrderListSkeleton count={4} />;

    if (error) {
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
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestión de Hallazgos</h1>
                    <p className="text-muted-foreground">
                        {data?.findingsFiltered.total || 0} hallazgos registrados
                    </p>
                </div>
                <Button onClick={() => navigate('/hallazgos/nuevo')} className="gap-2">
                    <PlusCircle className="h-4 w-4" /> Nuevo Hallazgo
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por folio o descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Tabs value={statusTab} onValueChange={(val) => setStatusTab(val as FindingStatus | 'ALL')} className="w-full md:w-auto">
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
                    filteredFindings.map((finding) => {
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
        </div>
    );
}