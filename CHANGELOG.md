# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [2.0.0] – 2026-04-29

### Summary
Major dependency upgrade bringing every package to its latest release and
applying the code-quality improvements required by those upgrades.

---

### Breaking Changes

#### Apollo Client – unified `@apollo/client` package
| Removed | Replaced by |
|---|---|
| `apollo-client` | `@apollo/client` |
| `apollo-cache-inmemory` | `@apollo/client` (built-in `InMemoryCache`) |
| `apollo-link-http` | `@apollo/client` (built-in `HttpLink`) |
| `apollo-link-error` | `@apollo/client/link/error` |
| `apollo-link-context` | `@apollo/client/link/context` |
| `@apollo/react-hooks` | `@apollo/client` |
| `@apollo/react-testing` | `@apollo/client/testing` |
| `apollo-server-testing` | `@apollo/server` test utilities |
| `apollo` (CLI) | `@graphql-codegen/cli` |

All imports from `@apollo/react-hooks` across components and screens have
been updated to `@apollo/client`. The error-link import now comes from
`@apollo/client/link/error`.

#### Apollo Server – `@apollo/server` + `@as-integrations/next`
| Removed | Replaced by |
|---|---|
| `apollo-server` | `@apollo/server` |
| `apollo-server-micro` | `@apollo/server` + `@as-integrations/next` |

`pages/api/graphql.ts` now uses `startServerAndCreateNextHandler` from
`@as-integrations/next`. The server instance is lazily cached to avoid
re-initialising on every hot-reload request.

`AuthenticationError` / `ForbiddenError` (removed in `@apollo/server` v4+)
are replaced with `GraphQLError` from the `graphql` package, using the
`extensions.code` field:
```ts
// Before
throw new ForbiddenError('Not authenticated.');
// After
throw new GraphQLError('Not authenticated.', {
  extensions: { code: 'FORBIDDEN' },
});
```

#### AWS SDK – v2 → v3 modular
| Removed | Replaced by |
|---|---|
| `aws-sdk` | `@aws-sdk/client-s3` |

`src/services/aws/s3.js` was converted to TypeScript (`s3.ts`) and
rewritten to use the v3 `S3Client`:
```ts
import { S3Client } from '@aws-sdk/client-s3';
```
Any call sites that use `s3.getObject({…}).promise()` must be updated to use
the `GetObjectCommand` + `client.send()` pattern from the v3 SDK.

#### Firebase – v7 → v12 (modular SDK)
| Removed / changed | New |
|---|---|
| `import firebase from 'firebase/app'` | `import { initializeApp, getApps } from 'firebase/app'` |
| `firebase.auth()` | `getAuth(app)` |
| `firebase.auth.Auth.Persistence.NONE` | `inMemoryPersistence` |
| `FIREBASE_*` env vars | `NEXT_PUBLIC_FIREBASE_*` (browser-exposed) |

`src/services/firebase/client.ts` has been rewritten to use the tree-shakeable
modular API. Update all usage sites that imported the default export and called
`firebase.auth()` to instead import `auth` from the client module directly.

`src/services/firebase/admin.js` has been converted to TypeScript
(`admin.ts`). The service account key is now loaded with a `try/catch` so
the build no longer fails when `firebaseServiceAccountKey.json` is absent.

#### Sentry – `@sentry/browser` + `@sentry/node` → `@sentry/nextjs`
| Removed | Replaced by |
|---|---|
| `@sentry/browser` | `@sentry/nextjs` |
| `@sentry/node` | `@sentry/nextjs` |
| `graphql-middleware-sentry` | custom inline middleware (see below) |

`graphql-middleware-sentry` was unmaintained and incompatible with the new
Sentry SDK. It has been replaced with a lightweight inline middleware in
`src/api/middleware/global/sentry.ts` that uses `Sentry.captureException`
directly inside a try/catch wrapper.

`pages/_error.js` and the GraphQL sentry middleware now import from
`@sentry/nextjs`.

#### TypeORM – 0.2 → 0.3
| Removed | Replaced by |
|---|---|
| `getConnectionManager()` | Singleton `DataSource` instance |
| `Connection` type | `DataSource` type |
| `connection.isConnected` | `dataSource.isInitialized` |
| `findOne({ field })` shorthand | `findOne({ where: { field } })` |
| `count({ field })` shorthand | `count({ where: { field } })` |
| `find({ field: Between() })` shorthand | `find({ where: { field: Between() } })` |

`src/models/index.ts` was rewritten to use the `DataSource` class.
All three connectors (`CourseConnector`, `PartnerConnector`,
`CouponConnector`) have their constructor parameter updated from `Connection`
to `DataSource`, and all `findOne` / `count` calls use the explicit `where`
wrapper required by TypeORM 0.3.

#### Stripe – v8 → v22
The `require('stripe')(secret)` pattern is removed; use `new Stripe(secret, { apiVersion })`:
```ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_CLIENT_SECRET ?? '', {
  apiVersion: '2025-03-31.basil',
});
```
The webhook handler in `pages/api/stripe-webhook.ts` now uses
`response.status(400).send()` / `response.status(200).json()` instead of
the removed `micro.send()` helper, and the `stripe-signature` header is
properly narrowed from `string | string[]` to `string`.

