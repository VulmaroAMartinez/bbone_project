import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    overwrite: true,
    schema: "http://localhost:3000/graphql",
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
            }
        }
    },
};

export default config;