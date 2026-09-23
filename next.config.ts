import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack does not walk up to a lockfile
  // outside this repo (there is an unrelated package-lock.json in $HOME).
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
