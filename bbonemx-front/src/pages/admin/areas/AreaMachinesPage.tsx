import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import {
    GetMachinesByAreaDocument,
    GetAreaDocument,
    AreaDetailFragmentDoc,
    MachineBasicFragmentDoc,
} from '@/lib/graphql/generated/graphql';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from '@/components/ui/empty';
import { ArrowLeft, Cog, Tag, Layers } from 'lucide-react';

export default function AreaMachinesPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: areaData } = useQuery(GetAreaDocument, {
        variables: { id: id! },
        skip: !id,
    });

    const { data, loading } = useQuery(GetMachinesByAreaDocument, {
        variables: { areaId: id! },
        skip: !id,
        fetchPolicy: 'cache-and-network',
    });

    const area = areaData?.area ? unmaskFragment(AreaDetailFragmentDoc, areaData.area) : null;
    const machines = data?.machinesByArea ? unmaskFragment(MachineBasicFragmentDoc, data.machinesByArea) : [];
    const active = machines.filter((m) => m.isActive);
    const inactive = machines.filter((m) => !m.isActive);

    return (
        <div className="space-y-5 pb-20">
            {/* Header */}
            <div className="space-y-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/areas')}
                    className="gap-1.5 -ml-2 text-muted-foreground"
                >
                    <ArrowLeft className="h-4 w-4" /> Áreas
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Equipos/Estructuras</h1>
                    {area && (
                        <p className="text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs mr-1.5">
                                {area.name}
                            </Badge>
                            {active.length} activa{active.length !== 1 ? 's' : ''}
                            {inactive.length > 0 && (
                                <span className="text-muted-foreground/60">
                                    {' '}/ {inactive.length} inactiva{inactive.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </p>
                    )}
                </div>
            </div>

            {/* Content */}
            {loading && !data ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4 space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-24" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : machines.length === 0 ? (
                <Empty className="border py-12">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Cog className="h-6 w-6" />
                        </EmptyMedia>
                        <EmptyTitle>Sin equipos</EmptyTitle>
                        <EmptyDescription>
                            Esta área no tiene equipos registrados.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {machines.map((machine) => (
                        <Card
                            key={machine.id}
                            className={`hover:shadow-md transition-shadow cursor-pointer ${!machine.isActive ? 'opacity-60' : ''}`}
                            onClick={() => navigate(`/maquinas`)}
                        >
                            <CardContent className="p-4 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-foreground truncate">
                                            {machine.name}
                                        </p>
                                        <p className="text-xs font-mono text-muted-foreground">
                                            {machine.code}
                                        </p>
                                    </div>
                                    {!machine.isActive && (
                                        <Badge variant="outline" className="text-xs shrink-0">
                                            Inactiva
                                        </Badge>
                                    )}
                                </div>

                                {machine.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                        {machine.description}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground pt-1">
                                    {machine.brand && (
                                        <span className="flex items-center gap-1">
                                            <Tag className="h-3 w-3" />
                                            {machine.brand}
                                            {machine.model && ` · ${machine.model}`}
                                        </span>
                                    )}
                                    {machine.subArea && (
                                        <span className="flex items-center gap-1">
                                            <Layers className="h-3 w-3" />
                                            {machine.subArea.name}
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}