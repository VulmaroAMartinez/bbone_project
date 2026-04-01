import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useQuery, useMutation } from '@apollo/client/react';
import { List } from 'react-window';
import {
  CreateAreaDocument,
  UpdateAreaDocument,
  GetSubAreasByAreaDocument,
  CreateSubAreaDocument,
  UpdateSubAreaDocument,
  DeactivateSubAreaDocument,
  type AreaType,
  type AreaDetailFragment,
  AreaDetailFragmentDoc,
  SubAreaBasicFragmentDoc,
} from '@/lib/graphql/generated/graphql';
import { useFragment as unmaskFragment } from '@/lib/graphql/generated';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

// ─── Constants ───────────────────────────────────────────
const AREA_TYPES_WITH_SUBAREAS = ['OPERATIONAL', 'PRODUCTION', 'SERVICE'];
const VIRTUAL_LIST_THRESHOLD = 30;
const ROW_HEIGHT = 44;

// ─── Schema ──────────────────────────────────────────────
const areaSchema = yup.object({
  name: yup.string().trim().max(100).required('El nombre es obligatorio'),
  type: yup
    .mixed<AreaType>()
    .oneOf(['OPERATIONAL', 'SERVICE', 'PRODUCTION'])
    .required('El tipo es obligatorio'),
  description: yup.string().trim().max(255).default(''),
});

type AreaFormValues = yup.InferType<typeof areaSchema>;

const EMPTY_FORM: AreaFormValues = { name: '', type: 'OPERATIONAL', description: '' };

// ─── SubArea types ───────────────────────────────────────
type SubAreaItem = { id: string; name: string; isActive: boolean };

