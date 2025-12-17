import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
    ],
  },
  // Подавляем логирование NEXT_REDIRECT в development (это не ошибки, а нормальное поведение)
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  // Оптимизация для production
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Ограничение размера тела запроса
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  /* config options here */
  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    
    // Исключаем src_backup из компиляции
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }
    
    // Исключаем папку src_backup из обработки
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/src_backup/**',
        '**/node_modules/**',
        ...(Array.isArray(config.watchOptions?.ignored) ? config.watchOptions.ignored : []),
      ],
    };
    
    return config;
  },
};

export default nextConfig;
