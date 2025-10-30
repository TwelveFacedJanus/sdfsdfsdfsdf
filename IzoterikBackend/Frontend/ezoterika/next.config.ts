import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Disable rewrites for now to fix build issues
  // rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://backend:8000/api/:path*',
  //     },
  //   ];
  // },
};

export default nextConfig;
