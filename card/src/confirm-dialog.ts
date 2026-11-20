import { html, nothing, type TemplateResult } from "lit";
import type { ConfirmState } from "./types";

function formatSize(bytes?: number): string {
  if (!bytes) return "";
  const gb = bytes / 1e9;
  return `${gb.toFixed(1)} GB`;
}

function confirmScreenId(
  kind: NonNullable<ConfirmState["kind"]>,
  layoutTablet: boolean,
): string {
  switch (kind) {
    case "m06":
      return "M06";
    case "m09":
      return layoutTablet ? "M09T" : "M09";
    case "m10":
      return "M10";
    case "d04":
      return "D04";
    case "d04b":
      return "D04b";
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function renderConfirmDialog(
  confirm: ConfirmState | null,
  busy: boolean,
  layoutTablet: boolean,
  onCancel: () => void,
  onConfirm: () => void,
  setDeleteFiles: (v: boolean) => void,
  setBlockRelease: (v: boolean) => void,
  setSearchAgain: (v: boolean) => void,
  setRemoveFromClient: (v: boolean) => void,
  setAddImportExclusion: (v: boolean) => void,
) {
  if (!confirm?.kind) return nothing;

  const p = confirm.payload;
  const title = p.title as string;
  const year = p.year as number | undefined;
  const quality = p.quality as string | undefined;
  const size = p.size as number | undefined;

  let heading = "";
  let body: TemplateResult | string = "";
  let actionLabel = "Confirm";
  let danger = true;
  let options: TemplateResult | typeof nothing = nothing;

  switch (confirm.kind) {
    case "m09":
      heading = "Delete file and redownload?";
      body = html`
        <p>
          This deletes <strong>${title}${year ? ` (${year})` : ""}</strong>
          ${quality ? ` · ${quality}` : ""}
          ${size ? ` · ${formatSize(size)}` : ""} from disk. Radarr then
          searches for a new copy.
        </p>
        <p>You can't watch it until the new download finishes.</p>
      `;
      actionLabel = "Delete file & redownload";
      if (p.showBlockCheckbox) {
        options = html`
          <label>
            <input
              type="checkbox"
              .checked=${confirm.blockRelease ?? true}
              @change=${(e: Event) =>
                setBlockRelease((e.target as HTMLInputElement).checked)}
            />
            Block this release so it isn't downloaded again.
          </label>
          <p class="hint-muted">Recommended if the file was bad.</p>
        `;
      }
      break;
    case "m10":
      heading = `Remove ${title}?`;
      body = html`
        <p>
          Radarr stops tracking this movie.
          <strong>The files stay on disk</strong> unless you tick the box below.
        </p>
      `;
      actionLabel = confirm.deleteFiles
        ? "Remove movie & delete files"
        : "Remove movie";
      options = html`
        <label>
          <input
            type="checkbox"
            .checked=${confirm.deleteFiles ?? false}
            @change=${(e: Event) =>
              setDeleteFiles((e.target as HTMLInputElement).checked)}
          />
          Also delete the movie files
          ${size ? `(${formatSize(size)})` : ""}
        </label>
        <p class="hint-muted">Leave unticked to keep the files.</p>
        <label>
          <input
            type="checkbox"
            .checked=${confirm.addImportExclusion ?? false}
            @change=${(e: Event) =>
              setAddImportExclusion((e.target as HTMLInputElement).checked)}
          />
          Don't add it again from lists
        </label>
      `;
      break;
    case "d04":
      heading = "Remove and blocklist this download?";
      body = html`
        <p>
          <strong>${title}${year ? ` (${year})` : ""}</strong> is removed from
          the download client and this release is blocked so it isn't grabbed
          again.
        </p>
      `;
      actionLabel = "Remove & blocklist";
      options = html`
        <label>
          <input
            type="checkbox"
            .checked=${confirm.searchAgain ?? true}
            @change=${(e: Event) =>
              setSearchAgain((e.target as HTMLInputElement).checked)}
          />
          Search for a different release
        </label>
        <label>
          <input
            type="checkbox"
            .checked=${confirm.removeFromClient ?? true}
            @change=${(e: Event) =>
              setRemoveFromClient((e.target as HTMLInputElement).checked)}
          />
          Delete the partial download from the client
        </label>
      `;
      break;
    case "d04b":
      heading = "Remove this download?";
      body = html`
        <p>
          <strong>${title}${year ? ` (${year})` : ""}</strong> is removed from
          the queue. Radarr may grab the same release again.
        </p>
      `;
      actionLabel = "Remove download";
      options = html`
        <label>
          <input
            type="checkbox"
            .checked=${confirm.removeFromClient ?? true}
            @change=${(e: Event) =>
              setRemoveFromClient((e.target as HTMLInputElement).checked)}
          />
          Delete the partial download from the client
        </label>
      `;
      break;
    case "m06":
      heading = "Grab a rejected release?";
      body = html`
        <p>Radarr rejected this release: <strong>${p.reasons ?? ""}</strong>.</p>
        <p class="mono">${p.releaseName ?? ""} · ${formatSize(p.size as number)}</p>
      `;
      actionLabel = "Grab anyway";
      danger = false;
      break;
    default:
      return nothing;
  }

  const screen = confirmScreenId(confirm.kind!, layoutTablet);

  return html`
    <dialog
      open
      role="alertdialog"
      data-screen=${screen}
      aria-labelledby="confirm-title"
      @cancel=${(e: Event) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
    >
      <ha-icon
        icon="mdi:alert-outline"
        class="danger-icon"
        style="color: var(--error-color)"
      ></ha-icon>
      <h2 id="confirm-title">${heading}</h2>
      ${typeof body === "string" ? html`<p>${body}</p>` : body}
      ${options}
      <div class="dialog-actions">
        <button
          class="text"
          ?disabled=${busy}
          @click=${onCancel}
          autofocus
        >
          Cancel
        </button>
        <button
          class=${danger ? "danger" : "primary"}
          ?disabled=${busy}
          aria-busy=${busy ? "true" : "false"}
          @click=${onConfirm}
        >
          <ha-icon icon=${danger ? "mdi:delete-forever" : "mdi:download"}></ha-icon>
          ${busy
            ? kindBusyLabel(confirm.kind)
            : actionLabel}
        </button>
      </div>
    </dialog>
  `;
}

function kindBusyLabel(kind: ConfirmState["kind"]): string {
  switch (kind) {
    case "m09":
      return "Deleting…";
    case "m10":
      return "Removing…";
    case "d04":
    case "d04b":
      return "Removing…";
    case "m06":
      return "Sending…";
    default:
      return "Working…";
  }
}