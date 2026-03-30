import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {ignoreBuildErrors: true},
  allowedDevOrigins: ['https://localhost:3000', 'http://cho.yamban-tech.it:3000'],
  serverExternalPackages: ['pg', 'bcrypt', '@prisma/adapter-pg'],
  // reactCompiler:true,
  // experimental:{turbopackFileSystemCacheForBuild :true}
};

export default nextConfig;
