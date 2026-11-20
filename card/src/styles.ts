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

  .arr-virtual-host {
    display: block;
    overflow: auto;
    max-height: var(--arr-virtual-height, 520px);
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

  .layout-body {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .main-pane {
    flex: 1;
    min-width: 0;
  }

  .with-side-panel .main-pane {
    flex: 1 1 55%;
  }

  .side-panel {
    flex: 0 0 40%;
    max-width: 420px;
    border-left: 1px solid var(--divider-color);
    padding-left: 16px;
    max-height: 70vh;
    overflow: auto;
  }

  .compact ha-card {
    padding: 10px;
  }

  .compact .header .title-row {
    font-size: 1rem;
  }

  .mono {
    font-family: var(--code-font-family, monospace);
    font-size: 0.85rem;
  }

  .progress-bar {
    height: 8px;
    background: var(--divider-color);
    border-radius: 4px;
    overflow: hidden;
    margin: 8px 0;
  }

  .progress-fill {
    height: 100%;
    background: var(--primary-color);
    transition: width 0.3s ease;
  }

  .queue-main {
    flex: 1;
    min-width: 0;
  }

  .queue-meta {
    color: var(--secondary-text-color);
    font-size: 0.85rem;
  }

  .queue-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }

  .overflow-btn {
    align-self: flex-start;
    font-size: 1.25rem;
  }

  .pill.ok {
    color: var(--arr-ok-text);
    background: color-mix(in srgb, var(--success-color) 12%, transparent);
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
    align-items: center;
  }

  .filter-chip {
    border: 1px solid var(--divider-color);
    background: var(--card-background-color);
    border-radius: 16px;
    padding: 6px 12px;
    cursor: pointer;
    font: inherit;
    min-height: 36px;
  }

  .filter-chip.active {
    border-color: var(--primary-color);
    color: var(--arr-accent-text);
  }

  .sort-select {
    margin-left: auto;
    padding: 6px;
    font: inherit;
  }

  .list-view {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .list-row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    border: none;
    background: transparent;
    padding: 8px;
    cursor: pointer;
    text-align: left;
    font: inherit;
    border-bottom: 1px solid var(--divider-color);
  }

  .list-row.selected {
    background: color-mix(in srgb, var(--primary-color) 8%, transparent);
  }

  .list-row .thumb {
    width: 40px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
  }

  .poster-btn.small img {
    width: 80px;
  }

  .h-scroll {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 8px;
  }

  .row-section h3 {
    margin: 8px 0;
    font-size: 1rem;
  }

  .library-with-rail {
    display: flex;
    gap: 8px;
  }

  .az-rail {
    display: flex;
    flex-direction: column;
    font-size: 0.7rem;
    color: var(--secondary-text-color);
    padding: 4px;
    user-select: none;
  }

  .skeleton-block,
  .skeleton-list {
    min-height: 120px;
    background: linear-gradient(
      90deg,
      var(--divider-color) 25%,
      transparent 50%,
      var(--divider-color) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.2s infinite;
    border-radius: 4px;
    margin: 12px 0;
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  .lookup-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 10px 0;
    border-bottom: 1px solid var(--divider-color);
  }

  .sheet-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 10;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .layout-tablet .sheet-backdrop {
    align-items: center;
  }

  .sheet-panel {
    width: min(520px, 100%);
    max-height: 85vh;
    overflow: auto;
    background: var(--card-background-color);
    padding: 20px;
    border-radius: 12px 12px 0 0;
    box-shadow: var(--ha-card-box-shadow, 0 -4px 24px rgba(0, 0, 0, 0.2));
  }

  .layout-tablet .sheet-panel {
    border-radius: 12px;
  }

  .sheet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .status-line {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    margin: 8px 0;
  }

  .link-button {
    display: inline-block;
    text-decoration: none;
    text-align: center;
    margin-top: 12px;
  }

  .detail-dialog,
  .release-dialog {
    border: none;
    border-radius: 8px;
    padding: 16px;
    max-width: min(640px, 95vw);
    background: var(--card-background-color);
    color: var(--primary-text-color);
    box-shadow: var(--ha-card-box-shadow, 0 4px 24px rgba(0, 0, 0, 0.2));
    margin-top: 12px;
  }

  .detail-poster {
    max-width: 160px;
    border-radius: 4px;
    float: left;
    margin: 0 12px 12px 0;
  }

  .detail-dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px 12px;
    font-size: 0.9rem;
  }

  .detail-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 12px 0;
  }

  .overview {
    clear: both;
    color: var(--secondary-text-color);
    font-size: 0.9rem;
  }

  .release-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--divider-color);
  }

  .release-row.rejected {
    opacity: 0.85;
  }

  .error-text {
    color: var(--error-color);
  }

  .danger-icon {
    margin-bottom: 8px;
  }
`;