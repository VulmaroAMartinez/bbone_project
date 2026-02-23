'use client';

/**
 * BB Maintenance - Admin Tecnicos Page
 * Lista de tecnicos con sus estadisticas
 * Componente React puro (sin dependencias de Next.js)
 */

import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { gql } from '@apollo/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TechnicianListSkeleton } from '@/components/ui/skeleton-loaders';
import {
  Search,
  Users,
  Wrench,
  Phone,
  Mail,
  AlertTriangle,
} from 'lucide-react';

const GET_ALL_TECHNICIANS = gql`
  query GetAllTechnicians {
    technicians {
      id
      firstName
      lastName
      email
      phone
      specialty
      available
      department
      workOrders {
        id
        status
      }
    }
  }
`;

interface Technician {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialty: string;
  available: boolean;
  department?: string;
  workOrders?: { id: string; status: string }[];
}

function TecnicosPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, loading, error } = useQuery<{ technicians: Technician[] }>(GET_ALL_TECHNICIANS);

  if (loading) return <TechnicianListSkeleton />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">Error al cargar tecnicos</h3>
          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  const technicians = data?.technicians || [];

  const filteredTechnicians = technicians.filter((tech) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      tech.firstName?.toLowerCase().includes(term) ||
      tech.lastName?.toLowerCase().includes(term) ||
      tech.specialty?.toLowerCase().includes(term) ||
      tech.email?.toLowerCase().includes(term)
    );
  });

  const availableCount = technicians.filter((t) => t.available).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Tecnicos</h1>
        <p className="text-muted-foreground">Directorio de tecnicos y su disponibilidad</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{technicians.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Wrench className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-primary">{availableCount}</p>
                <p className="text-xs text-muted-foreground">Disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, especialidad o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </CardContent>
      </Card>

      {/* Technician Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTechnicians.map((tech) => {
          const activeOrders = tech.workOrders?.filter((wo) => wo.status !== 'COMPLETADA' && wo.status !== 'CANCELADA').length || 0;
          const completedOrders = tech.workOrders?.filter((wo) => wo.status === 'COMPLETADA').length || 0;

          return (
            <Card key={tech.id} className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-foreground text-base">
                      {tech.firstName} {tech.lastName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{tech.specialty}</p>
                  </div>
                  <Badge variant={tech.available ? 'default' : 'secondary'} className={tech.available ? 'bg-primary text-primary-foreground' : ''}>
                    {tech.available ? 'Disponible' : 'Ocupado'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {tech.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{tech.email}</span>
                    </div>
                  )}
                  {tech.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{tech.phone}</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="rounded-lg bg-secondary/50 p-2 text-center">
                    <p className="text-lg font-bold text-foreground">{tech.workOrders?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-2 text-center">
                    <p className="text-lg font-bold text-primary">{activeOrders}</p>
                    <p className="text-xs text-muted-foreground">Activas</p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-2 text-center">
                    <p className="text-lg font-bold text-primary">{completedOrders}</p>
                    <p className="text-xs text-muted-foreground">Completadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default TecnicosPage;
