// Prefijos para generación de folios
export const FOLIO_PREFIX = {
  WORK_ORDER: 'OT',
  FINDING: 'H',
  MATERIAL_REQUEST: 'SM',
} as const;

// Formato de fecha para folios: YYMMDD
export const FOLIO_DATE_FORMAT = 'YYMMDD';

// Número máximo de descansos por semana para técnicos
export const MAX_REST_DAYS_PER_WEEK = 2;


// Metadata keys para decoradores
export const METADATA_KEYS = {
  ROLES: 'roles',
  IS_PUBLIC: 'isPublic',
} as const;
