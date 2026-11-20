import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { renderConfirmDialog } from "./confirm-dialog";
import { formatBytes, formatRelative, queueProgress, queueStatusLabel } from "./format";
import {
  filterMovies,
  inLibrary,
  indexLetters,
  recentMovies,
  sortMovies,
  upcomingMovies,
  type LibraryChip,
  type LibrarySort,
} from "./library-logic";
import {
  renderAddSheet,
  renderFailureSheet,
  renderQualitySheet,
  renderQueueOverflowSheet,
  renderStatusSheet,
} from "./sheets-render";
import {
  toastAdded,
  toastDeleteRedownload,
  toastGrab,
  toastMonitorOff,
  toastMonitorOn,
  toastProfile,
  toastRadarrBack,
  toastRemoveBlocklist,
  toastRemoveMovie,
  toastRemoveQueue,
  toastRemoveSearchAgain,
  toastRetryImport,
  toastSearchAgain,
  toastGone,
} from "./spec-copy";
import { cardStyles } from "./styles";
import { showActionFailure, showToast } from "./toast";
import type {
  AddPhase,
  ArrCardConfig,
  ConfirmState,
  HomeAssistant,
  ReleaseRow,
  TabId,
} from "./types";
import "./virtual-list";
import {
  callArr,
  resolveEntryId,
  type ArrState,
  type MovieSlim,
  type QueueItem,
} from "./ws";

