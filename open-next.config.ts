import {
  defineCloudflareConfig,
  type OpenNextConfig,
} from "@opennextjs/cloudflare";

export default {
  ...defineCloudflareConfig(),
  buildCommand: "pnpm next:build",
} satisfies OpenNextConfig;
