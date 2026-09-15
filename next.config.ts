import type { NextConfig } from "next";

const isGhPages = process.env.DEPLOY_TARGET === "gh-pages";

// GH Pages project sites are served at /<repo-name>/. Derive it so renaming the
// repo never breaks asset paths again. GitHub Actions provides GITHUB_REPOSITORY.
const repoName = (
  process.env.GH_PAGES_BASE_PATH ||
  process.env.GITHUB_REPOSITORY?.split("/")[1] ||
  "moneymeva"
).replace(/^\/+|\/+$/g, "");

const basePath = isGhPages ? `/${repoName}` : "";

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  devIndicators: false,
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
