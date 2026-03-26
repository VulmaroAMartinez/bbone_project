import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    overwrite: true,
    // Usar el esquema generado/actualizado en la raíz del backend.
    // `src/schema.gql` puede quedar desactualizado y romper la validación de documentos.
    schema: "../bbonemx-back/schema.gql",
    documents: [
        "src/lib/graphql/operations/**/*.ts",
        //"src/**/*.{ts,tsx}"
    ],
    ignoreNoDocuments: true,
    generates: {
        "./src/lib/graphql/generated/": {
            preset: "client",
            presetConfig: {
                gqlTagName: "gql",
            },
            config: {
                scalars: {
                    ID: "string",
                    DateTime: "string"
                },
                enumsAsTypes: true,
                useTypeImports: true,
            }
        }
    },
};

export default config;