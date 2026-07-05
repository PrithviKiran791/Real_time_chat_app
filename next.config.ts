import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The previous unconditional redirect from "/" to "/conversations" has
  // been removed: "/" now renders the public landing page. Signed-in users
  // are redirected to "/conversations" client-side from
  // app/(marketing)/page.tsx instead, so authenticated behavior is
  // unchanged.
};

export default nextConfig;
