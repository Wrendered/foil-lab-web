/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        destination: 'https://gracious-love-production-ec22.up.railway.app/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