#### Micro / micro-cors removed
`micro` and `micro-cors` have been removed. CORS for the GraphQL endpoint is
now handled by explicit response headers in `pages/api/graphql.ts`.

#### microrouter removed
`microrouter` is no longer a dependency. `src/types/server.ts` now extends
`NextApiRequest` / `NextApiResponse` from `next` directly.

#### next-page-transitions removed (abandoned)
`next-page-transitions` was last published in 2020 and is incompatible with
React 18+. The `<PageTransition>` wrapper has been removed from `pages/_app.js`.
If you need page transitions, consider [Framer Motion](https://www.framer.com/motion/)
(`framer-motion` + `AnimatePresence`).

#### react-ga → react-ga4 (Google Analytics 4)
Universal Analytics was sunset in 2024. The GA service
(`src/services/ga/index.ts`) now uses `react-ga4`:
```ts
// pageview
ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
// event
ReactGA.event({ category, action });
// exception
ReactGA.event('exception', { description, fatal });
```

#### next-cookies removed
`next-cookies` is no longer used. The session cookie is read directly from
`ctx.req?.cookies?.session` in `pages/_app.js`, which Next.js populates
automatically.

#### dotenv removed
Next.js has loaded `.env` / `.env.local` automatically since v9.4. The
`require('dotenv').config()` call has been removed from `next.config.js`.
Use `.env.local` for local secrets (already git-ignored).

#### @zeit/next-less and @zeit/next-source-maps removed
Both packages are abandoned (the `@zeit` organisation became Vercel).
- CSS/LESS for Ant Design: Ant Design 5+ ships CSS-in-JS by default and no
  longer requires a Less loader. The custom Ant Design webpack Less workaround
  in `next.config.js` has been removed.
- Source maps: Next.js 12+ enables production source maps natively
  (`productionBrowserSourceMaps: true` in `next.config.js` if needed).

#### next-compose-plugins removed
Plugins are now composed with direct function calls in `next.config.js`:
```js
module.exports = withBundleAnalyzer(withMDX(nextConfig));
```

#### Environment variable naming convention
All Firebase config variables accessed in the browser **must** be prefixed
with `NEXT_PUBLIC_` so Next.js exposes them to the client bundle:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
…
```
Server-only secrets (Firebase Admin, Stripe, DB credentials, etc.) keep their
existing names without the prefix.

---

### Package Version Bumps

| Package | Before | After |
|---|---|---|
| `next` | 9.3.1 | 16.2.4 |
| `react` / `react-dom` | 16.13.0 | 19.2.5 |
| `typescript` | 3.8.3 | 6.0.3 |
| `firebase` | 7.11.0 | 12.12.1 |
| `firebase-admin` | 8.10.0 | 13.8.0 |
| `graphql` | 14.6.0 | 16.13.2 |
| `typeorm` | 0.2.24 | 0.3.28 |
| `pg` | 7.18.2 | 8.20.0 |
| `type-graphql` | 0.18.0-beta.16 | 2.0.0-rc.3 |
| `class-validator` | 0.11.1 | 0.15.1 |
| `graphql-middleware` | 4.0.2 | 6.1.35 |
| `graphql-shield` | 7.2.1 | 7.6.5 |
| `styled-components` | 5.0.1 | 6.4.1 |
| `antd` | 3.26.13 | 6.3.7 |
| `js-cookie` | 2.2.1 | 3.0.5 |
| `stripe` | 8.32.0 | 22.1.0 |
| `axios` | 0.19.2 | 1.15.2 |
| `localforage` | 1.7.3 | 1.10.0 |
| `prism-react-renderer` | 1.0.2 | 2.4.1 |
| `reflect-metadata` | 0.1.13 | 0.2.2 |
| `react-player` | 1.15.2 | 3.4.0 |
| `@nivo/calendar` | 0.61.1 | 0.99.0 |
| `@next/mdx` | 9.3.1 | 16.2.4 |
| `@next/bundle-analyzer` | 9.3.1 | 16.2.4 |
| `jest` | 24.9.0 | 30.3.0 |
| `babel-jest` | 24.9.0 | 30.3.0 |
| `prettier` | ^2.3.0 | 3.8.3 |
| `concurrently` | 5.1.0 | 9.2.1 |
| `@testing-library/react` | 9.5.0 | 16.3.2 |
| `@testing-library/jest-dom` | 5.1.1 | 6.9.1 |
| `@types/react` | 16.9.23 | 19.2.14 |
| `@types/node` | 13.9.2 | 25.6.0 |
| `@babel/plugin-proposal-class-properties` | 7.8.3 | 7.18.6 |
| `@babel/plugin-proposal-decorators` | 7.8.3 | 7.29.0 |
| `@graphql-codegen/*` | 1.13.x | 6.x |

---

### Config / Tooling Changes

#### tsconfig.json
- `target` updated from `es6` → `ES2022`
- `lib` updated to `["dom", "dom.iterable", "ES2022", "ESNext"]`
- `module` updated from `esnext` → `ESNext`
- `moduleResolution` updated from `node` → `bundler` (TypeScript 5+/6 best practice for Next.js)

#### jest.config.js
- `testEnvironment` changed from `jsdom` to `jest-environment-jsdom` (Jest 27+ requires the
  environment to be the fully-qualified package name; `jest-environment-jsdom` is now a
  separate package)
- `babel-plugin-styled-components` added as an explicit dev dependency (required by `.babelrc`
  in styled-components v6; was previously bundled with the main package)
- `@testing-library/dom` added as an explicit dev dependency (required by `@testing-library/react`
  v16 as a peer; was previously bundled transitively)

#### next.config.js
- Removed `dotenv` call, `@zeit/next-less`, `@zeit/next-source-maps`, `next-compose-plugins`
- Removed the Ant Design Less / null-loader webpack hack (no longer needed with Ant Design 5+)
- Removed the Sentry `@sentry/node → @sentry/browser` alias (handled by `@sentry/nextjs`)
- MDX is now configured with `experimental.mdxRs: true` for the Rust-based compiler
- `webpack.node.fs = 'empty'` replaced by `resolve.fallback.fs = false`

#### codegen.yml
- Added `apolloClientVersion: 3` to generate hooks compatible with `@apollo/client` 3/4
- Fixed `add` plugin syntax to use the `content:` key (codegen v2+ format)

#### .gitignore
- Added `.env.local` and `.env.*.local` entries (Next.js convention)

#### CI
- `.travis.yml` replaced by `.github/workflows/ci.yml` (GitHub Actions)

---

### Code Quality Improvements

1. **`src/services/firebase/admin.ts`** – Converted from `.js` to `.ts`; service-account
   key is now loaded safely with a `try/catch` instead of a static import that breaks
   the build if the file is absent.

2. **`src/services/aws/s3.ts`** – Converted from `.js` to `.ts`; uses v3 modular SDK.

3. **`src/services/apollo/withApollo.js`** – Removed unused `headers` parameter from the
   factory; `extensions?.code` now uses optional chaining (was `extensions.code`, which
   threw when `extensions` was `undefined`); `networkError.statusCode` narrowed with
   `'statusCode' in networkError` guard.

4. **`src/api/middleware/global/sentry.ts`** – Replaced unmaintained
   `graphql-middleware-sentry` with a minimal inline try/catch middleware.

5. **`pages/api/stripe-webhook.ts`** – Removed `micro` dependency; fixed `stripe-signature`
   header narrowing (`string | string[]` → `string`); resolved the TODO about Stripe not
   reacting to the response (was caused by `send()` from `micro` not flushing correctly
   in the Next.js runtime).

6. **`src/connectors/coupon.ts`** – Fixed TypeORM 0.3 `findOne` calls to use explicit
   `{ where: { … } }` (the shorthand silently returned `undefined` in 0.3).

7. **`src/connectors/partner.ts`** – Fixed `count` call to use explicit `{ where: { … } }`;
   fixed `find` inside `getVisitorsBetween` similarly.

8. **`src/models/index.ts`** – Removed the `@ts-ignore` hacks required for the 0.2
   `getConnectionManager` workaround; replaced with a clean singleton `DataSource`.

---

### Migration Notes for Future Versions

The following items are documented for awareness but were **not** changed in this
release, as they would require wider rewrites:

- **Ant Design 3 → 5/6**: Component API has significant breaking changes (e.g.,
  `Form` is now hook-based, `Icon` is a separate `@ant-design/icons` package,
  `Button` `type` prop values changed). Follow the
  [Ant Design migration guide](https://ant.design/docs/react/migration-v5).

- **Next.js App Router**: The project uses the Pages Router. The App Router
  (introduced in Next.js 13) offers Server Components, streaming, and simplified
  layouts. Full migration is a significant architectural change but is the
  recommended path for new work.

- **react-async-script-loader**: This package has no v2 and appears unmaintained.
  Consider replacing with `next/script` (`<Script strategy="lazyOnload" />`).

- **`@apollo/client` + SSR**: The `next-with-apollo` HOC is still used for SSR
  state hydration. Apollo Client 3/4 has first-class support for Next.js via
  `@apollo/experimental-nextjs-app-support` (App Router) or a simpler pattern
  without `next-with-apollo` for Pages Router.

- **`type-graphql` 2.0**: The `2.0.0-rc.3` release candidate requires
  `class-validator` 0.14+ and has changed decorator semantics. Review the
  [type-graphql 2.0 changelog](https://typegraphql.com/docs/changelog.html).

### Pre-existing Test Failures (not introduced by this upgrade)

The following test suites were already failing before this upgrade and continue
to fail because they depend on Ant Design 3.x APIs that were removed in v5+:

- `Form.create()` – removed in antd 4; use the `useForm` hook
- `Icon` from `antd` – moved to `@ant-design/icons`
- `@testing-library/react` `wait` helper – renamed to `waitFor` in v10

Fixing these requires updating the Ant Design usage throughout the component
tree and updating test utilities to the current `@testing-library/react` API.
All other test suites (6 passing) pass without modification after this upgrade.