// ─── SubAreasEditableList (virtualizada para 100+) ───────
function SubAreasEditableList({
  items,
  editingId,
  editingName,
  onEditingNameChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDeactivate,
}: {
  items: SubAreaItem[];
  editingId: string | null;
  editingName: string;
  onEditingNameChange: (v: string) => void;
  onStartEdit: (id: string, name: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDeactivate: (id: string) => void;
}) {
  const useVirtualList = items.length >= VIRTUAL_LIST_THRESHOLD;
  const maxHeight = Math.min(items.length * ROW_HEIGHT, 280);

  const RowComponent = useCallback(
    ({ index, style, ...rowProps }: { index: number; style: React.CSSProperties } & Record<string, unknown>) => {
      const sa = items[index];
      const isEditing = editingId === sa.id;
      const {
        onStartEdit: onStart,
        onSaveEdit: onSave,
        onCancelEdit: onCancel,
        onDeactivate: onDeact,
        onEditingNameChange: onNameChange,
      } = rowProps as {
        onStartEdit: (id: string, name: string) => void;
        onSaveEdit: () => void;
        onCancelEdit: () => void;
        onDeactivate: (id: string) => void;
        onEditingNameChange: (v: string) => void;
      };
      return (
        <div style={style} className="flex items-center gap-2 border-b border-border/30 last:border-0">
          {isEditing ? (
            <>
              <Input
                value={editingName}
                onChange={(e) => onNameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSave();
                  if (e.key === 'Escape') onCancel();
                }}
                className="h-8 text-sm flex-1"
                autoFocus
              />
              <Button type="button" variant="ghost" size="sm" onClick={onSave} className="h-7 px-2">
                Guardar
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="h-7 px-2">
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <span className="flex-1 truncate text-sm">{sa.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onStart(sa.id, sa.name)}
              >
                <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onDeact(sa.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      );
    },
    [items, editingId, editingName],
  );

  if (items.length === 0) return null;

  if (useVirtualList) {
    return (
      <div className="rounded-md border border-border/50 overflow-hidden" style={{ height: maxHeight }}>
        <List
          rowComponent={RowComponent}
          rowProps={{
            onStartEdit,
            onSaveEdit,
            onCancelEdit,
            onDeactivate,
            onEditingNameChange,
          }}
          rowCount={items.length}
          rowHeight={ROW_HEIGHT}
          style={{ height: maxHeight, width: '100%' }}
          overscanCount={5}
        />
      </div>
    );
  }

  return (
    <ScrollArea className="rounded-md border border-border/50" style={{ maxHeight }}>
      <div className="p-1">
        {items.map((sa) => {
          const isEditing = editingId === sa.id;
          return (
            <div key={sa.id} className="flex items-center gap-2 rounded hover:bg-muted/30">
              {isEditing ? (
                <>
                  <Input
                    value={editingName}
                    onChange={(e) => onEditingNameChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSaveEdit();
                      if (e.key === 'Escape') onCancelEdit();
                    }}
                    className="h-8 text-sm flex-1"
                    autoFocus
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={onSaveEdit} className="h-7 px-2">
                    Guardar
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={onCancelEdit} className="h-7 px-2">
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 truncate text-sm">{sa.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onStartEdit(sa.id, sa.name)}
                  >
                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => onDeactivate(sa.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

// ─── Props ───────────────────────────────────────────────
interface AreaFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  area: AreaDetailFragment | null;
  onSuccess: () => void;
}

// ─── Component ───────────────────────────────────────────
export function AreaFormModal({ open, onOpenChange, area, onSuccess }: AreaFormModalProps) {
  const isEditing = !!area;

  // Mutations
  const [createArea] = useMutation(CreateAreaDocument);
  const [updateArea] = useMutation(UpdateAreaDocument);
  const [createSubArea] = useMutation(CreateSubAreaDocument);
  const [updateSubArea] = useMutation(UpdateSubAreaDocument);
  const [deactivateSubArea] = useMutation(DeactivateSubAreaDocument);

  // State
  const [isSaving, setIsSaving] = useState(false);
  const [newSubAreas, setNewSubAreas] = useState<string[]>([]);
  const [subAreaInput, setSubAreaInput] = useState('');
  const [subAreaError, setSubAreaError] = useState('');
  const [existingSubAreas, setExistingSubAreas] = useState<SubAreaItem[]>([]);
  const [editingSubAreaId, setEditingSubAreaId] = useState<string | null>(null);
  const [editingSubAreaName, setEditingSubAreaName] = useState('');

  // Sub-areas query (only for editing)
  const { data: subAreasData, loading: subAreasLoading } = useQuery(GetSubAreasByAreaDocument, {
    variables: { areaId: area?.id ?? '' },
    skip: !area?.id || !open,
    fetchPolicy: 'cache-and-network',
  });

  // Form
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<AreaFormValues>({
    resolver: yupResolver(areaSchema),
    defaultValues: EMPTY_FORM,
  });

  const formType = watch('type');
  const areaType = (area?.type ?? formType) as AreaType;

  // Reset form when modal opens
  useEffect(() => {
    if (!open) return;
    if (area) {
      reset({
        name: area.name,
        type: area.type as AreaType,
        description: area.description ?? '',
      });
    } else {
      reset(EMPTY_FORM);
      setExistingSubAreas([]);
    }
    setNewSubAreas([]);
    setSubAreaInput('');
    setSubAreaError('');
    setEditingSubAreaId(null);
    setEditingSubAreaName('');
  }, [open, area, reset]);

  // Sync existing sub-areas from query
  useEffect(() => {
    if (subAreasData?.subAreasByArea && area) {
      const subs = unmaskFragment(SubAreaBasicFragmentDoc, subAreasData.subAreasByArea);
      setExistingSubAreas(subs.map((s) => ({ id: s.id, name: s.name, isActive: s.isActive })));
    }
  }, [subAreasData, area]);

  // Clear sub-areas when type changes to one that doesn't support them
  useEffect(() => {
    if (!AREA_TYPES_WITH_SUBAREAS.includes(areaType)) {
      setNewSubAreas([]);
      setSubAreaInput('');
      setSubAreaError('');
      if (!area) setExistingSubAreas([]);
    }
  }, [areaType, area]);

  // ─── Sub-area handlers ─────────────────────────────────
  const handleAddSubArea = () => {
    const trimmed = subAreaInput.trim();
    if (!trimmed) return;
    if (trimmed.length > 100) {
      setSubAreaError('Máximo 100 caracteres');
      return;
    }
    const allNames = [
      ...newSubAreas.map((s) => s.toLowerCase()),
      ...existingSubAreas.map((s) => s.name.toLowerCase()),
    ];
    if (allNames.includes(trimmed.toLowerCase())) {
      setSubAreaError('Esta sub-área ya existe');
      return;
    }
    setNewSubAreas((prev) => [...prev, trimmed]);
    setSubAreaInput('');
    setSubAreaError('');
  };

  const handleRemoveSubArea = (index: number) => {
    setNewSubAreas((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartEditSubArea = (id: string, name: string) => {
    setEditingSubAreaId(id);
    setEditingSubAreaName(name);
  };

  const handleSaveEditSubArea = useCallback(async () => {
    if (!editingSubAreaId || !editingSubAreaName.trim()) {
      setEditingSubAreaId(null);
      return;
    }
    const trimmed = editingSubAreaName.trim();
    if (trimmed.length > 100) {
      toast.error('Máximo 100 caracteres');
      return;
    }
    try {
      await updateSubArea({
        variables: { id: editingSubAreaId, input: { name: trimmed } },
      });
      setExistingSubAreas((prev) =>
        prev.map((s) => (s.id === editingSubAreaId ? { ...s, name: trimmed } : s)),
      );
      setEditingSubAreaId(null);
      setEditingSubAreaName('');
      toast.success('Sub-área actualizada');
    } catch (error: unknown) {
      toast.error((error as Error)?.message || 'Error al actualizar');
    }
  }, [editingSubAreaId, editingSubAreaName, updateSubArea]);

  const handleCancelEditSubArea = () => {
    setEditingSubAreaId(null);
    setEditingSubAreaName('');
  };

  const handleDeactivateSubArea = useCallback(
    async (id: string) => {
      try {
        await deactivateSubArea({ variables: { id } });
        setExistingSubAreas((prev) => prev.filter((s) => s.id !== id));
        if (editingSubAreaId === id) setEditingSubAreaId(null);
        toast.success('Sub-área desactivada');
      } catch (error: unknown) {
        toast.error((error as Error)?.message || 'Error al desactivar');
      }
    },
    [deactivateSubArea, editingSubAreaId],
  );

  const handleSubAreaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubArea();
    }
  };

  // ─── Submit ────────────────────────────────────────────
  const onSubmit = async (values: AreaFormValues) => {
    setIsSaving(true);
    try {
      let areaId: string;
      if (area) {
        await updateArea({
          variables: {
            id: area.id,
            input: {
              name: values.name,
              type: values.type,
              description: values.description || undefined,
            },
          },
        });
        areaId = area.id;
      } else {
        const { data: createData } = await createArea({
          variables: {
            input: {
              name: values.name,
              type: values.type,
              description: values.description || undefined,
            },
          },
        });
        const createdArea = createData?.createArea
          ? unmaskFragment(AreaDetailFragmentDoc, createData.createArea)
          : null;
        if (!createdArea) throw new Error('Error al crear el área');
        areaId = createdArea.id;
      }

      if (newSubAreas.length > 0) {
        await Promise.all(
          newSubAreas.map((name) =>
            createSubArea({ variables: { input: { areaId, name } } }),
          ),
        );
        toast.success('Sub-áreas creadas correctamente');
      }

      onOpenChange(false);
      onSuccess();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar el área');
    } finally {
      setIsSaving(false);
    }
  };

  const activeExisting = existingSubAreas.filter((s) => s.isActive);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar área' : 'Nueva área'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          {/* Identificación */}
          <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/10">
            <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">
              Identificación
            </h4>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="area-name">
                  Nombre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="area-name"
                  placeholder="Ej. Área de Producción A"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>
                    Tipo <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPERATIONAL">Operativa</SelectItem>
                          <SelectItem value="SERVICE">Servicio</SelectItem>
                          <SelectItem value="PRODUCTION">Producción</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.type && (
                    <p className="text-xs text-destructive">{errors.type.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="area-description">Descripción</Label>
                  <Input
                    id="area-description"
                    placeholder="Descripción opcional..."
                    {...register('description')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sub-áreas */}
          {AREA_TYPES_WITH_SUBAREAS.includes(areaType) && (
            <div className="space-y-3 p-4 rounded-lg border border-border">
              <h4 className="font-semibold text-sm text-primary uppercase tracking-wider">
                Sub-áreas{' '}
                <span className="text-muted-foreground font-normal normal-case text-xs">(opcional)</span>
              </h4>

              {/* CREATE mode: badges + input */}
              {!isEditing && (
                <>
                  {newSubAreas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {newSubAreas.map((name, idx) => (
                        <Badge
                          key={`new-${idx}`}
                          variant="outline"
                          className="text-xs py-1 px-2 gap-1 bg-primary/5"
                        >
                          {name}
                          <button
                            type="button"
                            onClick={() => handleRemoveSubArea(idx)}
                            className="ml-0.5 hover:text-destructive transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nombre de sub-área..."
                      value={subAreaInput}
                      onChange={(e) => {
                        setSubAreaInput(e.target.value);
                        setSubAreaError('');
                      }}
                      onKeyDown={handleSubAreaKeyDown}
                      className="flex-1 h-8 text-sm"
                      maxLength={100}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddSubArea}
                      disabled={!subAreaInput.trim()}
                      className="shrink-0 h-8"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {subAreaError && (
                    <p className="text-xs text-destructive">{subAreaError}</p>
                  )}
                  {newSubAreas.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {newSubAreas.length} sub-área{newSubAreas.length !== 1 ? 's' : ''} a crear
                    </p>
                  )}
                </>
              )}

              {/* EDIT mode: editable list + input for new */}
              {isEditing && (
                <>
                  {subAreasLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-3/4" />
                    </div>
                  ) : (
                    <>
                      {activeExisting.length > 0 && (
                        <SubAreasEditableList
                          items={activeExisting}
                          editingId={editingSubAreaId}
                          editingName={editingSubAreaName}
                          onEditingNameChange={setEditingSubAreaName}
                          onStartEdit={handleStartEditSubArea}
                          onSaveEdit={handleSaveEditSubArea}
                          onCancelEdit={handleCancelEditSubArea}
                          onDeactivate={handleDeactivateSubArea}
                        />
                      )}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Agregar sub-área..."
                          value={subAreaInput}
                          onChange={(e) => {
                            setSubAreaInput(e.target.value);
                            setSubAreaError('');
                          }}
                          onKeyDown={handleSubAreaKeyDown}
                          className="flex-1 h-8 text-sm"
                          maxLength={100}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddSubArea}
                          disabled={!subAreaInput.trim()}
                          className="shrink-0 h-8"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      {subAreaError && (
                        <p className="text-xs text-destructive">{subAreaError}</p>
                      )}
                      {(activeExisting.length + newSubAreas.length) > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {activeExisting.length + newSubAreas.length} sub-área
                          {(activeExisting.length + newSubAreas.length) !== 1 ? 's' : ''}
                          {newSubAreas.length > 0 && (
                            <span className="text-primary">
                              {' '}({newSubAreas.length} nueva{newSubAreas.length !== 1 ? 's' : ''})
                            </span>
                          )}
                        </p>
                      )}
                    </>
                  )}
                  {newSubAreas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {newSubAreas.map((name, idx) => (
                        <Badge
                          key={`new-${idx}`}
                          variant="outline"
                          className="text-xs py-1 px-2 gap-1 bg-primary/5"
                        >
                          {name}
                          <button
                            type="button"
                            onClick={() => handleRemoveSubArea(idx)}
                            className="ml-0.5 hover:text-destructive transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Guardar cambios' : 'Crear área'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
