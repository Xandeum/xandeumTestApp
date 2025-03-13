/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.resolve.fallback = {

      // if you miss it, all the other options in fallback, specified
      // by next.js will be dropped.
      ...config.resolve.fallback,
      fs: false, // the solution
    };

    return config;
  },
  images: {
    domains: ['i.ibb.co', 'static.wixstatic.com', 'raw.githubusercontent.com'],
  },
}

module.exports = nextConfig
