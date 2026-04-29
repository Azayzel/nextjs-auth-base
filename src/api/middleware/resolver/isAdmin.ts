import { MiddlewareFn } from 'type-graphql';
import { GraphQLError } from 'graphql';

import type { ResolverContext } from '@typeDefs/resolver';
import { hasAdminRole } from '@validation/admin';

export const isAdmin: MiddlewareFn<ResolverContext> = async (
  { context },
  next
) => {
  if (!context.me) {
    throw new GraphQLError('Not authenticated as user.', {
      extensions: { code: 'FORBIDDEN' },
    });
  }

  if (!hasAdminRole(context.me)) {
    throw new GraphQLError('No admin user.', {
      extensions: { code: 'FORBIDDEN' },
    });
  }

  return next();
};
