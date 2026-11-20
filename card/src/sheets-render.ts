import { html, nothing } from "lit";
import type { TemplateResult } from "lit";
import { formatBytes } from "./format";
import { profileSummaryLine } from "./profile-summary";
import type { ArrCardConfig } from "./types";
import type { DiskItem, HealthItem, QualityProfile, RootFolder } from "./ws";

export function renderIssuesPanel(
  health: HealthItem[],
  disks: DiskItem[],
  config: ArrCardConfig,
  offline: boolean,
): TemplateResult {
  const issueCount = health.filter(
    (h) => h.type === "warning" || h.type === "error",
  ).length;
  const intro = offline
    ? "Can't reach Radarr right now."
    : issueCount > 0
      ? `Radarr reports ${issueCount} issue(s). Fix them in Radarr's settings.`
      : "Everything looks good.";
  const link = config.external_link;
  return html`
    <div class="issues-pane" data-screen="I01">
      <p class="hint-muted">${intro}</p>
      <section>
        <h3>Health</h3>
        ${health.length
          ? health.map(
              (h) => html`
                <p class="status-line">
                  <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
                  ${h.source ?? ""} · from Radarr — ${h.message}
                </p>
              `,
            )
          : html`<p class="hint-muted">No health warnings.</p>`}
      </section>
      <section>
        <h3>Disk space</h3>
        ${disks.length
          ? disks.map(
              (d) => html`
                <p class="status-line mono">
                  ${d.path}: ${formatBytes(d.freeSpace)} free of
                  ${formatBytes(d.totalSpace)}
                </p>
              `,
            )
          : html`<p class="hint-muted">No disk info.</p>`}
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
  `;
}

export function renderStatusSheet(
  open: boolean,
  health: HealthItem[],
  disks: DiskItem[],
  config: ArrCardConfig,
  onClose: () => void,
): TemplateResult | typeof nothing {
  if (!open) return nothing;
  const link = config.external_link;
  const issueCount = health.filter(
    (h) => h.type === "warning" || h.type === "error",
  ).length;
  const intro =
    issueCount > 0
      ? `Radarr reports ${issueCount} issue(s). Fix them in Radarr's settings.`
      : "Everything looks good.";
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
          <h2>Radarr status</h2>
          <button class="text" @click=${onClose}>Done</button>
        </div>
        <p class="hint-muted">${intro}</p>
        <section>
          <h3>Health</h3>
          ${health.length
            ? health.map(
                (h) => html`
                  <p class="status-line">
                    <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
                    ${h.source ?? ""} · from Radarr — ${h.message}
                  </p>
                `,
              )
            : html`<p class="hint-muted">No health warnings.</p>`}
        </section>
        <section>
          <h3>Disk space</h3>
          ${disks.map(
            (d) => html`
              <p class="status-line mono">
                ${d.path}: ${formatBytes(d.freeSpace)} free of
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
  layoutTablet: boolean,
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
  const screen = layoutTablet ? "A04T" : "A04";
  return html`
    <div
      class="sheet-backdrop"
      data-screen=${screen}
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
          Save to
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
        <details>
          <summary>More options</summary>
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
        </details>
        <label>
          <input
            type="checkbox"
            role="switch"
            .checked=${searchOnAdd}
            @change=${(e: Event) =>
              setSearchOnAdd((e.target as HTMLInputElement).checked)}
          />
          Start searching now
        </label>
        <p class="hint-muted">Radarr looks for a download straight away.</p>
        <label>
          <input
            type="checkbox"
            role="switch"
            .checked=${monitored}
            @change=${(e: Event) =>
              setMonitored((e.target as HTMLInputElement).checked)}
          />
          Monitor this movie
        </label>
        <p class="hint-muted">
          Radarr grabs it when it's released and upgrades it later.
        </p>
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
  movieTitle: string | undefined,
  movieYear: number | undefined,
  profiles: QualityProfile[],
  currentId: number | undefined,
  pendingId: number | undefined,
  searchAfter: boolean,
  busy: boolean,
  setSearch: (v: boolean) => void,
  onSelect: (id: number) => void,
  onSave: () => void,
  onClose: () => void,
): TemplateResult | typeof nothing {
  if (!open) return nothing;
  const current = profiles.find((p) => p.id === currentId);
  const changed = pendingId !== undefined && pendingId !== currentId;
  return html`
    <div
      class="sheet-backdrop"
      data-screen="M08"
      @click=${(e: Event) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div class="sheet-panel quality-sheet" role="dialog">
        <h2>Change quality profile</h2>
        <p class="hint-muted">
          ${movieTitle ?? "Movie"}${movieYear ? ` (${movieYear})` : ""} · now
          ${current?.name ?? "—"}
        </p>
        <label>
          <input
            type="checkbox"
            .checked=${searchAfter}
            @change=${(e: Event) =>
              setSearch((e.target as HTMLInputElement).checked)}
          />
          Search for a matching release now
        </label>
        <p class="hint-muted">
          Your current file stays until a better one is imported.
        </p>
        <div class="profile-radio-list" role="radiogroup">
          ${profiles.map(
            (p) => html`
              <label class="profile-radio ${p.id === pendingId ? "selected" : ""}">
                <input
                  type="radio"
                  name="quality-profile"
                  .checked=${p.id === pendingId}
                  @change=${() => onSelect(p.id)}
                />
                <span class="profile-radio-body">
                  <span class="profile-name"
                    >${p.name}
                    ${p.id === currentId ? html` · current` : nothing}</span
                  >
                  <span class="profile-summary">${profileSummaryLine(p)}</span>
                </span>
              </label>
            `,
          )}
        </div>
        <div class="dialog-actions">
          <button class="text" @click=${onClose}>Cancel</button>
          <button
            class="primary"
            ?disabled=${!changed || busy}
            @click=${onSave}
          >
            ${busy ? "Saving…" : "Save profile"}
          </button>
        </div>
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