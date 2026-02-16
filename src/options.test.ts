import { describe, expect, it } from "vitest";
import { resolveNextIntlYamlOptions } from "@/options";

describe("resolveNextIntlYamlOptions", () => {
  it("returns defaults when options are omitted", () => {
    expect(resolveNextIntlYamlOptions()).toEqual({
      globSource: "src/**/locales/*.yaml",
      manifestOutputPath: "src/i18n/locales-manifest.ts",
      relativeImportPathAlias: "",
    });
  });

  it("overrides defaults with provided values", () => {
    expect(
      resolveNextIntlYamlOptions({
        globSource: "src/features/**/messages/*.yaml",
        manifestOutputPath: "src/generated/messages.ts",
        relativeImportPathAlias: "@/",
      }),
    ).toEqual({
      globSource: "src/features/**/messages/*.yaml",
      manifestOutputPath: "src/generated/messages.ts",
      relativeImportPathAlias: "@/",
    });
  });
});
