/** Register a custom element once. Lovelace may import this module more than once. */
export function defineElement(
  name: string,
  ctor: CustomElementConstructor,
): void {
  if (customElements.get(name)) return;
  try {
    customElements.define(name, ctor);
  } catch (err) {
    if (
      err instanceof DOMException &&
      (err.name === "NotSupportedError" || err.name === "NotAllowedError")
    ) {
      return;
    }
    throw err;
  }
}
