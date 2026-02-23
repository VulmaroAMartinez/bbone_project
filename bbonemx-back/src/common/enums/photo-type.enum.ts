import { registerEnumType } from "@nestjs/graphql";

export enum PhotoType {
    BEFORE = 'BEFORE',
    AFTER = 'AFTER',
}

registerEnumType(PhotoType, {
    name: 'PhotoType',
    description: 'Tipo de foto',
    valuesMap: {
        BEFORE: { description: 'Foto antes del trabajo' },
        AFTER: { description: 'Foto después del trabajo' },
    },
});