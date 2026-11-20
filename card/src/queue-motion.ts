const EXIT_MS = 200;

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export async function animateQueueRowExit(
  onExitStart: () => void,
): Promise<void> {
  onExitStart();
  if (prefersReducedMotion()) return;
  await new Promise((resolve) => window.setTimeout(resolve, EXIT_MS));
}