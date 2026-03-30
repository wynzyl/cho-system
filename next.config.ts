import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {ignoreBuildErrors: true},
  allowedDevOrigins: ['https://localhost:3000', 'http://cho.yamban-tech.it:3000'],
  // reactCompiler:true,
  // experimental:{turbopackFileSystemCacheForBuild :true}
};

export default nextConfig;
