import { describe, it, expect } from "vitest";
import { defineElement } from "./define-element";

describe("defineElement", () => {
  it("registers on a later turn when the first define is rejected", async () => {
    const name = "arr-define-retry-test";
    class RetryCard extends HTMLElement {}
    const original = customElements.define.bind(customElements);
    let calls = 0;
    customElements.define = ((
      elementName: string,
      ctor: CustomElementConstructor,
    ) => {
      calls += 1;
      if (calls === 1) {
        throw new DOMException("not ready", "NotSupportedError");
      }
      original(elementName, ctor);
    }) as typeof customElements.define;

    try {
      defineElement(name, RetryCard);
      expect(customElements.get(name)).to.equal(undefined);
      await new Promise((resolve) => queueMicrotask(resolve));
      expect(customElements.get(name)).to.equal(RetryCard);
    } finally {
      customElements.define = original;
    }
  });
});
