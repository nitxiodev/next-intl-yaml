import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { generateLocalesManifest } from "@/manifest";

function withTempDir(run: (tempDir: string) => void): void {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "next-intl-yaml-"));
  const previousCwd = process.cwd();

  try {
    process.chdir(tempDir);
    run(tempDir);
  } finally {
    process.chdir(previousCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

describe("generateLocalesManifest", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("generates a relative import manifest and ignores invalid file names", () => {
    withTempDir((tempDir) => {
      const validFiles = [
        "src/home/locales/hero.en.yaml",
        "src/home/locales/hero.es.yaml",
        "src/checkout/locales/checkout-summary.en.yaml",
      ];
      const invalidFile = "src/home/locales/invalid.yaml";

      for (const file of [...validFiles, invalidFile]) {
        const absolutePath = path.join(tempDir, file);
        fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
        fs.writeFileSync(absolutePath, "title: example\n", "utf8");
      }

      const outputPath = "src/generated/locales-manifest.ts";

      generateLocalesManifest({
        globSource: "src/**/locales/*.yaml",
        manifestOutputPath: outputPath,
      });

      const generated = fs.readFileSync(path.join(tempDir, outputPath), "utf8");

      expect(generated).toContain(
        'import m0 from "../checkout/locales/checkout-summary.en.yaml";',
      );
      expect(generated).toContain(
        'import m1 from "../home/locales/hero.en.yaml";',
      );
      expect(generated).toContain(
        'import m2 from "../home/locales/hero.es.yaml";',
      );
      expect(generated).toContain('"en": {');
      expect(generated).toContain('"es": {');
      expect(generated).toContain('"CheckoutSummary": m0');
      expect(generated).toContain('"Hero": m1');
      expect(generated).toContain('"Hero": m2');
      expect(generated).not.toContain("invalid.yaml");
    });
  });

  it("generates aliased imports when relativeImportPathAlias is provided", () => {
    withTempDir((tempDir) => {
      const sourceFile = "src/profile/locales/avatar.en.yaml";
      const outputPath = "src/i18n/locales-manifest.ts";
      const absoluteFilePath = path.join(tempDir, sourceFile);

      fs.mkdirSync(path.dirname(absoluteFilePath), { recursive: true });
      fs.writeFileSync(absoluteFilePath, "avatar: yes\n", "utf8");

      generateLocalesManifest({
        globSource: "src/**/locales/*.yaml",
        manifestOutputPath: outputPath,
        relativeImportPathAlias: "@/",
      });

      const generated = fs.readFileSync(path.join(tempDir, outputPath), "utf8");

      expect(generated).toContain(
        'import m0 from "@/profile/locales/avatar.en.yaml";',
      );
      expect(generated).toContain('"Avatar": m0');
    });
  });

  it("normalizes same-directory imports with ./ prefix", () => {
    withTempDir((tempDir) => {
      const sourceFile = "src/same/locales/title.en.yaml";
      const outputPath = "src/same/locales/locales-manifest.ts";
      const absoluteFilePath = path.join(tempDir, sourceFile);

      fs.mkdirSync(path.dirname(absoluteFilePath), { recursive: true });
      fs.writeFileSync(absoluteFilePath, "title: same\n", "utf8");

      generateLocalesManifest({
        globSource: "src/same/locales/*.yaml",
        manifestOutputPath: outputPath,
      });

      const generated = fs.readFileSync(path.join(tempDir, outputPath), "utf8");

      expect(generated).toContain('import m0 from "./title.en.yaml";');
      expect(generated).toContain('"Title": m0');
    });
  });

  it("throws a plugin error when fs throws an Error instance", () => {
    withTempDir((tempDir) => {
      const sourceFile = "src/home/locales/hero.en.yaml";
      const absoluteFilePath = path.join(tempDir, sourceFile);

      fs.mkdirSync(path.dirname(absoluteFilePath), { recursive: true });
      fs.writeFileSync(absoluteFilePath, "hero: yes\n", "utf8");

      vi.spyOn(fs, "writeFileSync").mockImplementation(() => {
        throw new Error("disk full");
      });

      expect(() =>
        generateLocalesManifest({
          globSource: "src/**/locales/*.yaml",
          manifestOutputPath: "src/generated/locales-manifest.ts",
        }),
      ).toThrow(
        "[next-intl-yaml] Failed to generate locales manifest: disk full",
      );
    });
  });

  it("throws a plugin error when fs throws a non-Error value", () => {
    withTempDir((tempDir) => {
      const sourceFile = "src/home/locales/hero.en.yaml";
      const absoluteFilePath = path.join(tempDir, sourceFile);

      fs.mkdirSync(path.dirname(absoluteFilePath), { recursive: true });
      fs.writeFileSync(absoluteFilePath, "hero: yes\n", "utf8");

      vi.spyOn(fs, "writeFileSync").mockImplementation(() => {
        throw "write failed";
      });

      expect(() =>
        generateLocalesManifest({
          globSource: "src/**/locales/*.yaml",
          manifestOutputPath: "src/generated/locales-manifest.ts",
        }),
      ).toThrow(
        "[next-intl-yaml] Failed to generate locales manifest: write failed",
      );
    });
  });
});
