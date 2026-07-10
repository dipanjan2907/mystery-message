/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    staticWorkerRequestDeduping: false,
  },
};

export default nextConfig;
