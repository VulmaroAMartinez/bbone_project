import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    overwrite: true,
    // Usar schema local para evitar límites de profundidad/complejidad del endpoint
    schema: "../bbonemx-back/src/schema.gql",
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