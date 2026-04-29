// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

import React from 'react';
import Error from 'next/error';
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

const MyError = ({ statusCode, hasGetInitialPropsRun, err }) => {
  if (!hasGetInitialPropsRun && err) {
    // getInitialProps is not called in case of
    // https://github.com/vercel/next.js/issues/8592. As a workaround, we pass
    // err via _app.js so it can be captured
    Sentry.captureException(err);
  }

  return <Error statusCode={statusCode} />;
};

MyError.getInitialProps = async ({ res, err, asPath }) => {
  const errorInitialProps = await Error.getInitialProps({ res, err });

  // Workaround for https://github.com/vercel/next.js/issues/8592, mark when
  // getInitialProps has run
  errorInitialProps.hasGetInitialPropsRun = true;

  if (res) {
    if (res.statusCode === 404) {
      // Opinionated: do not record an exception in Sentry for 404
      return { statusCode: 404 };
    }

    if (err) {
      Sentry.captureException(err);

      return errorInitialProps;
    }
  } else {
    if (err) {
      Sentry.captureException(err);

      return errorInitialProps;
    }
  }

  Sentry.captureException(
    new Error(
      `_error.js getInitialProps missing data at path: ${asPath}`
    )
  );

  return errorInitialProps;
};

export default MyError;
