import { MiddlewareFn } from 'type-graphql';
import { GraphQLError } from 'graphql';

import type { ResolverContext } from '@typeDefs/resolver';
import { hasPartnerRole } from '@validation/partner';

export const isPartner: MiddlewareFn<ResolverContext> = async (
  { context },
  next
) => {
  if (!context.me) {
    throw new GraphQLError('Not authenticated as user.', {
      extensions: { code: 'FORBIDDEN' },
    });
  }

  if (!hasPartnerRole(context.me)) {
    throw new Error('No partner user.');
  }

  return next();
};
