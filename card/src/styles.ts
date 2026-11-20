import { css } from "lit";

export const cardStyles = css`
  :host {
    display: block;
    --arr-accent-text: color-mix(
      in srgb,
      var(--primary-color) 70%,
      var(--primary-text-color)
    );
    --arr-accent-fill: color-mix(in srgb, var(--primary-color) 80%, black);
    --arr-danger-fill: color-mix(in srgb, var(--error-color) 80%, black);
    --arr-danger-text: color-mix(
      in srgb,
      var(--error-color) 85%,
      var(--primary-text-color)
    );
    --arr-warn-text: color-mix(
      in srgb,
      var(--warning-color) 75%,
      var(--primary-text-color)
    );
    --arr-warn-ui: color-mix(
      in srgb,
      var(--warning-color) 65%,
      var(--primary-text-color)
    );
    --arr-ok-text: color-mix(
      in srgb,
      var(--success-color) 70%,
      var(--primary-text-color)
    );
  }

  ha-card {
    padding: 16px;
    overflow: hidden;
  }

  .header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.25rem;
    font-weight: 500;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-left: auto;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 16px;
    background: var(--card-background-color);
    border: 1px solid var(--divider-color);
    font-size: 0.85rem;
    min-height: 32px;
    cursor: default;
  }

  .chip-button {
    cursor: pointer;
  }

  .tabs {
    display: flex;
    gap: 4px;
    border-bottom: 1px solid var(--divider-color);
    margin-bottom: 12px;
  }

  .tab {
    padding: 12px 16px;
    border: none;
    background: transparent;
    color: var(--secondary-text-color);
    cursor: pointer;
    border-bottom: 3px solid transparent;
    font: inherit;
    min-height: 48px;
  }

  .tab[aria-selected="true"] {
    color: var(--arr-accent-text);
    border-bottom-color: var(--primary-color);
  }

  .badge {
    margin-left: 6px;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 0.75rem;
    background: var(--arr-accent-fill);
    color: #fff;
  }

  .badge.warn {
    background: var(--arr-warn-ui);
  }

  .badge.error {
    background: var(--error-color);
  }

  button.primary {
    background: var(--arr-accent-fill);
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    min-height: 48px;
  }

  button.danger {
    background: var(--arr-danger-fill);
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    min-height: 48px;
  }

  button.outline-danger {
    border: 1px solid var(--arr-danger-text);
    color: var(--arr-danger-text);
    background: transparent;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    min-height: 48px;
  }

  button.text {
    border: none;
    background: transparent;
    color: var(--arr-accent-text);
    cursor: pointer;
    padding: 8px;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button:focus-visible,
  .tab:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  .banner {
    padding: 12px;
    margin-bottom: 12px;
    background: color-mix(in srgb, var(--error-color) 15%, var(--card-background-color));
    border-radius: 4px;
    color: var(--primary-text-color);
  }

  .offline-dim {
    opacity: 0.55;
    filter: grayscale(0.8);
    pointer-events: none;
  }

  .hint-muted {
    color: var(--secondary-text-color);
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
    gap: 12px;
  }

  .poster-btn {
    border: none;
    padding: 0;
    background: transparent;
    cursor: pointer;
    text-align: left;
  }

  .poster-btn img {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
    border-radius: 4px;
    background: var(--divider-color);
  }

  .queue-row {
    display: flex;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--divider-color);
    position: relative;
  }

  .queue-row.attention::before {
    content: "";
    position: absolute;
    left: -16px;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--error-color);
  }

  .queue-row.attention.warn::before {
    background: var(--arr-warn-ui);
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.85rem;
  }

  .pill.failed {
    color: var(--arr-danger-text);
    background: color-mix(in srgb, var(--error-color) 15%, transparent);
  }

  .search-field {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--divider-color);
    border-radius: 4px;
    font: inherit;
    margin-bottom: 12px;
    box-sizing: border-box;
  }

  .layout-tablet .tab {
    min-height: 60px;
    font-size: 17px;
  }

  .layout-tablet button {
    min-height: 56px;
    font-size: 17px;
  }

  .compact .chips .chip:not(.health) {
    display: none;
  }

  dialog {
    border: none;
    border-radius: 8px;
    padding: 24px;
    max-width: min(520px, 90vw);
    background: var(--card-background-color);
    color: var(--primary-text-color);
    box-shadow: var(--ha-card-box-shadow, 0 4px 24px rgba(0, 0, 0, 0.2));
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.4);
  }

  .dialog-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    gap: 12px;
  }

  .live-region {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
`;