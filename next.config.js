/** @type {import('next').NextConfig} */
const nextConfig = {
    rewrites: async () => {
      return [
        {
          source: '/api/:path*',
          destination:'http://127.0.0.1:8080/api/:path*'
        },
      ]
    },
  }
  
  module.exports = nextConfig