import { describe, expect, it } from "vitest";
import { releaseQualityName, sortReleases } from "./release-logic";
import type { ReleaseRow } from "./types";

describe("sortReleases manual search", () => {
  const rows: ReleaseRow[] = [
    { guid: "a", size: 1, age: 5, seeders: 1, approved: true },
    { guid: "b", size: 9, age: 1, seeders: 20, approved: true },
  ];

  it("preserves Radarr order for best match", () => {
    const sorted = sortReleases(rows, "match");
    expect(sorted.map((r) => r.guid)).to.eql(["a", "b"]);
  });

  it("sorts by size descending", () => {
    const sorted = sortReleases(rows, "size");
    expect(sorted[0].guid).to.equal("b");
  });
});

describe("releaseQualityName", () => {
  it("reads nested quality name", () => {
    expect(
      releaseQualityName({
        quality: { quality: { name: "BluRay-1080p" } },
      }),
    ).to.equal("BluRay-1080p");
  });
});