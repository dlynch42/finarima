/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['automodel.s3.us-west-1.amazonaws.com'], // Add your S3 bucket domain here
  },
};

module.exports = nextConfig;