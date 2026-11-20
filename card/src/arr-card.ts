import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { renderConfirmDialog } from "./confirm-dialog";
import { cardStyles } from "./styles";
import type { ArrCardConfig, ConfirmState, HomeAssistant, TabId } from "./types";
import {
  callArr,
  resolveEntryId,
  type ArrState,
  type MovieSlim,
  type QueueItem,
} from "./ws";

function fireToast(el: HTMLElement, message: string, action?: string): void {
  el.dispatchEvent(
    new CustomEvent("hass-notification", {
      bubbles: true,
      composed: true,
      detail: {
        message,
        action: action ? { text: action, action: action.toLowerCase() } : undefined,
      },
    }),
  );
}

function queueNeedsAttention(item: QueueItem): boolean {
  const st = (item.status || "").toLowerCase();
  const tr = (item.trackedDownloadStatus || "").toLowerCase();
  return (
    st === "failed" ||
    tr.includes("failed") ||
    tr.includes("importpending") ||
    tr.includes("importblocked") ||
    st === "warning"
  );
}

@customElement("arr-card")
export class ArrDashboardCard extends LitElement {
  static styles = cardStyles;

  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public config!: ArrCardConfig;

  @state() private _entryId?: string;
  @state() private _state?: ArrState;
  @state() private _tab: TabId = "library";
  @state() private _configError?: string;
  @state() private _loading = true;
  @state() private _confirm: ConfirmState | null = null;
  @state() private _confirmBusy = false;
  @state() private _addQuery = "";
  @state() private _lookupResults: Record<string, unknown>[] = [];
  @state() private _selectedMovie?: MovieSlim;
  @state() private _libraryFilter = "all";
  @state() private _librarySearch = "";
  @state() private _compact = false;

  private _refreshTimer?: ReturnType<typeof setInterval>;
  private _failCount = 0;

