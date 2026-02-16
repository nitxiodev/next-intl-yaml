import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import withNextIntlYaml from "@/index";

function withTempDir(run: (tempDir: string) => void): void {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "next-intl-yaml-int-"));
  const previousCwd = process.cwd();

  try {
    process.chdir(tempDir);
    run(tempDir);
  } finally {
    process.chdir(previousCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

describe("withNextIntlYaml integration", () => {
  it("generates the locales manifest with expected output", () => {
    withTempDir((tempDir) => {
      const fixtures = [
        "src/home/locales/hero.en.yaml",
        "src/checkout/locales/summary.en.yaml",
      ];

      for (const fixture of fixtures) {
        const absolutePath = path.join(tempDir, fixture);
        fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
        fs.writeFileSync(absolutePath, "title: hello\n", "utf8");
      }

      const config = withNextIntlYaml({
        reactStrictMode: true,
        nextIntlYaml: {
          globSource: "src/**/locales/*.yaml",
          manifestOutputPath: "src/generated/locales-manifest.ts",
        },
      });

      expect(config.reactStrictMode).toBe(true);
      expect(config).not.toHaveProperty("nextIntlYaml");
      expect(config.turbopack?.rules).toMatchObject({
        "*.yaml": { loaders: ["yaml-loader"], as: "*.js" },
      });

      const manifestPath = path.join(
        tempDir,
        "src/generated/locales-manifest.ts",
      );
      expect(fs.existsSync(manifestPath)).toBe(true);

      const generated = fs.readFileSync(manifestPath, "utf8");

      expect(generated).toContain(
        'import m0 from "../checkout/locales/summary.en.yaml";',
      );
      expect(generated).toContain(
        'import m1 from "../home/locales/hero.en.yaml";',
      );
      expect(generated).toContain("export const localeYamlMessages = {");
      expect(generated).toContain('"en": {');
      expect(generated).toContain('"Summary": m0');
      expect(generated).toContain('"Hero": m1');
    });
  });

  it("generates aliased imports and injects webpack yaml rule", () => {
    withTempDir((tempDir) => {
      const fixture = "src/profile/locales/avatar.en.yaml";
      const absolutePath = path.join(tempDir, fixture);

      fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
      fs.writeFileSync(absolutePath, "label: avatar\n", "utf8");

      const config = withNextIntlYaml({
        nextIntlYaml: {
          globSource: "src/**/locales/*.yaml",
          manifestOutputPath: "src/generated/locales-manifest.ts",
          relativeImportPathAlias: "@/",
        },
      });

      const webpackContext = {} as Parameters<
        NonNullable<typeof config.webpack>
      >[1];
      const webpackOutput = config.webpack?.(
        { module: { rules: [{ test: /\.txt$/ }] } },
        webpackContext,
      ) as { module: { rules: Array<{ test: RegExp; use?: string }> } };

      expect(webpackOutput.module.rules).toHaveLength(2);
      expect(webpackOutput.module.rules[0]).toEqual({ test: /\.txt$/ });
      expect(webpackOutput.module.rules[1]).toEqual({
        test: /\.ya?ml$/,
        use: "yaml-loader",
      });

      const manifestPath = path.join(
        tempDir,
        "src/generated/locales-manifest.ts",
      );
      const generated = fs.readFileSync(manifestPath, "utf8");

      expect(generated).toContain(
        'import m0 from "@/profile/locales/avatar.en.yaml";',
      );
      expect(generated).toContain('"Avatar": m0');
    });
  });
});
