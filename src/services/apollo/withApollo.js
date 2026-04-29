import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';

import withApollo from 'next-with-apollo';

import signOut from '@components/Navigation/signOut';

const httpLink = new HttpLink({
  uri: `${process.env.BASE_URL}/api/graphql`,
  credentials: 'same-origin',
});

const getErrorLink = (ctx = { req: null, res: null }) =>
  onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, extensions }) => {
        console.log('GraphQL error:', message, extensions);

        if (extensions?.code === 'UNAUTHENTICATED') {
          signOut(ctx.req, ctx.res, ctx.apolloClient);
        }

        if (extensions?.code === 'FORBIDDEN') {
          signOut(ctx.req, ctx.res, ctx.apolloClient);
        }
      });
    }

    if (networkError) {
      console.log('Network error', networkError);

      if ('statusCode' in networkError && networkError.statusCode === 401) {
        signOut(ctx.req, ctx.res, ctx.apolloClient);
      }
    }
  });

export default withApollo(
  ({ ctx, initialState }) =>
    new ApolloClient({
      link: from([getErrorLink(ctx), httpLink]),
      cache: new InMemoryCache().restore(initialState ?? {}),
    })
);