  public setConfig(config: ArrCardConfig): void {
    if (!config.type) {
      throw new Error("Invalid configuration");
    }
    this.config = {
      title: "Movies",
      icon: "mdi:movie-open",
      tabs: ["add", "downloading", "library"],
      default_tab: "library",
      compact: "auto",
      layout: "auto",
      show_header_chips: ["disk", "queue", "health"],
      hide_destructive_actions: false,
      add_defaults: { search_on_add: true },
      ...config,
      type: config.type || "custom:arr-card",
    };
    this._tab = this.config.default_tab ?? "library";
    this._libraryFilter = this.config.library_filter ?? "all";
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 400;
      const compactCfg = this.config?.compact ?? "auto";
      this._compact =
        compactCfg === true || (compactCfg === "auto" && w < 340);
    });
    this._ro.observe(this);
  }

  protected firstUpdated(): void {
    void this._bootstrap();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._ro?.disconnect();
    if (this._refreshTimer) clearInterval(this._refreshTimer);
  }

  private _ro?: ResizeObserver;

  private async _bootstrap(): Promise<void> {
    if (!this.hass) return;
    const eid = await resolveEntryId(this.hass, this.config?.instance);
    if (!eid) {
      this._configError = `No Radarr instance called "${this.config.instance ?? ""}".`;
      this._loading = false;
      return;
    }
    this._entryId = eid;
    await this._refresh();
    this._schedulePoll();
  }

  private _schedulePoll(): void {
    if (this._refreshTimer) clearInterval(this._refreshTimer);
    const ms = this._tab === "downloading" ? 5000 : 30000;
    this._refreshTimer = setInterval(() => void this._refresh(), ms);
  }

  private async _refresh(): Promise<void> {
    if (!this._entryId || !this.hass) return;
    try {
      const data = (await callArr(
        this.hass,
        this._entryId,
        "get_state",
      )) as ArrState;
      this._state = data;
      this._failCount = 0;
      if (!data.reachable) this._failCount = 3;
    } catch {
      this._failCount += 1;
    } finally {
      this._loading = false;
    }
  }

  private get _hideDestructive(): boolean {
    return Boolean(this.config.hide_destructive_actions);
  }

  private get _offline(): boolean {
    return this._failCount >= 3 || this._state?.reachable === false;
  }

  private async _ws(command: string, data?: Record<string, unknown>) {
    if (!this._entryId || !this.hass) throw new Error("No instance");
    return callArr(this.hass, this._entryId, command, data);
  }

  private _switchTab(tab: TabId): void {
    this._tab = tab;
    this._schedulePoll();
  }

  private _filteredMovies(): MovieSlim[] {
    const movies = this._state?.movies ?? [];
    let list = [...movies];
    const q = this._librarySearch.trim().toLowerCase();
    if (q) {
      list = list.filter((m) => m.title?.toLowerCase().includes(q));
    }
    if (this._libraryFilter === "missing") {
      list = list.filter((m) => !m.hasFile);
    } else if (this._libraryFilter === "downloaded") {
      list = list.filter((m) => m.hasFile);
    }
    return list;
  }

  private _queueRecords(): QueueItem[] {
    const rec = this._state?.queue?.records ?? [];
    return [...rec].sort((a, b) => {
      const aw = queueNeedsAttention(a) ? 0 : 1;
      const bw = queueNeedsAttention(b) ? 0 : 1;
      return aw - bw;
    });
  }

  private async _doLookup(): Promise<void> {
    if (this._addQuery.length < 2 || !this.hass) return;
    const res = (await this._ws("lookup", { term: this._addQuery })) as {
      results: Record<string, unknown>[];
    };
    this._lookupResults = res.results?.slice(0, 20) ?? [];
  }

  protected render() {
    if (this._configError) {
      return html`
        <ha-card>
          <p><strong>Movies card can't start</strong></p>
          <p>${this._configError}</p>
        </ha-card>
      `;
    }

    const cfg = this.config ?? ({} as ArrCardConfig);
    const layoutTablet =
      cfg.layout === "tablet" || (cfg.layout === "auto" && !this._compact);
    const tabs = cfg.tabs ?? ["add", "downloading", "library"];
    const showTabBar = tabs.length > 1;
    const queueCount = this._state?.queue_count ?? 0;
    const failedInQueue = this._queueRecords().some(
      (r) => (r.status || "").toLowerCase() === "failed",
    );

    return html`
      <ha-card
        class="${this._compact ? "compact" : ""} ${layoutTablet
          ? "layout-tablet"
          : ""}"
      >
        <div class="header">
          <div class="title-row">
            <ha-icon icon="${this.config.icon ?? "mdi:movie-open"}"></ha-icon>
            <span>${this.config.title ?? "Movies"}</span>
          </div>
          <div class="chips">${this._renderChips()}</div>
        </div>

        ${showTabBar
          ? html`
              <div class="tabs" role="tablist" aria-label="Arr card tabs">
                ${tabs.map(
                  (t) => html`
                    <button
                      role="tab"
                      class="tab"
                      aria-selected=${this._tab === t ? "true" : "false"}
                      @click=${() => this._switchTab(t)}
                    >
                      ${t === "add"
                        ? "Add"
                        : t === "downloading"
                          ? "Downloading"
                          : "Library"}
                      ${t === "downloading" && queueCount > 0
                        ? html`
                            <span
                              class="badge ${failedInQueue
                                ? "error"
                                : "warn"}"
                              >${queueCount}</span
                            >
                          `
                        : nothing}
                    </button>
                  `,
                )}
              </div>
            `
          : nothing}

        ${this._offline
          ? html`
              <div class="banner" role="alert">
                <strong>Can't reach Radarr.</strong> Actions are off until it's
                back.
                <button class="text" @click=${() => this._refresh()}>Retry</button>
              </div>
            `
          : nothing}

        <div class="${this._offline ? "offline-dim" : ""}">
          ${this._tab === "library" ? this._renderLibrary() : nothing}
          ${this._tab === "downloading" ? this._renderDownloading() : nothing}
          ${this._tab === "add" ? this._renderAdd() : nothing}
        </div>

        ${this._selectedMovie ? this._renderDetail() : nothing}
        ${renderConfirmDialog(
          this._confirm,
          this._confirmBusy,
          () => (this._confirm = null),
          () => void this._runConfirm(),
          (v) => {
            if (this._confirm) this._confirm = { ...this._confirm, deleteFiles: v };
          },
          (v) => {
            if (this._confirm) this._confirm = { ...this._confirm, blockRelease: v };
          },
          (v) => {
            if (this._confirm) this._confirm = { ...this._confirm, searchAgain: v };
          },
          (v) => {
            if (this._confirm)
              this._confirm = { ...this._confirm, removeFromClient: v };
          },
        )}
        <div class="live-region" aria-live="polite"></div>
      </ha-card>
    `;
  }

  private _renderChips() {
    const chips = this.config.show_header_chips ?? ["disk", "queue", "health"];
    const disk = this._state?.disk_space?.[0];
    const freeGb = disk
      ? (disk.freeSpace / 1e9).toFixed(1)
      : "—";
    return html`
      ${chips.includes("disk")
        ? html`<span class="chip health"
            ><ha-icon icon="mdi:harddisk"></ha-icon>${freeGb} GB free</span
          >`
        : nothing}
      ${chips.includes("queue")
        ? html`<button
            class="chip chip-button"
            @click=${() => this._switchTab("downloading")}
          >
            <ha-icon icon="mdi:download"></ha-icon>
            ${this._state?.queue_count
              ? `${this._state.queue_count} active`
              : "Nothing downloading"}
          </button>`
        : nothing}
      ${chips.includes("health")
        ? html`<span class="chip health"
            ><ha-icon
              icon="${this._offline ? "mdi:lan-disconnect" : "mdi:heart-pulse"}"
            ></ha-icon
            >${this._offline ? "Offline" : "Healthy"}</span
          >`
        : nothing}
    `;
  }

  private _renderLibrary() {
    if (this._loading) {
      return html`<p>Loading your library…</p>`;
    }
    const movies = this._filteredMovies();
    return html`
      <input
        class="search-field"
        placeholder="Search your library"
        aria-label="Search your library"
        .value=${this._librarySearch}
        @input=${(e: Event) =>
          (this._librarySearch = (e.target as HTMLInputElement).value)}
      />
      <div class="grid" role="list">
        ${movies.map(
          (m) => html`
            <button
              class="poster-btn"
              role="listitem"
              aria-label=${m.title ?? "Movie"}
              @click=${() => (this._selectedMovie = m)}
            >
              <img src=${m.posterUrl ?? ""} alt="" loading="lazy" />
              <div>${m.title} (${m.year})</div>
            </button>
          `,
        )}
      </div>
      ${!movies.length
        ? html`<p>No movies match your filters.</p>`
        : nothing}
    `;
  }

  private _renderDownloading() {
    const rows = this._queueRecords();
    if (!rows.length) {
      return html`
        <p><ha-icon icon="mdi:check-circle"></ha-icon> Nothing downloading</p>
      `;
    }
    return html`
      <div role="list">
        ${rows.map((row) => this._renderQueueRow(row))}
      </div>
    `;
  }

  private _renderQueueRow(row: QueueItem) {
    const title = row.movie?.title ?? row.title ?? "Download";
    const failed = (row.status || "").toLowerCase() === "failed";
    const importAttn = (row.trackedDownloadStatus || "")
      .toLowerCase()
      .includes("import");
  const hide = this._hideDestructive;
    return html`
      <div
        class="queue-row ${failed ? "attention" : importAttn ? "attention warn" : ""}"
        role="listitem"
      >
        <div style="flex:1">
          <strong>${title}</strong>
          <span class="pill ${failed ? "failed" : ""}"
            >${row.status ?? "Queued"}</span
          >
          <div
            role="progressbar"
            aria-label="${title} progress"
            aria-valuenow="0"
          ></div>
          <div>
            ${!hide
              ? html`
                  ${failed || row.trackedDownloadStatus === "warning"
                    ? html`<button
                        class="outline-danger"
                        data-action="remove-search-again"
                        data-qid=${row.id}
                        ?disabled=${this._offline}
                        @click=${() =>
                          void this._removeSearchAgain(row.id)}
                      >
                        Remove & search again
                      </button>`
                    : nothing}
                  ${failed
                    ? html`<button
                        class="outline-danger"
                        data-action="queue-remove"
                        data-qid=${row.id}
                        ?disabled=${this._offline}
                        @click=${() =>
                          this._openConfirm("d04b", {
                            title,
                            queue_id: row.id,
                          })}
                      >
                        Remove
                      </button>`
                    : nothing}
                `
              : html`
                  ${queueNeedsAttention(row)
                    ? html`<p class="hint-muted">
                        <ha-icon icon="mdi:information-outline"></ha-icon>
                        Removing is turned off on this dashboard.
                      </p>`
                    : nothing}
                `}
            ${importAttn && row.outputPath
              ? html`<button
                  class="primary"
                  data-action="retry-import"
                  data-qid=${row.id}
                  ?disabled=${this._offline}
                  @click=${() => void this._retryImport(row)}
                >
                  Retry import
                </button>`
              : nothing}
          </div>
        </div>
        ${!hide
          ? html`<button
              aria-label="More actions for ${title}"
              class="text"
              @click=${() =>
                this._openConfirm("d04", {
                  title,
                  year: row.movie?.year,
                  queue_id: row.id,
                })}
            >
              ⋮
            </button>`
          : nothing}
      </div>
    `;
  }

  private _renderAdd() {
    return html`
      <input
        class="search-field"
        placeholder="Search for a movie to add"
        aria-label="Search for a movie to add"
        ?disabled=${this._offline}
        .value=${this._addQuery}
        @input=${(e: Event) => {
          this._addQuery = (e.target as HTMLInputElement).value;
          void this._doLookup();
        }}
      />
      <div role="list">
        ${this._lookupResults.map(
          (r) => html`
            <div role="listitem">
              <strong>${r.title as string} (${r.year as number})</strong>
              <button
                class="primary"
                data-action="add-movie"
                ?disabled=${this._offline}
                @click=${() => void this._addFromLookup(r)}
              >
                Add movie
              </button>
            </div>
          `,
        )}
      </div>
    `;
  }

  private _renderDetail() {
    const m = this._selectedMovie;
    if (!m) return nothing;
    const hide = this._hideDestructive;
    return html`
      <dialog open>
        <button class="text" @click=${() => (this._selectedMovie = undefined)}>
          ← Back
        </button>
        <h2>${m.title} (${m.year})</h2>
        <label>
          <input
            type="checkbox"
            role="switch"
            .checked=${m.monitored ?? true}
            @change=${(e: Event) =>
              void this._setMonitored(
                m.id,
                (e.target as HTMLInputElement).checked,
              )}
          />
          Monitored
        </label>
        <button
          class="primary"
          ?disabled=${this._offline}
          @click=${() => void this._movieSearch(m.id)}
        >
          Search again
        </button>
        <button
          class="primary"
          ?disabled=${this._offline}
          @click=${() => void this._manualSearch(m.id)}
        >
          Manual search
        </button>
        ${!hide && m.hasFile
          ? html`
              <section>
                <h3>Fix or remove</h3>
                <button
                  class="outline-danger"
                  data-action="delete-redownload"
                  ?disabled=${this._offline}
                  @click=${() =>
                    this._openConfirm("m09", {
                      title: m.title,
                      movie_id: m.id,
                      showBlockCheckbox: true,
                    })}
                >
                  Delete file & redownload
                </button>
                <button
                  class="outline-danger"
                  data-action="remove-movie"
                  ?disabled=${this._offline}
                  @click=${() =>
                    this._openConfirm("m10", {
                      title: m.title,
                      movie_id: m.id,
                    })}
                >
                  Remove movie
                </button>
              </section>
            `
          : nothing}
      </dialog>
    `;
  }

  private _openConfirm(
    kind: ConfirmState["kind"],
    payload: Record<string, unknown>,
  ): void {
    this._confirm = {
      kind,
      payload,
      deleteFiles: false,
      blockRelease: true,
      searchAgain: true,
      removeFromClient: true,
    };
  }

  private async _runConfirm(): Promise<void> {
    if (!this._confirm) return;
    this._confirmBusy = true;
    const { kind, payload } = this._confirm;
    try {
      switch (kind) {
        case "m10":
          await this._ws("remove_movie", {
            movie_id: payload.movie_id,
            delete_files: this._confirm.deleteFiles ?? false,
          });
          fireToast(this, `Removed ${payload.title}.`);
          this._selectedMovie = undefined;
          break;
        case "m09":
          await this._ws("delete_file_redownload", {
            movie_id: payload.movie_id,
            block_release: this._confirm.blockRelease ?? false,
          });
          fireToast(
            this,
            `Deleted the file. Searching for a new copy of ${payload.title}…`,
          );
          break;
        case "d04":
          await this._ws("queue_remove_blocklist", {
            queue_id: payload.queue_id,
            search_again: this._confirm.searchAgain ?? true,
            remove_from_client: this._confirm.removeFromClient ?? true,
          });
          fireToast(this, `Removed ${payload.title} and blocked the release.`);
          break;
        case "d04b":
          await this._ws("queue_remove", {
            queue_id: payload.queue_id,
            remove_from_client: this._confirm.removeFromClient ?? true,
          });
          fireToast(this, `Removed ${payload.title} from downloads.`);
          break;
        default:
          break;
      }
      await this._refresh();
    } catch (err) {
      fireToast(this, `Couldn't complete action. Radarr said: ${err}`);
    } finally {
      this._confirmBusy = false;
      this._confirm = null;
    }
  }

  private async _removeSearchAgain(queueId: number): Promise<void> {
    await this._ws("queue_remove_search_again", { queue_id: queueId });
    fireToast(this, "Removed and blocked the release. Searching for another…");
    await this._refresh();
  }

  private async _retryImport(row: QueueItem): Promise<void> {
    await this._ws("retry_import", {
      output_path: row.outputPath,
      download_client_id: row.downloadId,
    });
    fireToast(this, `Retrying import for ${row.movie?.title ?? "movie"}…`);
    await this._refresh();
  }

  private async _setMonitored(movieId: number, monitored: boolean): Promise<void> {
    await this._ws("set_monitored", { movie_id: movieId, monitored });
    fireToast(
      this,
      monitored
        ? "Monitoring on."
        : "Monitoring off. Radarr won't download or upgrade it.",
    );
    await this._refresh();
  }

  private async _movieSearch(movieId: number): Promise<void> {
    await this._ws("movie_search", { movie_id: movieId });
    fireToast(this, "Searching…");
  }

  private async _manualSearch(movieId: number): Promise<void> {
    await this._ws("release_search", { movie_id: movieId });
    fireToast(this, "Searching indexers…");
  }

  private async _addFromLookup(r: Record<string, unknown>): Promise<void> {
    const profiles = this._state?.quality_profiles ?? [];
    const roots = this._state?.root_folders ?? [];
    const defaults = this.config.add_defaults ?? {};
    const profile =
      profiles.find((p) => p.name === defaults.quality_profile) ??
      profiles[0];
    const root =
      roots.find((f) => f.path === defaults.root_folder) ?? roots[0];
    await this._ws("add_movie", {
      title: r.title,
      year: r.year,
      tmdbId: r.tmdbId,
      imdbId: r.imdbId,
      quality_profile_id: profile?.id,
      root_folder_path: root?.path,
      search_on_add: defaults.search_on_add !== false,
      monitored: true,
      minimum_availability: defaults.minimum_availability ?? "released",
    });
    fireToast(this, `Added ${r.title}. Searching for a download…`);
    await this._refresh();
  }

  public getCardSize(): number {
    return this._compact ? 4 : 8;
  }
}

customElements.define(
  "arr-dashboard-card",
  class extends ArrDashboardCard {},
);

declare global {
  interface HTMLElementTagNameMap {
    "arr-card": ArrDashboardCard;
    "arr-dashboard-card": ArrDashboardCard;
  }
}

import "./editor";

(window as unknown as { customCards?: unknown[] }).customCards =
  (window as unknown as { customCards?: unknown[] }).customCards ?? [];
(window as unknown as { customCards: unknown[] }).customCards.push({
  type: "custom:arr-card",
  name: "Arr Dashboard",
  description: "Radarr library, queue, and add card",
  preview: true,
  documentationURL:
    "https://github.com/SCWPretorius/ha-arr-dashboard",
});

customElements.whenDefined("arr-dashboard-card").then(() => {
  const el = customElements.get("arr-dashboard-card");
  if (el && !customElements.get("ha-panel-arr-card")) {
    // Lovelace expects card type custom:arr-card
  }
});

export function getConfigElement() {
  return document.createElement("arr-card-editor");
}

export function getStubConfig(hass: HomeAssistant) {
  void hass;
  return { type: "custom:arr-card", instance: "" };
}