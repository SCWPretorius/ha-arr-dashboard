import { FAILURE_VERBS } from "./spec-copy";

let _lastToastAt = 0;

export function showToast(
  el: HTMLElement,
  message: string,
  actionText?: string,
  onAction?: () => void,
): void {
  const now = Date.now();
  _lastToastAt = now;
  el.dispatchEvent(
    new CustomEvent("hass-notification", {
      bubbles: true,
      composed: true,
      detail: {
        message,
        duration: actionText ? 8000 : 4000,
        action: actionText
          ? {
              text: actionText,
              action: () => {
                if (onAction) onAction();
              },
            }
          : undefined,
      },
    }),
  );
}

export function showActionFailure(
  el: HTMLElement,
  command: string,
  err: unknown,
): void {
  const verb = FAILURE_VERBS[command] ?? "complete the action";
  const message = err instanceof Error ? err.message : String(err);
  showToast(el, `Couldn't ${verb}. Radarr said: ${message}`, "Details");
}