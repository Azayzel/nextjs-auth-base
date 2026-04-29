import * as Sentry from '@sentry/nextjs';

import type { ResolverContext } from '@typeDefs/resolver';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

export default async (
  resolve: Function,
  root: any,
  args: any,
  context: ResolverContext,
  info: any
) => {
  try {
    return await resolve(root, args, context, info);
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setUser({
        id: context.me?.uid,
        email: context.me?.email,
      });
      scope.setExtra('body', context.req.body);
      scope.setExtra('origin', context.req.headers.origin);
      scope.setExtra('user-agent', context.req.headers['user-agent']);
      Sentry.captureException(error);
    });
    throw error;
  }
};
