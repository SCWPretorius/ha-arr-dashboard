import { describe, expect, it } from "vitest";
import { posterUrlForTile } from "./poster-url";

describe("posterUrlForTile", () => {
  it("downsizes TMDb originals to w185", () => {
    expect(
      posterUrlForTile(
        "https://image.tmdb.org/t/p/original/abc.jpg",
      ),
    ).toBe("https://image.tmdb.org/t/p/w185/abc.jpg");
  });

  it("replaces an existing TMDb size with w185", () => {
    expect(
      posterUrlForTile("https://image.tmdb.org/t/p/w500/abc.jpg"),
    ).toBe("https://image.tmdb.org/t/p/w185/abc.jpg");
  });

  it("leaves non-TMDb URLs unchanged", () => {
    const local = "/api/arr_dashboard/x/poster/1";
    expect(posterUrlForTile(local)).toBe(local);
  });
});