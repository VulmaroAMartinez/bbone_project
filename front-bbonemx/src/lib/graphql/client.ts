import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { CombinedGraphQLErrors, CombinedProtocolErrors } from "@apollo/client/errors";

const GRAPHLQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_URL;

const errorLink = new ErrorLink(({ error }) => {
    if (CombinedGraphQLErrors.is(error)) {
        error.errors.forEach(({ message, locations, path }) =>
            console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
        );
    } else if (CombinedProtocolErrors.is(error)) {
        error.errors.forEach(({ message, extensions }) =>
            console.log(`[Protocol Error]: Message: ${message}, Extensions: ${JSON.stringify(extensions)}`)
        )
    } else {
        console.error(`[Error]: ${error.message}`);
    }
});

const authLink = new ApolloLink((operation, forward) => {
    const token = typeof window !== 'undefined' ?
        localStorage.getItem('auth_token') : null;

    operation.setContext(({ headers = {} }) => ({
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
        },
    }));
    return forward(operation);
});

const httpLink = new HttpLink({
    uri: GRAPHLQL_ENDPOINT,
    credentials: 'include',
})

export const client = new ApolloClient({
    link: ApolloLink.from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'cache-and-network',
            errorPolicy: 'all',
        },
        query: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
        },
        mutate: {
            errorPolicy: 'all',
        },
    },
});