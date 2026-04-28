# My Course Platform

[![CI](https://github.com/Azayzel/nextjs-auth-base/actions/workflows/ci.yml/badge.svg)](https://github.com/Azayzel/nextjs-auth-base/actions/workflows/ci.yml)

**Server-Side User Management with**

- GraphQL ([Tutorial](https://www.robinwieruch.de/graphql-apollo-server-tutorial)) and Firebase ([Tutorial](https://www.robinwieruch.de/complete-firebase-authentication-react-tutorial))
  - Sign In
  - Sign Up
  - Sign Out
  - Email Change
  - Password Change
  - Password Reset

**Client and Server-Side Protected Routes with**

- Next.js Middleware and Firebase Session

**Payment with**

- Stripe
- PayPal

**Styling with**

- [Ant Design](https://ant.design/)
- Styled Components ([Tutorial](https://www.robinwieruch.de/react-styled-components))
- Page Transitions

**Type Support with**

- TypeScript

**Tested Code Base with**

- [Jest](https://jestjs.io/) ([Tutorial](https://www.robinwieruch.de/react-testing-jest))
- [React Testing Library](https://github.com/testing-library/react-testing-library)
- [Apollo Mocks](https://www.apollographql.com/docs/react/development-testing/testing/)

**Environment Variables with**

- Next.js built-in `.env` support — no extra package required.
- Prefix browser-exposed variables with `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`).

**Absolute Imports with**

- TypeScript `paths` in `tsconfig.json` (no Babel plugin needed with modern Next.js + SWC).

**Error Monitoring**

- Sentry

**More Features**

- Discounts with Coupons
- Affiliate Marketing with Partner Program

## Recommended Upgrade Path

> The codebase was originally built on Next.js 9 / Pages Router. When modernising, consider:
>
> - **Next.js App Router** — move pages to `app/` directory for Server Components, streaming, and simplified data fetching.
> - **Apollo Client v3 / v4** — replace the legacy `apollo-client` + `@apollo/react-hooks` packages with the unified `@apollo/client` package.
> - **Firebase JS SDK v10** — use the modular (tree-shakeable) API (`import { getAuth } from 'firebase/auth'`).
> - **[NextAuth.js (Auth.js)](https://authjs.dev/)** — consider replacing the custom Firebase session management with Auth.js for simpler OAuth/credential flows.
> - **SWC compiler** — Next.js ships SWC by default; remove `.babelrc` overrides that conflict with it.
> - **Dependabot or Renovate** — replace the defunct Greenkeeper service with [Dependabot](https://docs.github.com/en/code-security/dependabot) (GitHub-native) or [Renovate](https://www.mend.io/renovate/) for automated dependency updates.

## Installation

```bash
git clone git@github.com:Azayzel/nextjs-auth-base.git
cd nextjs-auth-base
npm install        # or: pnpm install / yarn install
npm run dev
```

Visit http://localhost:3000/

### .env file

Create a _.env.local_ file (Next.js loads this automatically and it is excluded from git by default).

> **Important:** Variables accessed in the browser **must** be prefixed with `NEXT_PUBLIC_`.

```
BASE_URL=http://localhost:3000

# Firebase (browser-side — expose via NEXT_PUBLIC_)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=

# Stripe
STRIPE_CLIENT_ID=
STRIPE_CLIENT_SECRET=
STRIPE_WEBHOOK_SECRET=

# Coupons / Admin
COUPON_SALT=
COUPON_URL=
FIREBASE_ADMIN_UID=

# Sentry
SENTRY_DSN=

# Newsletter / CRM
REVUE_TOKEN=
SLACK_TOKEN=
CONVERTKIT_API_KEY=
CONVERTKIT_FORM_ID=

# Object Storage
S3_ENDPOINT=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET=

# Database
DATABASE_TYPE=
DATABASE_HOST=
DATABASE_PORT=
DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_NAME=
DATABASE_SSL_CERTIFICATE=
```

- [FIREBASE](https://firebase.google.com/)
  - Activate Email/Password Sign-In Method for your Firebase Project
- [PAYPAL](https://developer.paypal.com/)
  - [Checkout](https://developer.paypal.com/docs/checkout/)
- [STRIPE](https://stripe.com/)
  - [Checkout](https://stripe.com/docs/payments/checkout/one-time)
  - [Webhook](https://stripe.com/docs/payments/checkout/fulfillment#webhooks)

### .firebaseServiceAccountKey.json file

Visit [here](https://firebase.google.com/docs/admin/setup/#initialize-sdk) for Firebase Admin SDK and generate a _firebaseServiceAccountKey.json_ file from there which should be in your project's root folder. Add it to your _.gitignore_ file — **never commit service account keys**.

### Admin Account

If you want to have an account with Firebase admin claims, create this Firebase account first via the Firebase console, set the user account's `uid` in _.env.local_ as `FIREBASE_ADMIN_UID`, and restart your server.

### Stripe CLI for Webhook in Development Mode

[Stripe CLI](https://stripe.com/docs/stripe-cli)

```bash
stripe login
# follow the browser prompt
stripe listen --forward-to localhost:3000/api/stripe-webhook
# copy the printed webhook signing secret
```

Set the secret in _.env.local_:

```
STRIPE_WEBHOOK_SECRET=whsec_...
```

Then trigger a test event with:

```bash
stripe trigger payment_intent.succeeded
```

Or use the web application's Stripe Checkout flow directly.
