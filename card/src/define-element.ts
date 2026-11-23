/** Register a custom element once. Lovelace may import this module more than once. */
export function defineElement(
  name: string,
  ctor: CustomElementConstructor,
): void {
  const attempt = (): void => {
    if (customElements.get(name)) return;
    try {
      customElements.define(name, ctor);
    } catch (err) {
      if (customElements.get(name)) return;
      if (
        err instanceof DOMException &&
        (err.name === "NotSupportedError" || err.name === "NotAllowedError")
      ) {
        return;
      }
      throw err;
    }
  };

  attempt();
  // Lovelace can create the card before this module finishes defining it.
  // A failed or skipped define during that import still leaves the name free,
  // and a second attempt once the import microtask runs succeeds.
  queueMicrotask(() => {
    if (!customElements.get(name)) attempt();
  });
}
