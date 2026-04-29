import { MiddlewareFn } from 'type-graphql';
import { GraphQLError } from 'graphql';

import type { ResolverContext } from '@typeDefs/resolver';

export const isAuthenticated: MiddlewareFn<ResolverContext> = async (
  { context },
  next
) => {
  if (!context.me) {
    throw new GraphQLError('Not authenticated as user.', {
      extensions: { code: 'FORBIDDEN' },
    });
  }

  return next();
};
