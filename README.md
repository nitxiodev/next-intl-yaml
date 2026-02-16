# next-intl-yaml

Compile distributed YAML translation files into a generated manifest that can be consumed by [`next-intl`](https://next-intl.dev/) in Next.js App Router projects.

## What it does

- Scans YAML files with a glob (default: `src/**/locales/*.yaml`)
- Generates a TypeScript manifest (default: `src/i18n/locales-manifest.ts`)
- Injects Turbopack `yaml-loader` rule via `withNextIntlYaml`
- Works with Next.js HMR/Fast Refresh during development

## YAML file convention

Use this naming pattern:

```txt
src/<module>/locales/<namespace>.<locale>.yaml
```

Example:

```txt
src/home/locales/hero.en.yaml
src/home/locales/hero.es.yaml
src/checkout/locales/summary.en.yaml
```

Generated namespaces are PascalCase (`hero` -> `Hero`, `summary` -> `Summary`).

## Install in your Next.js project

Install in the app where you want to consume YAML translations:

> [!WARNING]
> `next-intl` is required and must be installed in your app.
> This package declares `next-intl` as a peer dependency.

```bash
pnpm add -D next-intl-yaml
```

If you use npm or yarn:

```bash
npm install -D next-intl-yaml
# or
yarn add -D next-intl-yaml
```

## Setup

### 1) Configure `next.config.ts`

This is the mandatory setup. The plugin call in `next.config.ts` is what enables YAML loading and manifest generation.

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withNextIntlYaml from "next-intl-yaml";

const nextConfig: NextConfig = {
  // regular Next.js config...

  nextIntlYaml: {
    globSource: "src/**/locales/*.yaml",
    manifestOutputPath: "src/i18n/locales-manifest.ts",
    relativeImportPathAlias: "@/",
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(withNextIntlYaml(nextConfig));
```

### 2) Use generated messages in `next-intl` request config

```ts
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { localeYamlMessages } from "@/i18n/locales-manifest";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: localeYamlMessages[locale] ?? {},
  };
});