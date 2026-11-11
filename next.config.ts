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
    // Type errors now block the build. The previous escape hatch was hiding
    // 12,191 errors — 12,154 of them from one wrong bracket in the VSOP87
    // type declarations — which meant a genuine type regression could reach
    // production unnoticed.
    ignoreBuildErrors: false,
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
