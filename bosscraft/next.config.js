/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  webpack: (config) => {
    return config;
  }
};

module.exports = nextConfig;
