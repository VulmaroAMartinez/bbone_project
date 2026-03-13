import { registerEnumType } from '@nestjs/graphql';

export enum ReasonForPayment {
  HOLIDAY = 'HOLIDAY',
  WORK_BREAK = 'WORK_BREAK',
  OVERTIME = 'OVERTIME',
}

registerEnumType(ReasonForPayment, {
  name: 'ReasonForPayment',
  description: 'Razón de pago para horas extra',
  valuesMap: {
    HOLIDAY: { description: 'Día festivo' },
    WORK_BREAK: { description: 'Descanso laboral' },
    OVERTIME: { description: 'Tiempo extra' },
  },
});