const LOOKUP_DEBOUNCE_MS = 400;
const RELEASE_CACHE_MS = 5 * 60 * 1000;
const VIRTUAL_THRESHOLD = 50;

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
  @state() private _addPhase: AddPhase = "start";
  @state() private _lookupResults: Record<string, unknown>[] = [];
  @state() private _addError = "";
  @state() private _addPick?: Record<string, unknown>;
  @state() private _addSheetOpen = false;
  @state() private _addProfileId?: number;
  @state() private _addRootPath?: string;
  @state() private _addSearchOn = true;
  @state() private _addMonitored = true;
  @state() private _addMinAvail = "released";
  @state() private _addBusy = false;
  @state() private _selectedMovie?: MovieSlim;
  @state() private _detailExtra?: Record<string, unknown>;
  @state() private _libraryChip: LibraryChip = "all";
  @state() private _librarySearch = "";
  @state() private _librarySort: LibrarySort = "title";
  @state() private _libraryView: "grid" | "list" = "grid";
  @state() private _compact = false;
  @state() private _statusOpen = false;
  @state() private _failureDetail = "";
  @state() private _qualityOpen = false;
  @state() private _qualitySearch = true;
  @state() private _queueOverflow?: QueueItem;
  @state() private _showAllDownloads = false;
  @state() private _manualMovieId?: number;
  @state() private _releases: ReleaseRow[] = [];
  @state() private _showRejected = false;
  @state() private _releaseBusy = false;

  private _refreshTimer?: ReturnType<typeof setInterval>;
  private _lookupTimer?: ReturnType<typeof setTimeout>;
  private _failCount = 0;
  private _releaseCache = new Map<
    number,
    { at: number; releases: ReleaseRow[] }
  >();

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
      show_rows: [],
      upcoming_days: 14,
      recent_days: 7,
      library_view: "grid",
      library_sort: "title",
      library_filter: "all",
      external_link: false,
      ...config,
      type: config.type || "custom:arr-card",
    };
    this._tab = this.config.default_tab ?? "library";
    const lf = this.config.library_filter ?? "all";
    this._libraryChip =
      lf === "missing" || lf === "downloaded" ? lf : "all";
    this._librarySort = (this.config.library_sort as LibrarySort) ?? "title";
    this._libraryView = this.config.library_view ?? "grid";
    const ad = this.config.add_defaults ?? {};
    this._addSearchOn = ad.search_on_add !== false;
    this._addMinAvail = ad.minimum_availability ?? "released";
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
    if (this._lookupTimer) clearTimeout(this._lookupTimer);
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
      const wasOff = this._offline;
      this._state = data;
      this._failCount = 0;
      if (!data.reachable) this._failCount = 3;
      if (wasOff && !this._offline) {
        showToast(this, toastRadarrBack());
      }
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

  private get _layoutTablet(): boolean {
    const cfg = this.config ?? ({} as ArrCardConfig);
    return cfg.layout === "tablet" || (cfg.layout === "auto" && !this._compact);
  }

  private async _ws(command: string, data?: Record<string, unknown>) {
    if (!this._entryId || !this.hass) throw new Error("No instance");
    return callArr(this.hass, this._entryId, command, data);
  }

  private _switchTab(tab: TabId): void {
    this._tab = tab;
    this._schedulePoll();
  }

  private _sortedLibrary(): MovieSlim[] {
    const movies = this._state?.movies ?? [];
  const queue = this._state?.queue?.records ?? [];
    const filtered = filterMovies(
      movies,
      this._libraryChip,
      this._librarySearch,
      queue,
    );
    return sortMovies(filtered, this._librarySort);
  }

  private _queueRecords(): QueueItem[] {
    const rec = this._state?.queue?.records ?? [];
    return [...rec].sort((a, b) => {
      const aw = queueNeedsAttention(a) ? 0 : 1;
      const bw = queueNeedsAttention(b) ? 0 : 1;
      return aw - bw;
    });
  }

  private _scheduleLookup(): void {
    if (this._lookupTimer) clearTimeout(this._lookupTimer);
    const q = this._addQuery.trim();
    if (q.length < 2) {
      this._addPhase = "start";
      this._lookupResults = [];
      this._addError = "";
      return;
    }
    this._addPhase = "searching";
    this._lookupTimer = setTimeout(() => void this._doLookup(), LOOKUP_DEBOUNCE_MS);
  }

  private async _doLookup(): Promise<void> {
    const q = this._addQuery.trim();
    if (q.length < 2) return;
    try {
      const res = (await this._ws("lookup", { term: q })) as {
        results: Record<string, unknown>[];
      };
      this._lookupResults = res.results?.slice(0, 25) ?? [];
      this._addPhase = this._lookupResults.length ? "results" : "no_results";
      this._addError = "";
    } catch (err) {
      this._addPhase = "error";
      this._addError = err instanceof Error ? err.message : String(err);
    }
  }

  private _openAddSheet(hit: Record<string, unknown>): void {
    const profiles = this._state?.quality_profiles ?? [];
    const roots = this._state?.root_folders ?? [];
    const defaults = this.config.add_defaults ?? {};
    const profile =
      profiles.find((p) => p.name === defaults.quality_profile) ??
      profiles[0];
    const root =
      roots.find((f) => f.path === defaults.root_folder) ?? roots[0];
    this._addPick = hit;
    this._addProfileId = profile?.id;
    this._addRootPath = root?.path;
    this._addSearchOn = defaults.search_on_add !== false;
    this._addMonitored = true;
    this._addMinAvail = defaults.minimum_availability ?? "released";
    this._addSheetOpen = true;
    this._addPhase = "sheet";
  }

  private async _confirmAddMovie(): Promise<void> {
    if (!this._addPick) return;
    this._addBusy = true;
    try {
      const r = this._addPick;
      await this._ws("add_movie", {
        title: r.title,
        year: r.year,
        tmdbId: r.tmdbId,
        imdbId: r.imdbId,
        quality_profile_id: this._addProfileId,
        root_folder_path: this._addRootPath,
        search_on_add: this._addSearchOn,
        monitored: this._addMonitored,
        minimum_availability: this._addMinAvail,
      });
      showToast(this, toastAdded(String(r.title), this._addSearchOn));
      this._addSheetOpen = false;
      this._addPick = undefined;
      this._addPhase = "start";
      this._addQuery = "";
      this._lookupResults = [];
      await this._refresh();
    } catch (err) {
      this._fail("add_movie", err);
    } finally {
      this._addBusy = false;
    }
  }

  private async _openMovieDetail(m: MovieSlim): Promise<void> {
    this._selectedMovie = m;
    try {
      const res = (await this._ws("get_movie", { movie_id: m.id })) as {
        movie: Record<string, unknown>;
      };
      this._detailExtra = res.movie;
    } catch {
      this._detailExtra = undefined;
    }
  }

  private async _loadReleases(movieId: number, force = false): Promise<void> {
    const cached = this._releaseCache.get(movieId);
    const now = Date.now();
    if (!force && cached && now - cached.at < RELEASE_CACHE_MS) {
      this._releases = cached.releases;
      return;
    }
    this._manualMovieId = movieId;
    this._releaseBusy = true;
    try {
      const res = (await this._ws("release_search", { movie_id: movieId })) as {
        releases: ReleaseRow[];
      };
      const releases = res.releases ?? [];
      this._releaseCache.set(movieId, { at: now, releases });
      this._releases = releases;
    } catch (err) {
      this._fail("movie_search", err);
      this._releases = [];
    } finally {
      this._releaseBusy = false;
    }
  }

  protected render() {
    if (this._configError) {
      return html`
        <ha-card data-screen="G03">
          <p><strong>Movies card can't start</strong></p>
          <p>${this._configError}</p>
        </ha-card>
      `;
    }

    const cfg = this.config ?? ({} as ArrCardConfig);
    const tabs = cfg.tabs ?? ["add", "downloading", "library"];
    const showTabBar = tabs.length > 1;
    const queueCount = this._state?.queue_count ?? 0;
    const failedInQueue = this._queueRecords().some(
      (r) => (r.status || "").toLowerCase() === "failed",
    );
    const sideDetail =
      this._layoutTablet && this._selectedMovie && this._tab === "library";

    return html`
      <ha-card
        class="${this._compact ? "compact" : ""} ${this._layoutTablet
          ? "layout-tablet"
          : ""} ${sideDetail ? "with-side-panel" : ""}"
      >
        <div class="header">
          <div class="title-row">
            <ha-icon icon="${cfg.icon ?? "mdi:movie-open"}"></ha-icon>
            <span>${cfg.title ?? "Movies"}</span>
          </div>
          <div class="chips">${this._renderChips()}</div>
        </div>

        ${showTabBar ? this._renderTabs(tabs, queueCount, failedInQueue) : nothing}

        ${this._offline ? this._renderOfflineBanner() : nothing}

        <div class="${this._offline ? "offline-dim" : ""} layout-body">
          <div class="main-pane">
            ${this._tab === "library" ? this._renderLibrary() : nothing}
            ${this._tab === "downloading" ? this._renderDownloading() : nothing}
            ${this._tab === "add" ? this._renderAdd() : nothing}
          </div>
          ${sideDetail ? this._renderDetailPanel() : nothing}
        </div>

        ${!sideDetail && this._selectedMovie ? this._renderDetailDialog() : nothing}
        ${this._manualMovieId ? this._renderManualSearch() : nothing}

        ${renderStatusSheet(
          this._statusOpen,
          this._state?.health ?? [],
          this._state?.disk_space ?? [],
          cfg,
          () => (this._statusOpen = false),
        )}
        ${renderFailureSheet(
          "Failure details",
          this._failureDetail,
          () => (this._failureDetail = ""),
        )}
        ${renderAddSheet(
          this._addSheetOpen,
          this._addPick,
          this._state?.quality_profiles ?? [],
          this._state?.root_folders ?? [],
          this._addProfileId,
          this._addRootPath,
          this._addSearchOn,
          this._addMonitored,
          this._addMinAvail,
          this._addBusy,
          this._offline,
          (id) => (this._addProfileId = id),
          (path) => (this._addRootPath = path),
          (v) => (this._addSearchOn = v),
          (v) => (this._addMonitored = v),
          (v) => (this._addMinAvail = v),
          () => {
            this._addSheetOpen = false;
            this._addPhase = "results";
          },
          () => void this._confirmAddMovie(),
        )}
        ${renderQualitySheet(
          this._qualityOpen,
          this._state?.quality_profiles ?? [],
          this._selectedMovie?.qualityProfileId,
          this._qualitySearch,
          (v) => (this._qualitySearch = v),
          (id) => void this._setQualityProfile(id),
          () => (this._qualityOpen = false),
        )}
        ${this._queueOverflow
          ? renderQueueOverflowSheet(
              true,
              this._queueOverflow.movie?.title ?? this._queueOverflow.title ?? "",
              this._queueOverflow.movie?.year,
              this._hideDestructive,
              this._offline,
              () => (this._queueOverflow = undefined),
              () => {
                const row = this._queueOverflow;
                this._queueOverflow = undefined;
                if (row) {
                  this._openConfirm("d04b", {
                    title: row.movie?.title ?? row.title,
                    queue_id: row.id,
                  });
                }
              },
              () => {
                const row = this._queueOverflow;
                this._queueOverflow = undefined;
                if (row) {
                  this._openConfirm("d04", {
                    title: row.movie?.title ?? row.title,
                    year: row.movie?.year,
                    queue_id: row.id,
                  });
                }
              },
            )
          : nothing}
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
          (v) => {
            if (this._confirm)
              this._confirm = { ...this._confirm, addImportExclusion: v };
          },
        )}
        <div class="live-region" aria-live="polite"></div>
      </ha-card>
    `;
  }

  private _renderTabs(
    tabs: TabId[],
    queueCount: number,
    failedInQueue: boolean,
  ) {
    return html`
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
                    <span class="badge ${failedInQueue ? "error" : "warn"}"
                      >${queueCount}</span
                    >
                  `
                : nothing}
            </button>
          `,
        )}
      </div>
    `;
  }

  private _renderOfflineBanner() {
    const last = this._state?.last_success;
    return html`
      <div class="banner" role="alert" data-screen="G01">
        <strong>Can't reach Radarr.</strong> Actions are off until it's back.
        ${last
          ? html`<span class="hint-muted">Last OK: ${formatRelative(last)}</span>`
          : nothing}
        <button class="text" @click=${() => void this._refresh()}>Retry</button>
        <button class="text" @click=${() => (this._statusOpen = true)}>
          Status
        </button>
      </div>
    `;
  }

  private _renderChips() {
    const chips = this.config.show_header_chips ?? ["disk", "queue", "health"];
    const disk = this._state?.disk_space?.[0];
    const freeGb = disk ? (disk.freeSpace / 1e9).toFixed(1) : "—";
    const healthBad = (this._state?.health?.length ?? 0) > 0;
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
        ? html`<button
            class="chip chip-button"
            @click=${() => (this._statusOpen = true)}
          >
            <ha-icon
              icon="${this._offline
                ? "mdi:lan-disconnect"
                : healthBad
                  ? "mdi:heart-broken"
                  : "mdi:heart-pulse"}"
            ></ha-icon>
            ${this._offline ? "Offline" : healthBad ? "Issues" : "Healthy"}
          </button>`
        : nothing}
    `;
  }

  private _renderLibrary() {
    if (this._loading) {
      return html`<div data-screen="L01" class="skeleton-block"></div>`;
    }
    const cfg = this.config;
    const movies = this._sortedLibrary();
    const showRows = cfg.show_rows ?? [];
    const up = showRows.includes("upcoming")
      ? upcomingMovies(this._state?.movies ?? [], cfg.upcoming_days ?? 14)
      : [];
    const rec = showRows.includes("recent")
      ? recentMovies(this._state?.movies ?? [], cfg.recent_days ?? 7)
      : [];
    const useVirtual = movies.length > VIRTUAL_THRESHOLD;
    const letters =
      this._librarySort === "title" && this._layoutTablet
        ? indexLetters(movies)
        : [];

    return html`
      <div data-screen="L01">
        <input
          class="search-field"
          placeholder="Search your library"
          aria-label="Search your library"
          .value=${this._librarySearch}
          @input=${(e: Event) =>
            (this._librarySearch = (e.target as HTMLInputElement).value)}
        />
        <div class="chip-row" role="toolbar" aria-label="Library filters">
          ${(["all", "missing", "downloaded", "in_queue"] as LibraryChip[]).map(
            (c) => html`
              <button
                class="filter-chip ${this._libraryChip === c ? "active" : ""}"
                @click=${() => (this._libraryChip = c)}
              >
                ${c === "all"
                  ? "All"
                  : c === "missing"
                    ? "Missing"
                    : c === "downloaded"
                      ? "Downloaded"
                      : "In queue"}
              </button>
            `,
          )}
          <select
            class="sort-select"
            aria-label="Sort"
            .value=${this._librarySort}
            @change=${(e: Event) =>
              (this._librarySort = (e.target as HTMLSelectElement)
                .value as LibrarySort)}
          >
            <option value="title">Title</option>
            <option value="added">Added</option>
            <option value="year">Year</option>
          </select>
          <button
            class="filter-chip"
            aria-label="Toggle grid or list"
            @click=${() =>
              (this._libraryView =
                this._libraryView === "grid" ? "list" : "grid")}
          >
            <ha-icon
              icon=${this._libraryView === "grid"
                ? "mdi:view-grid"
                : "mdi:view-list"}
            ></ha-icon>
          </button>
        </div>

        ${up.length
          ? html`
              <section data-screen="L02" class="row-section">
                <h3>Coming soon</h3>
                <div class="h-scroll">
                  ${up.map((m) => this._libraryTile(m))}
                </div>
              </section>
            `
          : nothing}
        ${rec.length
          ? html`
              <section data-screen="L03" class="row-section">
                <h3>Recently added</h3>
                <div class="h-scroll">
                  ${rec.map((m) => this._libraryTile(m))}
                </div>
              </section>
            `
          : nothing}

        <div class="library-with-rail">
          ${useVirtual
            ? html`
                <arr-virtual-list
                  data-screen="L04"
                  .itemCount=${movies.length}
                  .itemHeight=${this._libraryView === "list" ? 64 : 140}
                  .renderItem=${(i: number) => this._libraryItem(movies[i])}
                ></arr-virtual-list>
              `
            : html`
                <div
                  data-screen="L05"
                  class="${this._libraryView === "grid" ? "grid" : "list-view"}"
                  role="list"
                >
                  ${movies.map((m) => this._libraryItem(m))}
                </div>
              `}
          ${letters.length
            ? html`
                <div class="az-rail" data-screen="L01T" aria-hidden="true">
                  ${letters.map(
                    (L) => html`
                      <span class="az-letter">${L}</span>
                    `,
                  )}
                </div>
              `
            : nothing}
        </div>
        ${!movies.length
          ? html`<p>No movies match your filters.</p>`
          : nothing}
      </div>
    `;
  }

  private _libraryTile(m: MovieSlim) {
    return html`
      <button
        class="poster-btn small"
        @click=${() => void this._openMovieDetail(m)}
      >
        <img src=${m.posterUrl ?? ""} alt="" loading="lazy" />
        <span>${m.title}</span>
      </button>
    `;
  }

  private _libraryItem(m: MovieSlim) {
    if (this._libraryView === "list") {
      return html`
        <button
          class="list-row"
          role="listitem"
          @click=${() => void this._openMovieDetail(m)}
        >
          <img class="thumb" src=${m.posterUrl ?? ""} alt="" />
          <span>${m.title} (${m.year})</span>
          ${m.hasFile
            ? html`<span class="pill ok">On disk</span>`
            : html`<span class="pill">Missing</span>`}
        </button>
      `;
    }
    return html`
      <button
        class="poster-btn"
        role="listitem"
        aria-label=${m.title ?? "Movie"}
        @click=${() => void this._openMovieDetail(m)}
      >
        <img src=${m.posterUrl ?? ""} alt="" loading="lazy" />
        <div>${m.title} (${m.year})</div>
      </button>
    `;
  }

  private _renderDownloading() {
    const rows = this._queueRecords();
    if (!rows.length) {
      return html`
        <p data-screen="D01">
          <ha-icon icon="mdi:check-circle"></ha-icon> Nothing downloading
        </p>
      `;
    }
    const limit = this._compact && !this._showAllDownloads ? 3 : rows.length;
    const visible = rows.slice(0, limit);
    return html`
      <div data-screen="D02" role="list">
        ${visible.map((row) => this._renderQueueRow(row))}
      </div>
      ${this._compact && rows.length > 3 && !this._showAllDownloads
        ? html`
            <button
              class="text"
              data-screen="G04"
              @click=${() => (this._showAllDownloads = true)}
            >
              Show all ${rows.length} downloads
            </button>
          `
        : nothing}
    `;
  }

  private _renderQueueRow(row: QueueItem) {
    const title = row.movie?.title ?? row.title ?? "Download";
    const failed = (row.status || "").toLowerCase() === "failed";
    const importAttn = (row.trackedDownloadStatus || "")
      .toLowerCase()
      .includes("import");
    const hide = this._hideDestructive;
    const pct = queueProgress(row);
    return html`
      <div
        class="queue-row ${failed ? "attention" : importAttn ? "attention warn" : ""}"
        role="listitem"
        data-screen="D02"
      >
        <div class="queue-main">
          <strong>${title}</strong>
          <span class="pill ${failed ? "failed" : ""}"
            >${queueStatusLabel(row)}</span
          >
          <div
            class="progress-bar"
            role="progressbar"
            aria-label="${title} progress"
            aria-valuenow=${pct}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div class="progress-fill" style="width: ${pct}%"></div>
          </div>
          <div class="queue-meta mono">
            ${row.quality?.quality?.name ?? ""}
            ${row.size ? ` · ${formatBytes(row.size)}` : ""}
            ${row.timeleft ? ` · ${row.timeleft}` : ""}
          </div>
          <div class="queue-actions">
            ${!hide
              ? html`
                  ${failed || row.trackedDownloadStatus === "warning"
                    ? html`<button
                        class="outline-danger"
                        data-action="remove-search-again"
                        data-qid=${row.id}
                        ?disabled=${this._offline}
                        @click=${() => void this._removeSearchAgain(row.id, title)}
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
              class="text overflow-btn"
              data-screen="D03"
              @click=${() => (this._queueOverflow = row)}
            >
              ⋮
            </button>`
          : nothing}
      </div>
    `;
  }

  private _renderAdd() {
    const screen =
      this._addPhase === "searching"
        ? "A02"
        : this._addPhase === "results"
          ? "A03"
          : this._addPhase === "no_results"
            ? "A04"
            : this._addPhase === "error"
              ? "A06"
              : "A01";
    const movies = this._state?.movies ?? [];
    const comingSoon = this._lookupResults.filter((r) => {
      const st = String(r.status ?? r.statusType ?? "").toLowerCase();
      return st.includes("cinemas") || st.includes("announced");
    });

    return html`
      <svg width="0" height="0" aria-hidden="true"></svg>
      <div data-screen=${screen}>
        <input
          class="search-field"
          placeholder="Search for a movie to add"
          aria-label="Search for a movie to add"
          ?disabled=${this._offline}
          .value=${this._addQuery}
          @input=${(e: Event) => {
            this._addQuery = (e.target as HTMLInputElement).value;
            this._scheduleLookup();
          }}
        />
        ${this._addPhase === "searching"
          ? html`<div class="skeleton-list" aria-busy="true"></div>`
          : nothing}
        ${this._addPhase === "no_results"
          ? html`<p>No matches. Try another title or year.</p>`
          : nothing}
        ${this._addPhase === "error"
          ? html`<p class="error-text">${this._addError}</p>`
          : nothing}
        <div role="list">
          ${this._lookupResults.map((r) => {
            const lib = inLibrary(movies, r as { tmdbId?: number; title?: string; year?: number });
            return html`
              <div class="lookup-row" role="listitem">
                <strong>${r.title as string} (${r.year as number})</strong>
                ${lib
                  ? html`
                      <button
                        class="primary"
                        @click=${() => void this._openMovieDetail(lib)}
                      >
                        Open
                      </button>
                      <span class="pill ok">In library</span>
                    `
                  : html`
                      <button
                        class="primary"
                        data-action="add-movie"
                        ?disabled=${this._offline}
                        @click=${() => this._openAddSheet(r)}
                      >
                        Add movie
                      </button>
                    `}
              </div>
            `;
          })}
        </div>
        ${comingSoon.length && this._addPhase === "results"
          ? html`
              <section data-screen="A07">
                <h3>Coming soon in results</h3>
                ${comingSoon.map(
                  (r) => html`<p>${r.title as string} (${r.year as number})</p>`,
                )}
              </section>
            `
          : nothing}
      </div>
    `;
  }

  private _detailBody(m: MovieSlim) {
    const extra = this._detailExtra;
    const hide = this._hideDestructive;
    const size = m.sizeOnDisk;
    return html`
      <button
        class="text"
        @click=${() => {
          this._selectedMovie = undefined;
          this._detailExtra = undefined;
        }}
      >
        ← Back
      </button>
      <h2 data-screen="M01">${m.title} (${m.year})</h2>
      <img
        class="detail-poster"
        src=${m.posterUrl ?? ""}
        alt=""
        loading="lazy"
      />
      <dl class="detail-dl">
        <dt>Quality</dt>
        <dd>${m.quality ?? "—"}</dd>
        <dt>Size</dt>
        <dd class="mono">${size ? formatBytes(size) : "—"}</dd>
        <dt>Status</dt>
        <dd>${m.status ?? "—"}</dd>
        <dt>Runtime</dt>
        <dd>${m.runtime ?? (extra?.runtime as number) ?? "—"} min</dd>
        <dt>Certification</dt>
        <dd>${m.certification ?? (extra?.certification as string) ?? "—"}</dd>
      </dl>
      <p class="overview">${m.overview ?? (extra?.overview as string) ?? ""}</p>
      <label>
        <input
          type="checkbox"
          role="switch"
          .checked=${m.monitored ?? true}
          ?disabled=${this._offline}
          @change=${(e: Event) =>
            void this._setMonitored(
              m.id,
              (e.target as HTMLInputElement).checked,
              m.title,
            )}
        />
        Monitored
      </label>
      <div class="detail-actions">
        <button
          class="primary"
          ?disabled=${this._offline}
          @click=${() => void this._movieSearch(m)}
        >
          Search again
        </button>
        <button
          class="primary"
          data-screen="M04"
          ?disabled=${this._offline}
          @click=${() => void this._openManualSearch(m)}
        >
          Manual search
        </button>
        <button
          class="text"
          data-screen="M08"
          ?disabled=${this._offline}
          @click=${() => (this._qualityOpen = true)}
        >
          Change quality profile
        </button>
      </div>
      ${!hide && m.hasFile
        ? html`
            <section data-screen="M12T">
              <h3>Fix or remove</h3>
              <button
                class="outline-danger"
                data-action="delete-redownload"
                ?disabled=${this._offline}
                @click=${() =>
                  this._openConfirm("m09", {
                    title: m.title,
                    year: m.year,
                    quality: m.quality,
                    size: m.sizeOnDisk,
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
                    size: m.sizeOnDisk,
                  })}
              >
                Remove movie
              </button>
            </section>
          `
        : nothing}
    `;
  }

  private _renderDetailPanel() {
    const m = this._selectedMovie;
    if (!m) return nothing;
    return html`
      <aside class="side-panel" data-screen="M02">${this._detailBody(m)}</aside>
    `;
  }

  private _renderDetailDialog() {
    const m = this._selectedMovie;
    if (!m) return nothing;
    return html`
      <dialog open class="detail-dialog" data-screen="M03">
        ${this._detailBody(m)}
      </dialog>
    `;
  }

  private _renderManualSearch() {
    const filtered = this._releases.filter((r) =>
      this._showRejected ? true : r.approved !== false,
    );
    return html`
      <dialog open class="release-dialog" data-screen="M05">
        <button class="text" @click=${() => (this._manualMovieId = undefined)}>
          ← Back
        </button>
        <h2>Manual search</h2>
        <label>
          <input
            type="checkbox"
            .checked=${this._showRejected}
            @change=${(e: Event) =>
              (this._showRejected = (e.target as HTMLInputElement).checked)}
          />
          Show rejected releases
        </label>
        ${this._releaseBusy
          ? html`<div class="skeleton-list"></div>`
          : html`
              <div role="list" data-screen="M05T">
                ${filtered.map((r) => this._releaseRow(r))}
              </div>
            `}
      </dialog>
    `;
  }

  private _releaseRow(r: ReleaseRow) {
    const rejected = r.approved === false;
    const reasons = (r.rejections ?? []).join(", ");
    return html`
      <div class="release-row ${rejected ? "rejected" : ""}" role="listitem">
        <div>
          <strong>${r.title ?? r.indexer ?? "Release"}</strong>
          <div class="mono">
            ${formatBytes(r.size)} · ${r.seeders ?? "?"} seeders · ${r.age ?? "?"}d
          </div>
          ${rejected
            ? html`<p class="hint-muted">${reasons}</p>`
            : nothing}
        </div>
        <button
          class="primary"
          ?disabled=${this._offline || this._releaseBusy}
          @click=${() => this._grabRelease(r, rejected, reasons)}
        >
          ${rejected ? "Grab anyway" : "Grab"}
        </button>
      </div>
    `;
  }

  private _grabRelease(
    release: ReleaseRow,
    rejected: boolean,
    reasons: string,
  ): void {
    if (rejected) {
      this._openConfirm("m06", {
        title: release.title,
        releaseName: release.title,
        reasons,
        size: release.size,
        release,
      });
      return;
    }
    void this._doGrab(release);
  }

  private async _doGrab(release: ReleaseRow): Promise<void> {
    this._releaseBusy = true;
    try {
      await this._ws("grab_release", { release });
      showToast(this, toastGrab());
      this._manualMovieId = undefined;
      await this._refresh();
    } catch (err) {
      this._fail("grab_release", err);
    } finally {
      this._releaseBusy = false;
    }
  }

  private _fail(command: string, err: unknown): void {
    this._failureDetail =
      err instanceof Error ? err.message : String(err);
    showActionFailure(this, command, err);
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
      addImportExclusion: false,
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
            add_import_exclusion: this._confirm.addImportExclusion ?? false,
          });
          showToast(
            this,
            toastRemoveMovie(
              String(payload.title),
              Boolean(this._confirm.deleteFiles),
            ),
          );
          this._selectedMovie = undefined;
          break;
        case "m09":
          await this._ws("delete_file_redownload", {
            movie_id: payload.movie_id,
            block_release: this._confirm.blockRelease ?? false,
          });
          showToast(this, toastDeleteRedownload(String(payload.title)));
          break;
        case "d04":
          await this._ws("queue_remove_blocklist", {
            queue_id: payload.queue_id,
            search_again: this._confirm.searchAgain ?? true,
            remove_from_client: this._confirm.removeFromClient ?? true,
          });
          showToast(
            this,
            toastRemoveBlocklist(
              String(payload.title),
              Boolean(this._confirm.searchAgain),
            ),
          );
          break;
        case "d04b":
          await this._ws("queue_remove", {
            queue_id: payload.queue_id,
            remove_from_client: this._confirm.removeFromClient ?? true,
          });
          showToast(this, toastRemoveQueue(String(payload.title)));
          break;
        case "m06": {
          const rel = payload.release as ReleaseRow;
          await this._ws("grab_release", { release: rel });
          showToast(this, toastGrab());
          this._manualMovieId = undefined;
          break;
        }
        default:
          break;
      }
      await this._refresh();
    } catch (err) {
      const cmd =
        kind === "m10"
          ? "remove_movie"
          : kind === "m09"
            ? "delete_file_redownload"
            : kind === "m06"
              ? "grab_release"
              : "queue_remove";
      this._fail(cmd, err);
    } finally {
      this._confirmBusy = false;
      this._confirm = null;
    }
  }

  private async _removeSearchAgain(
    queueId: number,
    title: string,
  ): Promise<void> {
    try {
      await this._ws("queue_remove_search_again", { queue_id: queueId });
      showToast(this, toastRemoveSearchAgain(title));
      await this._refresh();
    } catch (err) {
      this._fail("queue_remove", err);
    }
  }

  private async _retryImport(row: QueueItem): Promise<void> {
    try {
      await this._ws("retry_import", {
        output_path: row.outputPath,
        download_client_id: row.downloadId,
      });
      showToast(this, toastRetryImport(row.movie?.title ?? "movie"));
      await this._refresh();
    } catch (err) {
      this._fail("retry_import", err);
    }
  }

  private async _setMonitored(
    movieId: number,
    monitored: boolean,
    title?: string,
  ): Promise<void> {
    try {
      await this._ws("set_monitored", { movie_id: movieId, monitored });
      showToast(
        this,
        monitored
          ? toastMonitorOn(title ?? "Movie")
          : toastMonitorOff(title ?? "Movie"),
      );
      await this._refresh();
    } catch (err) {
      this._fail("set_monitored", err);
    }
  }

  private async _movieSearch(m: MovieSlim): Promise<void> {
    try {
      await this._ws("movie_search", { movie_id: m.id });
      showToast(this, toastSearchAgain(m.title));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("not_found") || msg.includes("gone")) {
        showToast(this, toastGone());
        this._selectedMovie = undefined;
      } else {
        this._fail("movie_search", err);
      }
    }
  }

  private async _openManualSearch(m: MovieSlim): Promise<void> {
    await this._loadReleases(m.id);
  }

  private async _setQualityProfile(profileId: number): Promise<void> {
    const m = this._selectedMovie;
    if (!m) return;
    const profiles = this._state?.quality_profiles ?? [];
    const name = profiles.find((p) => p.id === profileId)?.name ?? "profile";
    try {
      await this._ws("set_quality_profile", {
        movie_id: m.id,
        quality_profile_id: profileId,
        search: this._qualitySearch,
      });
      showToast(this, toastProfile(name, this._qualitySearch));
      this._qualityOpen = false;
      await this._refresh();
    } catch (err) {
      this._fail("set_quality_profile", err);
    }
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

export function getConfigElement() {
  return document.createElement("arr-card-editor");
}

export function getStubConfig(hass: HomeAssistant) {
  void hass;
  return { type: "custom:arr-card", instance: "" };
}