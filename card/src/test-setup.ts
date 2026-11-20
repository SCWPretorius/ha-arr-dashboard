class RO {
  observe() {}
  disconnect() {}
}
(globalThis as { ResizeObserver?: typeof RO }).ResizeObserver = RO;