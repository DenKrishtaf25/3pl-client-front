import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
