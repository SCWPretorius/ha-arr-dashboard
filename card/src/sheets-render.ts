import { html, nothing } from "lit";
import type { TemplateResult } from "lit";
import { formatBytes } from "./format";
import type { ArrCardConfig } from "./types";
import type { DiskItem, HealthItem, QualityProfile, RootFolder } from "./ws";

export function renderStatusSheet(
  open: boolean,
  health: HealthItem[],
  disks: DiskItem[],
  config: ArrCardConfig,
  onClose: () => void,
): TemplateResult | typeof nothing {
  if (!open) return nothing;
  const link = config.external_link;
  return html`
    <div
      class="sheet-backdrop"
      data-screen="G02"
      @click=${(e: Event) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div class="sheet-panel" role="dialog" aria-label="Radarr status">
        <div class="sheet-header">
          <h2>Status</h2>
          <button class="text" @click=${onClose}>Close</button>
        </div>
        <section>
          <h3>Health</h3>
          ${health.length
            ? health.map(
                (h) => html`
                  <p class="status-line">
                    <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
                    ${h.message}
                  </p>
                `,
              )
            : html`<p class="hint-muted">No health warnings.</p>`}
        </section>
        <section>
          <h3>Disk</h3>
          ${disks.map(
            (d) => html`
              <p class="status-line mono">
                ${d.path}: ${formatBytes(d.freeSpace)} free /
                ${formatBytes(d.totalSpace)}
              </p>
            `,
          )}
        </section>
        ${link
          ? html`
              <a
                class="primary link-button"
                href=${String(link)}
                target="_blank"
                rel="noopener"
              >
                Open Radarr
              </a>
            `
          : nothing}
      </div>
    </div>
  `;
}

export function renderFailureSheet(
  title: string,
  detail: string,
  onClose: () => void,
): TemplateResult | typeof nothing {
  if (!detail) return nothing;
  return html`
    <div
      class="sheet-backdrop"
      data-screen="G05"
      @click=${(e: Event) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div class="sheet-panel" role="dialog" aria-label="Failure details">
        <h2>${title}</h2>
        <p class="mono">${detail}</p>
        <button class="primary" @click=${onClose}>Close</button>
      </div>
    </div>
  `;
}

export function renderAddSheet(
  open: boolean,
  pick: Record<string, unknown> | undefined,
  profiles: QualityProfile[],
  roots: RootFolder[],
  profileId: number | undefined,
  rootPath: string | undefined,
  searchOnAdd: boolean,
  monitored: boolean,
  minAvailability: string,
  busy: boolean,
  offline: boolean,
  setProfile: (id: number) => void,
  setRoot: (path: string) => void,
  setSearchOnAdd: (v: boolean) => void,
  setMonitored: (v: boolean) => void,
  setMinAvail: (v: string) => void,
  onCancel: () => void,
  onConfirm: () => void,
): TemplateResult | typeof nothing {
  if (!open || !pick) return nothing;
  return html`
    <div
      class="sheet-backdrop"
      data-screen="A05"
      @click=${(e: Event) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div class="sheet-panel" role="dialog" aria-label="Add movie">
        <h2>Add ${pick.title as string}${pick.year ? ` (${pick.year})` : ""}</h2>
        <label>
          Quality profile
          <select
            .value=${String(profileId ?? "")}
            @change=${(e: Event) =>
              setProfile(Number((e.target as HTMLSelectElement).value))}
          >
            ${profiles.map(
              (p) => html`
                <option value=${p.id} ?selected=${p.id === profileId}>
                  ${p.name}
                </option>
              `,
            )}
          </select>
        </label>
        <label>
          Root folder
          <select
            .value=${rootPath ?? ""}
            @change=${(e: Event) =>
              setRoot((e.target as HTMLSelectElement).value)}
          >
            ${roots.map(
              (f) => html`
                <option value=${f.path} ?selected=${f.path === rootPath}>
                  ${f.path}
                </option>
              `,
            )}
          </select>
        </label>
        <label>
          Minimum availability
          <select
            .value=${minAvailability}
            @change=${(e: Event) =>
              setMinAvail((e.target as HTMLSelectElement).value)}
          >
            <option value="announced">Announced</option>
            <option value="inCinemas">In cinemas</option>
            <option value="released">Released</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            role="switch"
            .checked=${searchOnAdd}
            @change=${(e: Event) =>
              setSearchOnAdd((e.target as HTMLInputElement).checked)}
          />
          Search for download after adding
        </label>
        <label>
          <input
            type="checkbox"
            role="switch"
            .checked=${monitored}
            @change=${(e: Event) =>
              setMonitored((e.target as HTMLInputElement).checked)}
          />
          Monitored
        </label>
        <div class="dialog-actions">
          <button class="text" @click=${onCancel}>Cancel</button>
          <button
            class="primary"
            data-action="add-movie"
            ?disabled=${offline || busy}
            @click=${onConfirm}
          >
            ${busy ? "Adding…" : "Add movie"}
          </button>
        </div>
      </div>
    </div>
  `;
}

export function renderQualitySheet(
  open: boolean,
  profiles: QualityProfile[],
  currentId: number | undefined,
  searchAfter: boolean,
  setSearch: (v: boolean) => void,
  onPick: (id: number) => void,
  onClose: () => void,
): TemplateResult | typeof nothing {
  if (!open) return nothing;
  return html`
    <div
      class="sheet-backdrop"
      data-screen="M08"
      @click=${(e: Event) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div class="sheet-panel" role="dialog" aria-label="Quality profile">
        <h2>Quality profile</h2>
        <label>
          <input
            type="checkbox"
            .checked=${searchAfter}
            @change=${(e: Event) =>
              setSearch((e.target as HTMLInputElement).checked)}
          />
          Search after changing profile
        </label>
        ${profiles.map(
          (p) => html`
            <button
              class="list-row ${p.id === currentId ? "selected" : ""}"
              @click=${() => onPick(p.id)}
            >
              ${p.name}
              ${p.id === currentId
                ? html`<ha-icon icon="mdi:check"></ha-icon>`
                : nothing}
            </button>
          `,
        )}
      </div>
    </div>
  `;
}

export function renderQueueOverflowSheet(
  open: boolean,
  title: string,
  year: number | undefined,
  hideDestructive: boolean,
  offline: boolean,
  onClose: () => void,
  onRemove: () => void,
  onBlocklist: () => void,
): TemplateResult | typeof nothing {
  if (!open) return nothing;
  return html`
    <div
      class="sheet-backdrop"
      data-screen="D03"
      @click=${(e: Event) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div class="sheet-panel" role="dialog" aria-label="Download actions">
        <h2>${title}${year ? ` (${year})` : ""}</h2>
        ${hideDestructive
          ? html`<p class="hint-muted">
              Removing is turned off on this dashboard.
            </p>`
          : html`
              <button
                class="outline-danger"
                data-action="queue-remove"
                ?disabled=${offline}
                @click=${onRemove}
              >
                Remove download
              </button>
              <button
                class="outline-danger"
                ?disabled=${offline}
                @click=${onBlocklist}
              >
                Remove & blocklist
              </button>
            `}
        <button class="text" @click=${onClose}>Close</button>
      </div>
    </div>
  `;
}