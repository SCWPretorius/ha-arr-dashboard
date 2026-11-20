/** Register a custom element once. Lovelace loads this module from two URLs. */
export function defineElement(
  name: string,
  ctor: CustomElementConstructor,
): void {
  if (customElements.get(name)) return;
  customElements.define(name, ctor);
}
