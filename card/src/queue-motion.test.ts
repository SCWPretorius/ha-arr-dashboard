import { describe, expect, it } from "vitest";
import { prefersReducedMotion } from "./queue-motion";

describe("queue-motion D06", () => {
  it("exposes prefersReducedMotion helper", () => {
    window.matchMedia = ((query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;
    expect(prefersReducedMotion()).to.equal(true);
  });
});