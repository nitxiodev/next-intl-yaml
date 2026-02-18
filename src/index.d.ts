import "./yaml";

import type { NextConfig } from "next";
import type {
  NextConfigWithIntlYaml,
  NextIntlYamlOptions,
  ResolvedNextIntlYamlOptions,
} from "./types";

export type { NextIntlYamlOptions, ResolvedNextIntlYamlOptions };

export function generateLocalesManifest(options?: NextIntlYamlOptions): void;

declare function withNextIntlYaml(config: NextConfigWithIntlYaml): NextConfig;
export default withNextIntlYaml;
