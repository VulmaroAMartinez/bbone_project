import { registerEnumType } from '@nestjs/graphql';

export enum StatusHistoryMR {
  PENDING_PURCHASE_REQUEST = 'PENDING_PURCHASE_REQUEST',
  PENDING_QUOTATION = 'PENDING_QUOTATION',
  PENDING_APPROVAL_QUOTATION = 'PENDING_APPROVAL_QUOTATION',
  PENDING_SUPPLIER_REGISTRATION = 'PENDING_SUPPLIER_REGISTRATION',
  PENDING_PURCHASE_ORDER = 'PENDING_PURCHASE_ORDER',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PENDING_DELIVERY = 'PENDING_DELIVERY',
  DELIVERED = 'DELIVERED',
}

registerEnumType(StatusHistoryMR, {
  name: 'StatusHistoryMR',
  description:
    'Estados posibles del historial de materiales de una solicitud de materiales',
  valuesMap: {
    PENDING_PURCHASE_REQUEST: {
      description: 'Pendiente de solicitud de compra',
    },
    PENDING_QUOTATION: { description: 'Pendiente de cotización' },
    PENDING_APPROVAL_QUOTATION: {
      description: 'Pendiente de aprobación de cotización',
    },
    PENDING_SUPPLIER_REGISTRATION: {
      description: 'Pendiente de alta de proveedor',
    },
    PENDING_PURCHASE_ORDER: { description: 'Pendiente de orden de compra' },
    PENDING_PAYMENT: { description: 'Pendiente de pago' },
    PENDING_DELIVERY: { description: 'Pendiente de entrega' },
    DELIVERED: { description: 'Entregado' },
  },
});
