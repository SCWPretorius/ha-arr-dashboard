import { describe, expect, it } from "vitest";
import { libraryPosterColumns, libraryPosterRowHeight } from "./library-logic";

describe("libraryPosterColumns", () => {
  it("keeps two columns on a narrow card", () => {
    expect(libraryPosterColumns(360)).to.equal(2);
    expect(libraryPosterColumns(480)).to.equal(2);
  });

  it("adds columns as the card gets wider", () => {
    const narrow = libraryPosterColumns(700);
    const tablet = libraryPosterColumns(1100);
    const desktop = libraryPosterColumns(1600);
    const wide = libraryPosterColumns(2400);
    expect(tablet).to.be.greaterThan(narrow);
    expect(desktop).to.be.greaterThan(tablet);
    expect(wide).to.be.greaterThan(desktop);
    expect(wide).to.be.greaterThan(6);
  });

  it("sizes each virtual row to the poster aspect ratio", () => {
    const width = 1600;
    const cols = libraryPosterColumns(width);
    const height = libraryPosterRowHeight(width, cols);
    expect(height).to.be.greaterThan(160);
    expect(libraryPosterRowHeight(width, cols + 2)).to.be.lessThan(height);
  });
});
