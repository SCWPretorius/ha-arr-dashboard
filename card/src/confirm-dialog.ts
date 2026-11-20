import { html, nothing, type TemplateResult } from "lit";
import type { ConfirmState } from "./types";

export function renderConfirmDialog(
  confirm: ConfirmState | null,
  busy: boolean,
  onCancel: () => void,
  onConfirm: () => void,
  setDeleteFiles: (v: boolean) => void,
  setBlockRelease: (v: boolean) => void,
  setSearchAgain: (v: boolean) => void,
  setRemoveFromClient: (v: boolean) => void,
) {
  if (!confirm?.kind) return nothing;

  const p = confirm.payload;
  const title = p.title as string;
  const year = p.year as number | undefined;

  const titles: Record<string, string> = {
    m09: "Delete file and redownload?",
    m10: `Remove ${title}?`,
    d04: "Remove and blocklist this download?",
    d04b: "Remove this download?",
    m06: "Grab a rejected release?",
  };

  let body = "";
  let actionLabel = "Confirm";
  let danger = true;
  let options: TemplateResult | typeof nothing = nothing;

  switch (confirm.kind) {
    case "m09":
      body =
        "This deletes the movie file from disk. Radarr then searches for a new copy. You can't watch it until the new download finishes.";
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
        `;
      }
      break;
    case "m10":
      body =
        "Radarr stops tracking this movie. The files stay on disk unless you tick the box below.";
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
        </label>
        <p class="hint-muted">Leave unticked to keep the files.</p>
      `;
      break;
    case "d04":
      body = `${title}${year ? ` (${year})` : ""} is removed from the download client and this release is blocked.`;
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
      body = `${title}${year ? ` (${year})` : ""} is removed from the queue. Radarr may grab the same release again.`;
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
      body = `Radarr rejected this release: ${p.reasons ?? ""}`;
      actionLabel = "Grab anyway";
      danger = false;
      break;
    default:
      return nothing;
  }

  return html`
    <dialog
      open
      role="alertdialog"
      aria-labelledby="confirm-title"
      @cancel=${(e: Event) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
    >
      <h2 id="confirm-title">${titles[confirm.kind]}</h2>
      <p>${body}</p>
      ${options}
      <div class="dialog-actions">
        <button class="text" ?disabled=${busy} @click=${onCancel}>
          Cancel
        </button>
        <button
          class=${danger ? "danger" : "primary"}
          ?disabled=${busy}
          aria-busy=${busy ? "true" : "false"}
          @click=${onConfirm}
        >
          ${busy ? "Working…" : actionLabel}
        </button>
      </div>
    </dialog>
  `;
}