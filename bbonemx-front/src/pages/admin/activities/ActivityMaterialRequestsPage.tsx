import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import {
  GetActivityMaterialRequestsDocument,
  AddActivityMaterialRequestDocument,
  RemoveActivityMaterialRequestDocument,
} from '@/lib/graphql/generated/graphql';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';

export default function ActivityMaterialRequestsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [folio, setFolio] = useState('');

  const { data, loading, refetch } = useQuery(GetActivityMaterialRequestsDocument, {
    variables: { id: id! },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  const [addMaterialRequest, { loading: adding }] = useMutation(AddActivityMaterialRequestDocument);
  const [removeMaterialRequest] = useMutation(RemoveActivityMaterialRequestDocument);

  const activity = data?.activity;
  const materialRequests = activity?.materialRequests || [];
  type ActivityMaterialRequestRow = (typeof materialRequests)[number];

  const handleAdd = async () => {
    if (!folio.trim()) return;
    try {
      await addMaterialRequest({
        variables: { input: { activityId: id!, folio: folio.trim() } },
      });
      toast.success('Solicitud de material vinculada');
      setFolio('');
      setIsAddOpen(false);
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al vincular solicitud');
    }
  };

  const handleRemove = async (materialRequestId: string) => {
    try {
      await removeMaterialRequest({ variables: { activityId: id!, materialRequestId } });
      toast.success('Relación eliminada');
      refetch();
    } catch {
      toast.error('Error al eliminar relación');
    }
  };

  const formatDate = (d: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/actividades')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Solicitudes de Material</h1>
          {activity && (
            <p className="text-sm text-muted-foreground">
              {activity.area?.name} &bull; {activity.machine?.name} &bull; {activity.activity}
            </p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Solicitudes vinculadas ({materialRequests.length})</CardTitle>
          <Button size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Agregar por folio
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3 font-semibold">Folio</th>
                  <th className="px-4 py-3 font-semibold hidden sm:table-cell">Categoría</th>
                  <th className="px-4 py-3 font-semibold hidden sm:table-cell">Importancia</th>
                  <th className="px-4 py-3 font-semibold">Prioridad</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Fecha</th>
                  <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </td>
                  </tr>
                )}
                {!loading && materialRequests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No hay solicitudes vinculadas
                    </td>
                  </tr>
                )}
                {materialRequests.map((amr: ActivityMaterialRequestRow) => (
                  <tr key={amr.id} className="hover:bg-muted/10">
                    <td className="px-4 py-3 font-medium">{amr.materialRequest?.folio}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant="secondary">{amr.materialRequest?.category}</Badge>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">{amr.materialRequest?.importance}</td>
                    <td className="px-4 py-3">{amr.materialRequest?.priority}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{formatDate(amr.materialRequest?.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleRemove(amr.materialRequestId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Solicitud de Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Folio de la Solicitud</Label>
              <Input
                placeholder="Ej: SM-260319-001"
                value={folio}
                onChange={(e) => setFolio(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdd} disabled={adding || !folio.trim()}>
              {adding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
