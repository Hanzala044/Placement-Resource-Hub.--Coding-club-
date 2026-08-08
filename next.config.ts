import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Pins the workspace root so Turbopack doesn't go hunting for a
  // package-lock.json in a parent folder (e.g. a stray one in the user's
  // home directory) when this repo isn't nested under another lockfile.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
