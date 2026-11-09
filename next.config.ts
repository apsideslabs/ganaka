import type {NextConfig} from 'next';

// When NEXT_EXPORT=1 the app is built as a fully static site (for GitHub Pages).
// Otherwise it builds as a standalone Next server, which is the default.
const isExport = process.env.NEXT_EXPORT === '1';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // A static export is a deployment artefact; type errors are surfaced in CI
    // separately rather than blocking the site from going live.
    ignoreBuildErrors: isExport,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
  transpilePackages: ['motion'],
  output: isExport ? 'export' : 'standalone',
  ...(isExport
    ? {
        images: {unoptimized: true as const},
        basePath: basePath || undefined,
        assetPrefix: basePath || undefined,
        trailingSlash: true,
      }
    : {
        images: {
          remotePatterns: [
            {
              protocol: 'https' as const,
              hostname: 'picsum.photos',
              port: '',
              pathname: '/**',
            },
          ],
        },
      }),
  webpack: (config, {dev}: {config: any; dev: boolean}) => {
    config.output = config.output || {};
    config.output.chunkLoadTimeout = 300000;
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {ignored: /.*/};
    }
    return config;
  },
};

export default nextConfig;
