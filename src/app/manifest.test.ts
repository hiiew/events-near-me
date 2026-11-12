import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import manifest from "./manifest";

const m = manifest();
const publicFile = (src: string) => readFileSync(new URL(`../../public${src}`, import.meta.url));

/** Width and height are stored in a PNG's header (bytes 16–23, big-endian). */
function pngSize(file: Buffer): string {
  return `${file.readUInt32BE(16)}x${file.readUInt32BE(20)}`;
}

describe("FR-33 web app manifest", () => {
  it("has what browsers need to offer installation", () => {
    expect(m.name).toBeTruthy();
    expect(m.short_name).toBe("Happening");
    expect(m.start_url).toBe("/");
    expect(m.display).toBe("standalone");
  });

  it("uses the Night Map dark background from globals.css (ui-ux.md §4)", () => {
    const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8");
    const darkBg = /prefers-color-scheme: dark[\s\S]*?--bg:\s*(#[0-9a-f]{6})/i.exec(css)?.[1];
    expect(m.background_color).toBe(darkBg);
    expect(m.theme_color).toBe(darkBg);
  });

  it("has 192 px and 512 px icons plus a maskable one", () => {
    const icons = m.icons ?? [];
    expect(icons.some((i) => i.sizes === "192x192" && i.purpose === "any")).toBe(true);
    expect(icons.some((i) => i.sizes === "512x512" && i.purpose === "any")).toBe(true);
    expect(icons.some((i) => i.purpose === "maskable")).toBe(true);
  });

  it("points to icon files that exist and really have the declared size", () => {
    for (const icon of m.icons ?? []) {
      expect(pngSize(publicFile(icon.src))).toBe(icon.sizes);
    }
  });

  it("has an iOS home-screen icon of 180 px", () => {
    const apple = readFileSync(new URL("./apple-icon.png", import.meta.url));
    expect(pngSize(apple)).toBe("180x180");
  });
});
