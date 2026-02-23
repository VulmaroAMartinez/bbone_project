import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  ADMIN = 'ADMIN',
  TECHNICIAN = 'TECHNICIAN',
  REQUESTER = 'REQUESTER',
}

registerEnumType(Role, {
  name: 'Role',
  description: 'Roles de usuario en el sistema',
  valuesMap: {
    ADMIN: { description: 'Administrador - Acceso completo al sistema' },
    TECHNICIAN: { description: 'Técnico - Gestiona sus asignaciones de trabajo' },
    REQUESTER: { description: 'Solicitante - Crea órdenes de trabajo y firma' },
  },
});
