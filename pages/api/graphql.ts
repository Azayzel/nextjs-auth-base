import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { buildSchema } from 'type-graphql';
import { applyMiddleware } from 'graphql-middleware';

import 'reflect-metadata';

import getConnection from '@models/index';
import { AdminConnector } from '@connectors/admin';
import { PartnerConnector } from '@connectors/partner';
import { CourseConnector } from '@connectors/course';
import { CouponConnector } from '@connectors/coupon';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { ResolverContext } from '@typeDefs/resolver';

import resolvers from '@api/resolvers';
import meMiddleware from '@api/middleware/global/me';
import sentryMiddleware from '@api/middleware/global/sentry';

import firebaseAdmin from '@services/firebase/admin';

if (process.env.FIREBASE_ADMIN_UID) {
  firebaseAdmin
    .auth()
    .getUser(process.env.FIREBASE_ADMIN_UID)
    .then(user => {
      if (process.env.FIREBASE_ADMIN_UID) {
        firebaseAdmin
          .auth()
          .setCustomUserClaims(process.env.FIREBASE_ADMIN_UID, {
            ...user.customClaims,
            admin: true,
          });
      }
    });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

let handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

async function getHandler() {
  if (handler) return handler;

  const connection = await getConnection();

  const schema = await buildSchema({
    resolvers,
    dateScalarMode: 'isoDate',
  });

  const server = new ApolloServer<ResolverContext>({
    schema: applyMiddleware(schema, sentryMiddleware, meMiddleware),
  });

  handler = startServerAndCreateNextHandler<
    NextApiRequest,
    NextApiResponse,
    ResolverContext
  >(server, {
    context: async (req, res): Promise<ResolverContext> => {
      const adminConnector = new AdminConnector();
      const partnerConnector = new PartnerConnector(connection);
      const courseConnector = new CourseConnector(connection);
      const couponConnector = new CouponConnector(connection);

      return {
        req,
        res,
        adminConnector,
        courseConnector,
        partnerConnector,
        couponConnector,
      };
    },
  });

  return handler;
}

export default async function graphqlHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS headers for GraphQL playground / external clients
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }

  const h = await getHandler();
  return h(req, res);
}

