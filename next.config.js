const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
});

const bundleAnalyzer = require('@next/bundle-analyzer');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js automatically loads .env / .env.local – no dotenv needed.
  // Browser-exposed values must be prefixed with NEXT_PUBLIC_.
  experimental: {
    mdxRs: true,
  },
  webpack: (config, { isServer }) => {
    // MDX – prevent server-only modules from bundling on the client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    return config;
  },
};

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(withMDX(nextConfig));
