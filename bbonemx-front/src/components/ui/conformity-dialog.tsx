import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, XCircle, AlertCircle, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ConformityQ1Answer = 'YES' | 'NO' | 'NOT_APPLICABLE';

export interface ConformityFormValues {
  question1Answer: ConformityQ1Answer;
  question2Answer: boolean;
  question3Answer: boolean;
  isConforming: boolean;
  reason?: string;
}

interface ConformityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ConformityFormValues) => Promise<void>;
  cycleNumber?: number;
  isLoading?: boolean;
}

const INITIAL: ConformityFormValues = {
  question1Answer: 'YES',
  question2Answer: true,
  question3Answer: true,
  isConforming: true,
  reason: '',
};

export function ConformityDialog({
  isOpen,
  onClose,
  onSubmit,
  cycleNumber = 1,
  isLoading = false,
}: ConformityDialogProps) {
  const [values, setValues] = useState<ConformityFormValues>(INITIAL);
  const [submitted, setSubmitted] = useState(false);

  const handleClose = () => {
    setValues(INITIAL);
    setSubmitted(false);
    onClose();
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!values.isConforming && !values.reason?.trim()) return;
    await onSubmit(values);
    handleClose();
  };

  const reasonError = submitted && !values.isConforming && !values.reason?.trim();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Evaluación de Conformidad
          </DialogTitle>
          <DialogDescription>
            Ciclo {cycleNumber} — Responda las siguientes preguntas sobre el trabajo realizado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* P1 */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold leading-tight">
              1. ¿El equipo/estructura quedó en condiciones operativas adecuadas?
            </Label>
            <RadioGroup
              value={values.question1Answer}
              onValueChange={(v) =>
                setValues({ ...values, question1Answer: v as ConformityQ1Answer })
              }
              className="flex flex-col gap-2"
            >
              {[
                { value: 'YES', label: 'Sí' },
                { value: 'NO', label: 'No' },
                { value: 'NOT_APPLICABLE', label: 'No aplica' },
              ].map(({ value, label }) => (
                <label
                  key={value}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors',
                    values.question1Answer === value
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:bg-muted/40',
                  )}
                >
                  <RadioGroupItem value={value} id={`q1-${value}`} />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* P2 */}
          <BoolQuestion
            number={2}
            label="¿El área de trabajo quedó limpia y segura tras la intervención?"
            value={values.question2Answer}
            onChange={(v) => setValues({ ...values, question2Answer: v })}
          />

          {/* P3 */}
          <BoolQuestion
            number={3}
            label="¿El problema reportado fue resuelto satisfactoriamente?"
            value={values.question3Answer}
            onChange={(v) => setValues({ ...values, question3Answer: v })}
          />

          {/* Separador visual antes de P4 */}
          <div className="border-t border-border/60 pt-2" />

          {/* P4 — Decisiva */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold leading-tight text-foreground">
              4. ¿Estoy conforme con el trabajo realizado?
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValues({ ...values, isConforming: true, reason: '' })}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-5 transition-all',
                  values.isConforming
                    ? 'border-success bg-success/10 text-success'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted/40',
                )}
              >
                <CheckCircle className="h-8 w-8" />
                <span className="text-sm font-semibold">Sí, conforme</span>
              </button>
              <button
                type="button"
                onClick={() => setValues({ ...values, isConforming: false })}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-5 transition-all',
                  !values.isConforming
                    ? 'border-destructive bg-destructive/10 text-destructive'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted/40',
                )}
              >
                <XCircle className="h-8 w-8" />
                <span className="text-sm font-semibold">No conforme</span>
              </button>
            </div>
          </div>

          {/* Razón — solo si no conforme */}
          {!values.isConforming && (
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-semibold">
                Motivo de no conformidad <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-start gap-2 rounded-lg border border-amber-400/40 bg-amber-50/60 dark:bg-amber-900/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Al no confirmar la conformidad, la orden será regresada a los técnicos para correcciones.</span>
              </div>
              <Textarea
                id="reason"
                rows={3}
                placeholder="Describa el motivo de no conformidad..."
                value={values.reason ?? ''}
                onChange={(e) => setValues({ ...values, reason: e.target.value })}
                className={cn(reasonError && 'border-destructive ring-destructive')}
              />
              {reasonError && (
                <p className="text-xs text-destructive">Este campo es obligatorio.</p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading} className="bg-transparent">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            variant={values.isConforming ? 'default' : 'destructive'}
          >
            {isLoading
              ? 'Enviando...'
              : values.isConforming
                ? 'Confirmar conformidad'
                : 'Enviar no conformidad'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Pregunta boolean reutilizable ─────────────────────── */
function BoolQuestion({
  number,
  label,
  value,
  onChange,
}: {
  number: number;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold leading-tight">
        {number}. {label}
      </Label>
      <div className="grid grid-cols-2 gap-3">
        {[true, false].map((opt) => (
          <button
            key={String(opt)}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm transition-colors',
              value === opt
                ? opt
                  ? 'border-success bg-success/10 text-success font-semibold'
                  : 'border-destructive bg-destructive/10 text-destructive font-semibold'
                : 'border-border bg-card text-muted-foreground hover:bg-muted/40',
            )}
          >
            {opt ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {opt ? 'Sí' : 'No'}
          </button>
        ))}
      </div>
    </div>
  );
}
