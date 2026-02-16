import type { NextConfig } from "next";

/**
 * Configuration options for next-intl-yaml integration.
 */
export type NextIntlYamlOptions = {
  /**
   * Glob expression used to discover locale YAML files.
   * @default "src/(any)/locales/*.yaml"
   */
  globSource?: string;
  /**
   * Output path of the generated manifest file.
   * @default "src/i18n/locales-manifest.ts"
   */
  manifestOutputPath?: string;
  /**
   * Alias prefix used for generated imports (for example "@/").
   * When omitted, imports are generated as relative paths.
   */
  relativeImportPathAlias?: string;
};

/**
 * Normalized options with default values applied.
 */
export type ResolvedNextIntlYamlOptions = Required<NextIntlYamlOptions>;

/**
 * Next.js configuration with next-intl-yaml options.
 */
export type NextConfigWithIntlYaml = NextConfig & {
  nextIntlYaml?: NextIntlYamlOptions;
};
