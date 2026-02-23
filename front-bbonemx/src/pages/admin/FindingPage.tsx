import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';

import {
    GetFindingsFilteredDocument,
    ConvertToWorkOrderDocument,
    type FindingStatus,
    FindingBasicFragmentDoc,
    AreaBasicFragmentDoc,
    MachineBasicFragmentDoc,
} from '@/lib/graphql/generated/graphql';
import { useFragment } from '@/lib/graphql/generated/fragment-masking';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { WorkOrderListSkeleton } from '@/components/ui/skeleton-loaders';
import { Search, PlusCircle, AlertTriangle, Clock, MapPin, Wrench, RefreshCw, CheckCircle } from 'lucide-react';

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
        } catch (err: any) {
            alert(err.message || 'Error al convertir el hallazgo a orden de trabajo');
        }
    };

    if (loading && !data) return <WorkOrderListSkeleton count={4} />;

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                    <h3 className="mt-4 text-lg font-semibold text-foreground">Error al cargar hallazgos</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
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
            <div className="space-y-4">
                {filteredFindings.length === 0 ? (
                    <Card className="bg-card border-border shadow-sm">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold text-foreground">No se encontraron hallazgos</h3>
                            <p className="text-sm text-muted-foreground mt-1">Intenta ajustando los filtros de búsqueda</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredFindings.map((finding) => {
                        const isOpen = finding.status === 'OPEN';
                        const area = useFragment(AreaBasicFragmentDoc, finding.area);
                        const machine = useFragment(MachineBasicFragmentDoc, finding.machine);

                        return (
                            <Card key={finding.id} className={`bg-card border-border shadow-sm transition-colors ${isOpen ? 'hover:border-primary/50' : 'opacity-80'}`}>
                                <CardHeader className="pb-2">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="font-mono text-sm font-bold text-primary">{finding.folio}</span>
                                            {isOpen ? (
                                                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Abierto</Badge>
                                            ) : (
                                                <Badge variant="default" className="bg-success text-success-foreground hover:bg-success/90">
                                                    <CheckCircle className="h-3 w-3 mr-1" /> Convertido a OT
                                                </Badge>
                                            )}
                                        </div>
                                        {/* Botón de Conversión */}
                                        {isOpen && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleConvert(finding.id)}
                                                disabled={converting}
                                                className="shrink-0 gap-2 shadow-sm"
                                            >
                                                <RefreshCw className={`h-4 w-4 ${converting ? 'animate-spin' : ''}`} />
                                                Convertir a Orden de Trabajo
                                            </Button>
                                        )}
                                        {/* Referencia a la OT generada */}
                                        {!isOpen && finding.convertedToWo && (
                                            <Button variant="outline" size="sm" onClick={() => navigate(`/admin/ordenes/${finding.convertedToWo?.id}`)} className="text-primary border-primary/50 shrink-0">
                                                Ver Orden: {finding.convertedToWo.folio}
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-foreground line-clamp-2 mb-4">{finding.description}</p>

                                    <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            <span>{area?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Wrench className="h-4 w-4" />
                                            <span>{machine?.name} [{machine?.code}]</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>{new Date(finding.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
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
