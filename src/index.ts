import type { NextConfig } from "next";
import { generateLocalesManifest } from "./manifest";
import type { NextConfigWithIntlYaml } from "./types";

export type { NextIntlYamlOptions } from "./types";
export { generateLocalesManifest };

const YAML_TURBOPACK_RULE = {
  loaders: ["yaml-loader"],
  as: "*.js",
};
const STARTUP_LOG_FLAG = "__next_intl_yaml_startup_logged__";

/**
 * Enhances a Next.js config with YAML loader support and locale-manifest generation.
 * @param nextConfig - Base Next.js configuration plus next-intl-yaml options.
 * @returns Next.js configuration with webpack and turbopack YAML handling.
 */
export default function withNextIntlYaml(
  nextConfig: NextConfigWithIntlYaml = {},
): NextConfig {
  const { nextIntlYaml, turbopack, webpack, ...rest } = nextConfig;

  // Log only once per process to avoid duplicate startup/cleanup messages.
  const runtimeGlobal = globalThis as typeof globalThis & {
    [STARTUP_LOG_FLAG]?: boolean;
  };
  if (!runtimeGlobal[STARTUP_LOG_FLAG]) {
    console.info("[next-intl-yaml] Generating locales");
    runtimeGlobal[STARTUP_LOG_FLAG] = true;
  }

  // Generate the manifest from config-driven options before Next.js starts.
  generateLocalesManifest(nextIntlYaml);

  return {
    ...rest,
    webpack(config, options) {
      const configWithYamlLoader = {
        ...config,
        module: {
          ...config.module,
          rules: [
            ...(config.module?.rules ?? []),
            {
              test: /\.ya?ml$/,
              use: "yaml-loader",
            },
          ],
        },
      };

      if (typeof webpack === "function") {
        return webpack(configWithYamlLoader, options);
      }

      return configWithYamlLoader;
    },
    turbopack: {
      ...turbopack,
      rules: {
        ...(turbopack?.rules ?? {}),
        "*.yaml": YAML_TURBOPACK_RULE,
      },
    },
  };
}
