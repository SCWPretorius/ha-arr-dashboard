import { describe, expect, it } from "vitest";

import { preferredSearchEpisode } from "./app-profile";

describe("preferredSearchEpisode", () => {
  it("skips unaired specials when a regular episode is missing", () => {
    const picked = preferredSearchEpisode([
      { id: 1, seasonNumber: 0, episodeNumber: 1, hasFile: false },
      { id: 2, seasonNumber: 1, episodeNumber: 1, hasFile: true },
      { id: 3, seasonNumber: 1, episodeNumber: 2, hasFile: false },
    ]);
    expect(picked?.id).to.equal(3);
  });

  it("falls back to a special when the series has no regular episodes", () => {
    const picked = preferredSearchEpisode([
      { id: 9, seasonNumber: 0, episodeNumber: 1, hasFile: false },
    ]);
    expect(picked?.id).to.equal(9);
  });
});
