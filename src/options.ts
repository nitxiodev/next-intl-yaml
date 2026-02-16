import type { NextIntlYamlOptions, ResolvedNextIntlYamlOptions } from "./types";

const DEFAULT_OPTIONS: ResolvedNextIntlYamlOptions = {
  globSource: "src/**/locales/*.yaml",
  manifestOutputPath: "src/i18n/locales-manifest.ts",
  relativeImportPathAlias: "",
};

/**
 * Resolves user options into a full option object with defaults.
 * @param options - Partial options from user configuration
 * @returns Fully resolved options
 */
export function resolveNextIntlYamlOptions(
  options?: NextIntlYamlOptions,
): ResolvedNextIntlYamlOptions {
  return {
    ...DEFAULT_OPTIONS,
    ...options,
  };
}
