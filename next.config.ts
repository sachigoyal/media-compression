import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Fix for FFmpeg.wasm
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    // Handle FFmpeg worker and dynamic imports
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: { loader: 'worker-loader' },
    });

    // Fix for dynamic imports in FFmpeg
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Handle dynamic imports
    config.output.environment = {
      ...config.output.environment,
      dynamicImport: true,
    };

    return config;
  },
  experimental: {
    esmExternals: 'loose',
  },
};

export default nextConfig;
