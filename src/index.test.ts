import { afterEach, describe, expect, it, vi } from "vitest";
import withNextIntlYaml from "@/index";
import { generateLocalesManifest } from "@/manifest";

vi.mock("@/manifest", () => ({
  generateLocalesManifest: vi.fn(),
}));

describe("withNextIntlYaml", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("generates locales and merges webpack and turbopack rules", () => {
    const customWebpack = vi.fn((config: object) => ({
      ...config,
      customized: true,
    }));
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    const result = withNextIntlYaml({
      reactStrictMode: true,
      nextIntlYaml: {
        globSource: "src/test/locales/*.yaml",
      },
      turbopack: {
        rules: {
          "*.md": { loaders: ["raw-loader"], as: "*.js" },
        },
      },
      webpack: customWebpack,
    });

    expect(generateLocalesManifest).toHaveBeenCalledWith({
      globSource: "src/test/locales/*.yaml",
    });
    expect(infoSpy).toHaveBeenCalledWith("[next-intl-yaml] Generating locales");
    expect(result).not.toHaveProperty("nextIntlYaml");
    expect(result.reactStrictMode).toBe(true);
    expect(result.turbopack).toEqual({
      rules: {
        "*.md": { loaders: ["raw-loader"], as: "*.js" },
        "*.yaml": { loaders: ["yaml-loader"], as: "*.js" },
      },
    });

    const webpackContext = {} as Parameters<
      NonNullable<typeof result.webpack>
    >[1];
    const webpackResult = result.webpack?.(
      { module: { rules: [{ test: /\.txt$/ }] } },
      webpackContext,
    );

    expect(customWebpack).toHaveBeenCalledTimes(1);
    expect(webpackResult).toEqual({
      module: {
        rules: [
          { test: /\.txt$/ },
          {
            test: /\.ya?ml$/,
            use: "yaml-loader",
          },
        ],
      },
      customized: true,
    });

    infoSpy.mockRestore();
  });

  it("returns merged webpack config when no custom webpack exists", () => {
    const result = withNextIntlYaml({});
    const webpackContext = {} as Parameters<
      NonNullable<typeof result.webpack>
    >[1];
    const webpackResult = result.webpack?.({}, webpackContext);

    expect(webpackResult).toEqual({
      module: {
        rules: [
          {
            test: /\.ya?ml$/,
            use: "yaml-loader",
          },
        ],
      },
    });
  });
});
