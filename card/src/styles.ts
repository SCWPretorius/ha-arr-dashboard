import { css } from "lit";

export const cardStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
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
    box-sizing: border-box;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 8px 4px 16px;
    overflow: hidden;
    background: #141414;
    color: #e5e5e5;
    border: none;
    box-shadow: none;
  }

  .header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    padding: 0 12px;
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
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    color: #e5e5e5;
    font-size: 0.78rem;
    min-height: 28px;
    cursor: default;
  }

  .chip-button {
    cursor: pointer;
  }

  .tabs {
    display: flex;
    gap: 4px;
    margin: 0 12px 8px;
    border-bottom: none;
  }

  .tab {
    padding: 8px 14px;
    border: none;
    background: transparent;
    color: #b3b3b3;
    cursor: pointer;
    border-radius: 4px;
    font: inherit;
    font-weight: 600;
    min-height: 36px;
  }

  .tab[aria-selected="true"] {
    color: #fff;
    background: rgba(255, 255, 255, 0.12);
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
    width: 100%;
    max-height: var(--arr-virtual-height, 70vh);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px 8px;
    width: 100%;
    min-width: 0;
  }

  .poster-btn {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    min-width: 0;
    border: none;
    padding: 0;
    background: transparent;
    color: var(--primary-text-color);
    cursor: pointer;
    text-align: left;
    font: inherit;
  }

  .poster-btn img {
    display: block;
    width: 100%;
    max-width: 100%;
    height: auto;
    aspect-ratio: 2 / 3;
    object-fit: cover;
    border-radius: 4px;
    background: #2a2a2a;
    transition: transform 160ms ease, filter 160ms ease;
  }

  .poster-btn:hover img,
  .poster-btn:focus-visible img {
    transform: scale(1.04);
    filter: brightness(1.08);
  }

  .poster-caption {
    display: block;
    overflow: hidden;
    margin-top: 6px;
    font-size: 0.78rem;
    font-weight: 500;
    line-height: 1.2;
    color: #d2d2d2;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .download-pane {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }

  .download-scroll {
    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
    width: 100%;
    overflow: auto;
    padding: 4px 12px 24px;
  }

  .download-grid {
    display: grid;
    width: 100%;
    box-sizing: border-box;
    grid-template-columns: repeat(var(--arr-cols, 3), minmax(0, 1fr));
    gap: 16px 10px;
  }

  .download-empty {
    padding: 12px 16px;
  }

  .queue-tile {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    position: relative;
  }

  .queue-tile.exiting {
    animation: queue-tile-exit 200ms ease forwards;
  }

  @keyframes queue-tile-exit {
    to {
      opacity: 0;
      transform: scale(0.96);
      max-height: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .queue-tile.exiting {
      animation: none;
      opacity: 0;
    }
  }

  .queue-tile-poster {
    position: relative;
    width: 100%;
    border-radius: 4px;
    overflow: hidden;
    background: #1a1a1a;
    aspect-ratio: 2 / 3;
  }

  .queue-tile-poster img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .queue-tile-poster::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.85) 0%,
      rgba(0, 0, 0, 0.15) 45%,
      transparent 70%
    );
    pointer-events: none;
  }

  .queue-tile-progress {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 4px;
    background: rgba(255, 255, 255, 0.15);
    z-index: 1;
  }

  .queue-tile-progress .progress-fill {
    background: #e50914;
  }

  .queue-tile-status {
    position: absolute;
    left: 8px;
    bottom: 10px;
    z-index: 2;
    font-size: 0.72rem;
    background: rgba(0, 0, 0, 0.65);
    color: #fff;
    border: none;
  }

  .queue-tile-overflow {
    position: absolute;
    top: 6px;
    right: 6px;
    z-index: 3;
    border: none;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    border-radius: 4px;
    width: 32px;
    height: 32px;
    line-height: 1;
    font-size: 1.1rem;
    cursor: pointer;
  }

  .queue-tile-label {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 2;
    padding: 8px 42px 22px 8px;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.78), transparent);
    pointer-events: none;
  }

  .queue-tile-title {
    margin: 0;
    font-size: 0.78rem;
    font-weight: 600;
    color: #fff;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .queue-tile-meta {
    margin: 2px 0 0;
    font-size: 0.68rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.86);
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .queue-tile-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
  }

  .tile-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 100%;
    margin: 0;
    padding: 5px 8px;
    min-height: 0;
    border-radius: 6px;
    font: inherit;
    font-size: 0.68rem;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition:
      background 0.15s ease,
      border-color 0.15s ease,
      color 0.15s ease;
  }

  .tile-action--danger {
    border: 1px solid
      color-mix(in srgb, var(--error-color) 45%, transparent);
    color: var(--arr-danger-text);
    background: color-mix(in srgb, var(--error-color) 10%, transparent);
  }

  .tile-action--danger:hover:not(:disabled) {
    background: color-mix(in srgb, var(--error-color) 18%, transparent);
    border-color: color-mix(in srgb, var(--error-color) 65%, transparent);
  }

  .tile-action--muted {
    color: color-mix(in srgb, var(--arr-danger-text) 75%, #9a9a9a);
    background: transparent;
    border-color: color-mix(in srgb, var(--error-color) 28%, transparent);
  }

  .tile-action--muted:hover:not(:disabled) {
    background: color-mix(in srgb, var(--error-color) 8%, transparent);
  }

  .layout-tablet .queue-tile-actions .tile-action {
    min-height: 0;
    font-size: 0.68rem;
    padding: 5px 8px;
  }

  .queue-tile.attention .queue-tile-poster {
    box-shadow: inset 0 0 0 2px var(--error-color);
  }

  .queue-tile.attention.warn .queue-tile-poster {
    box-shadow: inset 0 0 0 2px var(--arr-warn-ui);
  }

  .profile-radio-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 12px 0;
  }

  .profile-radio {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    min-height: 56px;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
  }

  .profile-radio.selected {
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  }

  .profile-radio-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .profile-summary {
    font-size: 0.85rem;
    color: var(--secondary-text-color);
  }

  .release-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .release-chip {
    font-size: 0.8rem;
    padding: 2px 6px;
    border-radius: 6px;
    background: color-mix(in srgb, var(--primary-color) 20%, transparent);
  }

  .best-match-pill {
    font-size: 0.75rem;
    color: var(--arr-accent-text);
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
    width: calc(100% - 24px);
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    font: inherit;
    font-size: 0.9rem;
    margin: 4px 12px 8px;
    box-sizing: border-box;
  }

  .search-field::placeholder {
    color: #8c8c8c;
  }

  .layout-tablet button.primary,
  .layout-tablet button.danger,
  .layout-tablet button.outline-danger {
    min-height: 48px;
    font-size: 1rem;
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
    flex: 1;
    gap: 16px;
    align-items: stretch;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
  }

  .main-pane {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    height: 100%;
  }

  .library-pane {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }

  .library-scroll {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    align-self: stretch;
    min-width: 0;
    min-height: 0;
    width: 100%;
    overflow: hidden;
  }

  .library-load-sentinel {
    width: 100%;
    height: 1px;
    flex: 0 0 auto;
    pointer-events: none;
  }

  .library-scroll arr-virtual-list.library-virtual {
    display: block;
    width: 100%;
    min-width: 0;
    flex: 1 1 auto;
    min-height: 0;
    max-height: none;
    height: 100%;
    overflow: auto;
  }

  .library-scroll arr-virtual-list .viewport,
  .library-scroll arr-virtual-list .window,
  .library-scroll arr-virtual-list .spacer {
    width: 100%;
    box-sizing: border-box;
  }

  .library-scroll arr-virtual-list .window {
    display: block;
    position: absolute;
  }

  .library-scroll arr-virtual-list .poster-grid {
    display: grid;
    width: 100%;
    box-sizing: border-box;
    grid-template-columns: repeat(var(--arr-cols, 3), minmax(0, 1fr));
    gap: 12px 8px;
    padding: 4px 12px 8px;
  }

  .poster-grid {
    display: grid;
    width: 100%;
    box-sizing: border-box;
    grid-template-columns: repeat(var(--arr-cols, 3), minmax(0, 1fr));
    gap: 16px 10px;
    padding: 4px 12px 32px;
  }

  .poster-grid .poster-btn {
    position: relative;
    width: 100%;
    min-width: 0;
  }

  .library-toolbar {
    justify-content: flex-end;
    gap: 8px;
  }

  .poster-grid .poster-caption {
    display: none;
  }

  .library-scroll .poster-grid .poster-caption {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 1;
    display: block;
    margin: 0;
    padding: 8px 8px 20px;
    overflow: hidden;
    color: #fff;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.2;
    white-space: nowrap;
    text-overflow: ellipsis;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.78), transparent);
    border-radius: 4px 4px 0 0;
    pointer-events: none;
  }

  .issues-pane {
    padding: 8px 12px 24px;
    overflow: auto;
    flex: 1;
    min-height: 0;
  }

  .issues-pane section {
    margin-top: 16px;
  }

  .issues-pane h3 {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 600;
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
    gap: 6px;
    margin: 0 12px 4px;
    align-items: center;
  }

  .filter-chip {
    border: none;
    background: transparent;
    color: #b3b3b3;
    border-radius: 999px;
    padding: 4px 12px;
    cursor: pointer;
    font: inherit;
    font-size: 0.85rem;
    font-weight: 600;
    min-height: 32px;
  }

  .filter-chip.active {
    background: #fff;
    color: #141414;
  }

  .sort-select {
    margin-left: auto;
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.08);
    color: #e5e5e5;
    font: inherit;
    font-size: 0.85rem;
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

  .poster-btn.small {
    flex: 0 0 148px;
    width: 148px;
    scroll-snap-align: start;
  }

  .add-pane {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
  }

  .coming-grid {
    display: grid;
    width: 100%;
    box-sizing: border-box;
    grid-template-columns: repeat(var(--arr-cols, 3), minmax(0, 1fr));
    gap: 12px 8px;
    padding: 4px 12px 16px;
  }

  .coming-grid .poster-btn.small {
    position: relative;
    flex: none;
    width: 100%;
  }

  .coming-grid .poster-caption {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    display: block;
    margin: 0;
    padding: 8px 8px 20px;
    overflow: hidden;
    color: #fff;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.2;
    white-space: nowrap;
    text-overflow: ellipsis;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.78), transparent);
    border-radius: 4px 4px 0 0;
    pointer-events: none;
  }

  .h-scroll {
    display: flex;
    gap: 8px;
    max-width: 100%;
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 4px 48px 12px 12px;
    scroll-snap-type: x proximity;
    scrollbar-width: none;
    mask-image: linear-gradient(to right, #000 0, #000 calc(100% - 56px), transparent);
  }

  .h-scroll::-webkit-scrollbar {
    display: none;
  }

  .row-section {
    min-width: 0;
    margin-bottom: 6px;
  }

  .row-section h3,
  .library-heading {
    margin: 14px 12px 8px;
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #fff;
  }

  .library-with-rail {
    display: flex;
    gap: 8px;
    min-width: 0;
    width: 100%;
  }

  .library-with-rail > .grid,
  .library-with-rail > .list-view,
  .library-with-rail > arr-virtual-list {
    flex: 1 1 auto;
    min-width: 0;
    width: 100%;
  }

  arr-virtual-list.grid {
    display: block;
  }

  .vrow {
    display: grid;
    grid-template-columns: repeat(var(--arr-cols, 6), minmax(0, 1fr));
    column-gap: 8px;
    width: 100%;
    height: var(--arr-row-h, 240px);
    box-sizing: border-box;
    padding: 0 12px 10px;
    align-items: start;
  }

  .vrow .poster-caption {
    display: none;
  }

  .az-rail {
    display: none;
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

  .lookup-grid {
    display: grid;
    width: 100%;
    box-sizing: border-box;
    grid-template-columns: repeat(var(--arr-cols, 3), minmax(0, 1fr));
    gap: 12px 8px;
    padding: 4px 12px 16px;
  }

  .lookup-card {
    position: relative;
    aspect-ratio: 2 / 3;
    overflow: hidden;
    border-radius: 4px;
    background: #2a2a2a;
  }

  .lookup-poster {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: #2a2a2a;
  }

  .lookup-title {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    margin: 0;
    padding: 8px 8px 28px;
    color: #fff;
    font-size: 0.78rem;
    font-weight: 600;
    line-height: 1.25;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.78), transparent);
    pointer-events: none;
  }

  .lookup-title > span:first-child {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  .lookup-soon {
    padding: 1px 6px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    line-height: 1.4;
    text-transform: uppercase;
  }

  .lookup-actions {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    padding: 28px 8px 8px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.82), transparent);
  }

  .lookup-actions button.primary {
    flex: 1 1 auto;
    min-height: 32px;
    padding: 4px 8px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .layout-tablet .lookup-actions button.primary {
    min-height: 32px;
    font-size: 0.75rem;
  }

  .lookup-actions .pill {
    font-size: 0.7rem;
  }

  .lookup-skeleton .skeleton-poster {
    background: linear-gradient(
      90deg,
      var(--divider-color) 25%,
      transparent 50%,
      var(--divider-color) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.2s infinite;
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

  .detail-popup-backdrop.sheet-backdrop {
    align-items: center;
    padding: 16px;
  }

  .detail-popup.sheet-panel {
    width: min(440px, 100%);
    max-height: min(88vh, 760px);
    overflow: auto;
    padding: 16px 16px 20px;
    border-radius: 12px;
  }

  .detail-popup h2 {
    margin: 4px 0 12px;
    font-size: 1.2rem;
    line-height: 1.25;
  }

  .detail-popup .detail-poster {
    float: none;
    display: block;
    width: 140px;
    max-width: 46%;
    height: auto;
    margin: 0 0 12px;
  }

  .detail-popup .detail-actions {
    flex-direction: column;
  }

  .detail-popup .detail-actions button,
  .layout-tablet .detail-popup .detail-actions button.primary {
    width: 100%;
    min-height: 40px;
  }

  .queue-menu.sheet-panel {
    width: max-content;
    max-width: min(360px, calc(100vw - 32px));
    padding: 14px 14px 12px;
  }

  .queue-menu h2 {
    margin: 0 0 10px;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.3;
  }

  .queue-menu-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .queue-menu-actions button.queue-menu-btn,
  .layout-tablet .queue-menu-actions button.queue-menu-btn {
    min-height: 32px;
    padding: 4px 12px;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.06);
    color: #e5e5e5;
    font: inherit;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
  }

  .queue-menu-actions button.queue-menu-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
  }

  .queue-menu-actions button.text {
    min-height: 32px;
    padding: 4px 8px;
    font-size: 0.82rem;
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