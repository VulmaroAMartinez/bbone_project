import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { GetTechnicianDetailDocument } from '@/lib/graphql/generated/graphql';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserRound, Briefcase, HeartPulse, Shirt, PhoneCall, AlertTriangle, Calendar, MapPin } from 'lucide-react';

export default function TechnicianDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data, loading, error } = useQuery(GetTechnicianDetailDocument, {
        variables: { id: id ?? '' },
        skip: !id,
        fetchPolicy: 'network-only',
    });

    if (loading) {
        return <div className="p-12 text-center text-muted-foreground animate-pulse">Cargando expediente...</div>;
    }

    if (error || !data?.technician) {
        return (
            <div className="p-12 text-center space-y-4">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
                <h2 className="text-xl font-bold">Técnico no encontrado</h2>
                {error && (
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        {error.message}
                    </p>
                )}
                <Button onClick={() => navigate(-1)} variant="outline">
                    Volver
                </Button>
            </div>
        );
    }

    const tech = data.technician;
    const u = tech.user;

    return (
        <div className="space-y-4 max-w-5xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-foreground">{u.fullName}</h1>
                        <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${tech.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-xs text-muted-foreground">{tech.isActive ? 'Activo' : 'Inactivo'}</span>
                        </div>
                    </div>
                    <p className="text-muted-foreground font-mono">Nómina: {u.employeeNumber}</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-card shadow-sm lg:col-span-2">
                    <CardHeader className="pb-2 border-b border-border/50">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-primary" /> Expediente Laboral
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground block mb-1">Departamento</span>
                            <span className="font-medium">{u.department?.name ?? '--'}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block mb-1">Puesto</span>
                            <span className="font-medium">{tech.position.name}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block mb-1">Fecha de Ingreso</span>
                            <span>{new Date(tech.hireDate).toLocaleDateString('es-MX')}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block mb-1">Periodo vacacional</span>
                            <span>{tech.vacationPeriod}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block mb-1">Email Corporativo</span>
                            <span>{u.email || '--'}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block mb-1">Teléfono Móvil</span>
                            <span>{u.phone || '--'}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-destructive/5 border-destructive/20 shadow-sm">
                    <CardHeader className="pb-2 border-b border-destructive/10">
                        <CardTitle className="text-base flex items-center gap-2 text-destructive">
                            <PhoneCall className="h-4 w-4" /> En Caso de Emergencia
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div>
                            <span className="text-muted-foreground block mb-1">Llamar a</span>
                            <span className="font-medium">{tech.emergencyContactName}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block mb-1">Teléfono</span>
                            <span className="font-bold text-destructive">{tech.emergencyContactPhone}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block mb-1">Parentesco</span>
                            <span>{tech.emergencyContactRelationship}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card shadow-sm lg:col-span-2">
                    <CardHeader className="pb-2 border-b border-border/50">
                        <CardTitle className="text-base flex items-center gap-2">
                            <UserRound className="h-4 w-4 text-primary" /> Datos Personales
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="col-span-2 md:col-span-3">
                            <span className="text-muted-foreground mb-1 flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> Dirección
                            </span>
                            <span>{tech.address}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground mb-1 flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> F. Nacimiento
                            </span>
                            <span>{new Date(tech.birthDate).toLocaleDateString('es-MX')}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block mb-1">Estado Civil / Hijos</span>
                            <span>{tech.childrenCount} Hijos</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block mb-1">Escolaridad</span>
                            <span>{tech.education}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block mb-1">NSS (Seguro Social)</span>
                            <span>{tech.nss || '--'}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block mb-1">RFC</span>
                            <span>{tech.rfc || '--'}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block mb-1">Ruta de Transporte</span>
                            <span>{tech.transportRoute}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card shadow-sm">
                    <CardHeader className="pb-2 border-b border-border/50">
                        <CardTitle className="text-base flex items-center gap-2">
                            <HeartPulse className="h-4 w-4 text-primary" /> Salud
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div>
                            <span className="text-muted-foreground block mb-1">Tipo de Sangre</span>
                            <span className="font-bold text-destructive">{tech.bloodType}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block mb-1">Alergias</span>
                            <span>{tech.allergies}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card shadow-sm">
                    <CardHeader className="pb-2 border-b border-border/50">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Shirt className="h-4 w-4 text-primary" /> Tallas (Uniforme)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-2 text-sm text-center">
                        <div className="bg-muted/30 p-2 rounded border border-border/50">
                            <span className="text-muted-foreground block text-xs mb-1">Camisa</span>
                            <span className="font-semibold">{tech.shirtSize}</span>
                        </div>
                        <div className="bg-muted/30 p-2 rounded border border-border/50">
                            <span className="text-muted-foreground block text-xs mb-1">Pantalón</span>
                            <span className="font-semibold">{tech.pantsSize}</span>
                        </div>
                        <div className="bg-muted/30 p-2 rounded border border-border/50">
                            <span className="text-muted-foreground block text-xs mb-1">Calzado</span>
                            <span className="font-semibold">{tech.shoeSize}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
