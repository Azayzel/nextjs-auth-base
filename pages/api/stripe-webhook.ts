// https://stripe.com/docs/payments/checkout/fulfillment#webhooks

import type { NextApiRequest, NextApiResponse } from 'next';

import stripe from '@services/stripe';

// LEGACY
import { createCourse } from '@services/firebase/course';
// LEGACY END

import getConnection from '@models/index';
import { CourseConnector } from '@connectors/course';
import { PartnerConnector } from '@connectors/partner';
import { CouponConnector } from '@connectors/coupon';

import getRawBody from 'raw-body';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function stripeWebhookHandler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const rawBody = await getRawBody(request);

  const sig = Array.isArray(request.headers['stripe-signature'])
    ? request.headers['stripe-signature'][0]
    : request.headers['stripe-signature'];

  if (!sig) {
    response.status(400).send('Webhook Error: missing stripe-signature header');
    return;
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? ''
    );
  } catch (error) {
    response
      .status(400)
      .send(`Webhook Error: ${(error as Error).message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const {
      metadata,
      client_reference_id,
      line_items,
    } = session as any;

    const { courseId, bundleId, coupon, partnerId } = metadata ?? {};

    const connection = await getConnection();
    const courseConnector = new CourseConnector(connection);
    const partnerConnector = new PartnerConnector(connection);
    const couponConnector = new CouponConnector(connection);

    const course = await courseConnector.createCourse({
      userId: client_reference_id,
      courseId: courseId,
      bundleId: bundleId,
      price: line_items?.data?.[0]?.amount_total ?? 0,
      currency: 'USD',
      paymentType: 'STRIPE',
      coupon: coupon,
    });

    if (coupon) {
      await couponConnector.removeCoupon(coupon);
    }

    if (partnerId && partnerId !== client_reference_id) {
      await partnerConnector.createSale(course, partnerId);
    }

    // LEGACY
    await createCourse({
      uid: client_reference_id,
      courseId: courseId,
      bundleId: bundleId,
      amount: Number(
        ((line_items?.data?.[0]?.amount_total ?? 0) / 100).toFixed(2)
      ),
      paymentType: 'STRIPE',
      coupon: coupon,
    });
    // LEGACY END
  }

  response.status(200).json({ received: true });
}

