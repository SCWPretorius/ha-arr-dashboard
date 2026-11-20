import { describe, expect, it } from "vitest";
import { profileSummaryLine } from "./profile-summary";

describe("profileSummaryLine M08", () => {
  it("formats single-quality profiles", () => {
    expect(
      profileSummaryLine({
        id: 1,
        name: "HD",
        items: [{ quality: { name: "1080p" } }],
      }),
    ).to.equal("1080p only");
  });

  it("formats range with cutoff", () => {
    expect(
      profileSummaryLine({
        id: 2,
        name: "Ultra",
        items: [
          { quality: { name: "720p" } },
          { quality: { name: "1080p" } },
          { quality: { name: "2160p" } },
        ],
        cutoff: { name: "1080p" },
      }),
    ).to.equal("720p–2160p · upgrades until 1080p");
  });
});