import { LitElement, html, nothing } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import type { PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import {
  episodeCode,
  isMonitorMode,
  profileFor,
  seriesRunLabel,
  type ArrApp,
  type MonitorMode,
} from "./app-profile";
import { defineElement } from "./define-element";
import { renderConfirmDialog } from "./confirm-dialog";
import {
  formatAirDate,
  formatBytes,
  formatRelative,
  queueProgress,
  queueStatusLabel,
} from "./format";
import {
  libraryPosterColumns,
  libraryPosterRowHeight,
  type LibrarySort,
} from "./library-logic";
import { posterUrlForTile } from "./poster-url";
import { animateQueueRowExit } from "./queue-motion";
import {
  releaseQualityName,
  sortReleases,
  type ReleaseSort,
} from "./release-logic";
import {
  renderAddSheet,
  renderFailureSheet,
  renderQualitySheet,
  renderQueueOverflowSheet,
  renderIssuesPanel,
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
  resolveArrEntry,
  signPosterPath,
  type ArrState,
  type CalendarEpisode,
  type LibraryItem,
  type LibraryPageResult,
  type MovieSlim,
  type QueueItem,
  type SeriesEpisode,
  type SeriesSeason,
  type SeriesSlim,
} from "./ws";

const LOOKUP_DEBOUNCE_MS = 400;
const LIBRARY_SEARCH_DEBOUNCE_MS = 300;
const RELEASE_CACHE_MS = 5 * 60 * 1000;

function lookupPosterUrl(hit: Record<string, unknown>): string {
  const images = hit.images;
  if (!Array.isArray(images)) return "";
  for (const img of images) {
    if (!img || typeof img !== "object") continue;
    const rec = img as Record<string, unknown>;
    if (rec.coverType === "poster" && typeof rec.remoteUrl === "string") {
      return posterUrlForTile(rec.remoteUrl);
    }
  }
  return "";
}

function lookupComingSoon(hit: Record<string, unknown>): boolean {
  const st = String(hit.status ?? hit.statusType ?? "").toLowerCase();
  return st.includes("cinemas") || st.includes("announced");
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

export class ArrDashboardCard extends LitElement {
  static styles = cardStyles;

  protected app: ArrApp = "radarr";

  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public config!: ArrCardConfig;

  @state() private _entryId?: string;
  @state() private _listedApp?: ArrApp;
  @state() private _mismatch = false;
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
  @state() private _selectedMovie?: LibraryItem;
  @state() private _detailExtra?: Record<string, unknown>;
  @state() private _librarySearch = "";
  @state() private _librarySort: LibrarySort = "title";
  @state() private _libraryItems: LibraryItem[] = [];
  @state() private _libraryTotal = 0;
  @state() private _libraryLoading = false;
  @state() private _libraryLoadingMore = false;
  @state() private _addUpcoming: MovieSlim[] = [];
  @state() private _upcomingEpisodes: CalendarEpisode[] = [];
  @state() private _addRecent: SeriesSlim[] = [];
  @state() private _addMonitor: MonitorMode = "all";
  @state() private _lookupLib: Record<string, LibraryItem> = {};
  @state() private _queuePosters: Record<number, string> = {};
  @state() private _compact = false;
  @state() private _hostWidth = 0;
  @state() private _statusOpen = false;
  @state() private _failureDetail = "";
  @state() private _qualityOpen = false;
  @state() private _qualitySearch = true;
  @state() private _queueOverflow?: QueueItem;
  @state() private _manualMovieId?: number;
  @state() private _episodes: SeriesEpisode[] = [];
  @state() private _episodeId?: number;
  @state() private _episodesLoading = false;
  @state() private _releases: ReleaseRow[] = [];
  @state() private _showRejected = false;
  @state() private _releaseBusy = false;
  @state() private _releaseSort: ReleaseSort = "match";
  @state() private _exitingQueueIds: number[] = [];
  @state() private _qualityPendingId?: number;
  @state() private _qualityBusy = false;
  @state() private _searchAgainBusy = false;
  @state() private _grabOkScreen = false;

  private _refreshTimer?: ReturnType<typeof setInterval>;
  private _lookupTimer?: ReturnType<typeof setTimeout>;
  private _librarySearchTimer?: ReturnType<typeof setTimeout>;
  private _librarySentinelIo?: IntersectionObserver;
  private _libraryLoadGen = 0;
  private _failCount = 0;
  private _releaseCache = new Map<
    number,
    { at: number; releases: ReleaseRow[] }
  >();
  private _lastFullRefresh = 0;
  private _pageVisible = true;
  private readonly _fullRefreshMs = 5 * 60 * 1000;

  private get _profile() {
    return profileFor(this.app);
  }

  public setConfig(config: ArrCardConfig): void {
    if (!config.type) {
      throw new Error("Invalid configuration");
    }
    const prevInstance = this.config?.instance;
    const profile = this._profile;
    this.config = {
      title: profile.defaultTitle,
      icon: profile.defaultIcon,
      tabs: ["add", "downloading", "library", "issues"],
      default_tab: "library",
      compact: "auto",
      layout: "auto",
      show_header_chips: [],
      hide_destructive_actions: false,
      add_defaults: { search_on_add: true },
      upcoming_days: 14,
      recent_days: 7,
      library_sort: "title",
      library_filter: "downloaded",
      external_link: false,
      ...config,
      type: config.type || profile.cardType,
    };
    this._tab = this.config.default_tab ?? "library";
    this._librarySort = (this.config.library_sort as LibrarySort) ?? "title";
    const ad = this.config.add_defaults ?? {};
    this._addSearchOn = ad.search_on_add !== false;
    this._addMinAvail = ad.minimum_availability ?? "released";
    this._addMonitor = isMonitorMode(ad.monitor) ? ad.monitor : "all";
    if (this.hass && this.isConnected && prevInstance !== this.config.instance) {
      this._mismatch = false;
      this._configError = undefined;
      void this._bootstrap();
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 400;
      const compactCfg = this.config?.compact ?? "auto";
      this._compact =
        compactCfg === true || (compactCfg === "auto" && w < 340);
      const next = Math.round(w);
      if (next !== this._hostWidth) this._hostWidth = next;
    });
    this._ro.observe(this);
  }

  protected firstUpdated(): void {
    void this._bootstrap();
    this._onVisibility = () => {
      this._pageVisible = document.visibilityState !== "hidden";
      if (this._pageVisible) void this._refresh();
    };
    document.addEventListener("visibilitychange", this._onVisibility);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._ro?.disconnect();
    if (this._refreshTimer) clearInterval(this._refreshTimer);
    if (this._lookupTimer) clearTimeout(this._lookupTimer);
    if (this._librarySearchTimer) clearTimeout(this._librarySearchTimer);
    this._teardownLibrarySentinel();
    if (this._onVisibility) {
      document.removeEventListener("visibilitychange", this._onVisibility);
    }
  }

  protected updated(changed: PropertyValues): void {
    if (
      changed.has("_tab") &&
      this._tab !== "library" &&
      (this._selectedMovie || this._manualMovieId)
    ) {
      this._closeMovieDetail();
    }
    if (
      this._tab === "library" &&
      (changed.has("_libraryItems") ||
        changed.has("_libraryTotal") ||
        changed.has("_tab"))
    ) {
      void this.updateComplete.then(() => this._setupLibrarySentinel());
    } else if (changed.has("_tab") && this._tab !== "library") {
      this._teardownLibrarySentinel();
    }
  }

  private _onVisibility?: () => void;

  private _ro?: ResizeObserver;

  /** Explicit app on get_state wins. Otherwise list_instances, then missing means Radarr. */
  private _stateAppMismatch(data: ArrState): boolean {
    if (data.app === "sonarr" || data.app === "radarr") {
      return data.app !== this.app;
    }
    if (this._listedApp) return this._listedApp !== this.app;
    return this.app !== "radarr";
  }

  private async _bootstrap(): Promise<void> {
    if (!this.hass) return;
    try {
      const resolved = await resolveArrEntry(
        this.hass,
        this.config?.instance,
        this.app,
      );
      if (!resolved) {
        this._configError = `No ${this._profile.product} instance called "${this.config.instance ?? ""}".`;
        this._loading = false;
        return;
      }
      this._entryId = resolved.entryId;
      this._listedApp = resolved.app;
      if (resolved.mismatch) {
        this._mismatch = true;
        this._state = undefined;
        this._libraryItems = [];
        this._loading = false;
        return;
      }
      this._mismatch = false;
      await this._refresh();
      this._schedulePoll();
    } catch {
      this._configError = `${this._profile.defaultTitle} card can't start. Check the Arr integration in Settings.`;
      this._loading = false;
    }
  }

  private _schedulePoll(): void {
    if (this._refreshTimer) clearInterval(this._refreshTimer);
    const ms = this._tab === "downloading" ? 5000 : 30000;
    this._refreshTimer = setInterval(() => {
      if (!this._pageVisible) return;
      void this._refresh();
    }, ms);
  }

  private async _refresh(): Promise<void> {
    if (!this._entryId || !this.hass || !this._pageVisible) return;
    const queueOnly =
      this._tab === "downloading" &&
      Date.now() - this._lastFullRefresh < this._fullRefreshMs;
    try {
      const scope = queueOnly ? "queue" : "core";
      const data = (await callArr(this.hass, this._entryId, "get_state", {
        scope,
      })) as ArrState;
      if (this._stateAppMismatch(data)) {
        this._mismatch = true;
        this._state = undefined;
        this._libraryItems = [];
        return;
      }
      this._mismatch = false;
      const wasOff = this._offline;
      if (queueOnly && this._state) {
        this._state = {
          ...this._state,
          reachable: data.reachable,
          queue: data.queue,
          queue_count: data.queue_count,
          health: data.health,
          disk_space: data.disk_space,
          last_success: data.last_success,
        };
      } else {
        const prevRev = this._state?.library_revision;
        this._state = { ...data };
        this._lastFullRefresh = Date.now();
        if (
          data.library_revision &&
          data.library_revision !== prevRev &&
          this._tab === "library"
        ) {
          void this._resetLibrary();
        }
        if (this._tab === "add") {
          void this._loadAddUpcoming();
        }
      }
      this._failCount = 0;
      if (!data.reachable) this._failCount = 3;
      if (wasOff && !this._offline) {
        showToast(this, toastRadarrBack());
      }
    } catch {
      this._failCount += 1;
    } finally {
      this._loading = false;
      if (
        this._tab === "library" &&
        !this._libraryItems.length &&
        !this._libraryLoading
      ) {
        void this._resetLibrary();
      }
      void this._hydrateQueuePosters();
    }
  }

  private async _signMoviePosters(movies: LibraryItem[]): Promise<void> {
    if (!this.hass) return;
    await Promise.all(
      movies.map(async (m) => {
        const url = m.posterUrl;
        if (url?.startsWith("/api/arr_dashboard")) {
          m.posterUrl = await signPosterPath(this.hass, url);
        }
      }),
    );
  }

  private _queueMediaId(row: QueueItem): number | undefined {
    switch (this.app) {
      case "sonarr":
        return row.series?.id;
      case "radarr":
        return row.movie?.id;
      default: {
        const _never: never = this.app;
        return _never;
      }
    }
  }

  private _queueTitle(row: QueueItem): string {
    switch (this.app) {
      case "sonarr": {
        const series = row.series?.title ?? row.title ?? "Download";
        const episodeNumber = row.episode?.episodeNumber ?? row.episodeNumber;
        const code = episodeCode(row.seasonNumber, episodeNumber);
        const episodeTitle = row.episode?.title;
        return [series, code, episodeTitle].filter((part) => part).join(" · ");
      }
      case "radarr":
        return row.movie?.title ?? row.title ?? "Download";
      default: {
        const _never: never = this.app;
        return _never;
      }
    }
  }

  private _queuePosterPath(row: QueueItem): string {
    const mediaId = this._queueMediaId(row);
    if (!mediaId || !this._entryId) return "";
    return `/api/arr_dashboard/${this._entryId}/poster/${mediaId}`;
  }

  private async _hydrateQueuePosters(): Promise<void> {
    if (!this.hass || !this._entryId) return;
    const rows = this._queueRecords();
    const next = { ...this._queuePosters };
    let changed = false;
    await Promise.all(
      rows.map(async (row) => {
        const movieId = this._queueMediaId(row);
        if (!movieId || next[movieId]) return;
        const path = this._queuePosterPath(row);
        if (!path) return;
        next[movieId] = path.startsWith("/api/arr_dashboard")
          ? await signPosterPath(this.hass, path)
          : path;
        changed = true;
      }),
    );
    if (changed) this._queuePosters = next;
  }

  /** UI-only; the integration still accepts every websocket command (§2.2). */
  private get _hideDestructive(): boolean {
    return Boolean(this.config.hide_destructive_actions);
  }

  private get _offline(): boolean {
    return this._failCount >= 3 || this._state?.reachable === false;
  }

  private get _posterColumns(): number {
    const width = this._hostWidth || 900;
    return Math.max(2, Math.min(6, Math.floor(width / 170)));
  }

  private get _layoutTablet(): boolean {
    const cfg = this.config ?? ({} as ArrCardConfig);
    return cfg.layout === "tablet" || (cfg.layout === "auto" && !this._compact);
  }

  /** Side-by-side details only fit once the card is wider than a phone. */
  private get _mobileDetail(): boolean {
    return (this._hostWidth || 900) < 680;
  }

  private async _ws(command: string, data?: Record<string, unknown>) {
    if (!this._entryId || !this.hass) throw new Error("No instance");
    return callArr(this.hass, this._entryId, command, data);
  }

  private _closeMovieDetail(): void {
    this._selectedMovie = undefined;
    this._detailExtra = undefined;
    this._qualityOpen = false;
    this._manualMovieId = undefined;
  }

  private _switchTab(tab: TabId): void {
    const prev = this._tab;
    this._tab = tab;
    if (tab !== prev) {
      this._closeMovieDetail();
    }
    if (tab === "library") {
      void this._resetLibrary();
    }
    if (tab === "add") {
      void this._loadAddUpcoming();
    }
    this._schedulePoll();
  }

  private get _libraryColumns(): number {
    return libraryPosterColumns(this._hostWidth || 900);
  }

  private _libraryPageLimit(): number {
    return Math.max(24, this._libraryColumns * 8);
  }

  private get _posterRowHeight(): number {
    const width = this._hostWidth || 900;
    return libraryPosterRowHeight(width, this._libraryColumns);
  }

  private async _resetLibrary(): Promise<void> {
    if (!this._entryId || !this.hass) return;
    const gen = ++this._libraryLoadGen;
    this._libraryLoading = true;
    try {
      const page = (await this._ws("library_page", {
        offset: 0,
        limit: this._libraryPageLimit(),
        sort: this._librarySort,
        search: this._librarySearch,
      })) as LibraryPageResult;
      if (gen !== this._libraryLoadGen) return;
      await this._signMoviePosters(page.items);
      if (gen !== this._libraryLoadGen) return;
      this._libraryItems = page.items;
      this._libraryTotal = page.total;
    } finally {
      if (gen === this._libraryLoadGen) this._libraryLoading = false;
    }
  }

  private async _loadMoreLibrary(): Promise<void> {
    if (
      !this._entryId ||
      this._libraryLoadingMore ||
      this._libraryLoading ||
      this._libraryItems.length >= this._libraryTotal
    ) {
      return;
    }
    this._libraryLoadingMore = true;
    const offset = this._libraryItems.length;
    try {
      const page = (await this._ws("library_page", {
        offset,
        limit: this._libraryPageLimit(),
        sort: this._librarySort,
        search: this._librarySearch,
      })) as LibraryPageResult;
      await this._signMoviePosters(page.items);
      this._libraryItems = [...this._libraryItems, ...page.items];
      this._libraryTotal = page.total;
    } finally {
      this._libraryLoadingMore = false;
    }
  }

  private _onLibraryScroll(e: Event): void {
    const el = e.currentTarget as HTMLElement;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 240) {
      void this._loadMoreLibrary();
    }
  }

  private _teardownLibrarySentinel(): void {
    this._librarySentinelIo?.disconnect();
    this._librarySentinelIo = undefined;
  }

  /** Load more when the list grows with the card (masonry / sections views). */
  private _setupLibrarySentinel(): void {
    this._teardownLibrarySentinel();
    if (this._tab !== "library" || this._libraryItems.length >= this._libraryTotal) {
      return;
    }
    const sentinel = this.renderRoot.querySelector(
      "[data-library-sentinel]",
    ) as HTMLElement | null;
    if (!sentinel || typeof IntersectionObserver === "undefined") {
      return;
    }
    this._librarySentinelIo = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void this._loadMoreLibrary();
        }
      },
      { root: null, rootMargin: "320px" },
    );
    this._librarySentinelIo.observe(sentinel);
  }

  private _libraryRowRender = (startIndex: number, count: number) => {
    const nodes = [];
    for (let i = 0; i < count; i++) {
      const m = this._libraryItems[startIndex + i];
      if (m) nodes.push(this._libraryItem(m));
    }
    return nodes;
  };

  private async _loadAddUpcoming(): Promise<void> {
    if (!this._entryId) return;
    try {
      const res = (await this._ws("library_upcoming", {
        days: this.config.upcoming_days ?? 30,
      })) as { items: MovieSlim[] | CalendarEpisode[] };
      if (this.app === "sonarr") {
        this._upcomingEpisodes = (res.items ?? []) as CalendarEpisode[];
        this._addUpcoming = [];
        await this._loadRecentSeries();
      } else {
        const movies = (res.items ?? []) as MovieSlim[];
        await this._signMoviePosters(movies);
        this._addUpcoming = movies;
        this._upcomingEpisodes = [];
        this._addRecent = [];
      }
    } catch {
      this._addUpcoming = [];
      this._upcomingEpisodes = [];
      this._addRecent = [];
    }
  }

  private async _loadRecentSeries(): Promise<void> {
    const full = (await this._ws("get_state", { scope: "full" })) as ArrState;
    const items: LibraryItem[] = full.series ?? [];
    const days = this.config.recent_days ?? 7;
    const since = Date.now() - days * 86400000;
    const recent = items
      .filter((item): item is SeriesSlim => {
        if (!item.added) return false;
        return new Date(item.added).getTime() >= since;
      })
      .sort((a, b) => (b.added ?? "").localeCompare(a.added ?? ""))
      .slice(0, 12);
    await this._signMoviePosters(recent);
    this._addRecent = recent;
  }

  private async _refreshLookupLibraryFlags(): Promise<void> {
    if (!this._entryId || !this._lookupResults.length) {
      this._lookupLib = {};
      return;
    }
    const next: Record<string, LibraryItem> = {};
    await Promise.all(
      this._lookupResults.map(async (r) => {
        const key = this._lookupLibKey(r);
        if (this.app === "sonarr") {
          const res = (await this._ws("library_match", {
            tvdbId: r.tvdbId,
            title: r.title,
            year: r.year,
          })) as { series?: SeriesSlim | null };
          if (res.series) next[key] = res.series;
        } else {
          const res = (await this._ws("library_match", {
            tmdbId: r.tmdbId,
            title: r.title,
            year: r.year,
          })) as { movie?: MovieSlim | null };
          if (res.movie) next[key] = res.movie;
        }
      }),
    );
    this._lookupLib = next;
  }

  private _lookupLibKey(r: Record<string, unknown>): string {
    if (this.app === "sonarr") {
      return String(r.tvdbId ?? `${String(r.title)}-${String(r.year ?? "")}`);
    }
    return String(r.tmdbId ?? `${String(r.title)}-${String(r.year ?? "")}`);
  }

  private _queueRecords(): QueueItem[] {
    const rec = this._state?.queue?.records ?? [];
    return [...rec].sort((a, b) => {
      const aw = queueNeedsAttention(a) ? 0 : 1;
      const bw = queueNeedsAttention(b) ? 0 : 1;
      return aw - bw;
    });
  }

  private _scheduleLookup(_force = false): void {
    if (this._lookupTimer) clearTimeout(this._lookupTimer);
    const q = this._addQuery.trim();
    if (q.length < 2) {
      this._addPhase = "start";
      this._lookupResults = [];
      this._lookupLib = {};
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
      await this._refreshLookupLibraryFlags();
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
    this._addMonitor = isMonitorMode(defaults.monitor) ? defaults.monitor : "all";
    this._addSheetOpen = true;
    this._addPhase = "sheet";
  }

  private async _confirmAddMovie(): Promise<void> {
    if (!this._addPick) return;
    this._addBusy = true;
    try {
      const r = this._addPick;
      if (this.app === "sonarr") {
        await this._ws(this._profile.commands.add, {
          title: r.title,
          year: r.year,
          tvdbId: r.tvdbId,
          imdbId: r.imdbId,
          quality_profile_id: this._addProfileId,
          root_folder_path: this._addRootPath,
          search_on_add: this._addSearchOn,
          monitor: this._addMonitor,
        });
      } else {
        await this._ws(this._profile.commands.add, {
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
      }
      showToast(this, toastAdded(String(r.title), this._addSearchOn));
      this._addSheetOpen = false;
      this._addPick = undefined;
      this._addPhase = "added";
      this._addQuery = "";
      this._lookupResults = [];
      await this._refresh();
    } catch (err) {
      this._fail(this._profile.commands.add, err);
    } finally {
      this._addBusy = false;
    }
  }

  private async _openMovieDetail(m: LibraryItem): Promise<void> {
    this._selectedMovie = m;
    try {
      if (this.app === "sonarr") {
        const res = (await this._ws(this._profile.commands.get, {
          series_id: m.id,
        })) as {
          series?: SeriesSlim;
          seasons?: SeriesSeason[];
          grabbed_history?: unknown[];
        };
        this._detailExtra = {
          ...(res.series ?? {}),
          seasons: res.seasons ?? res.series?.seasons ?? [],
          grabbed_history: res.grabbed_history ?? [],
        };
        return;
      }
      const res = (await this._ws(this._profile.commands.get, {
        movie_id: m.id,
      })) as {
        movie: Record<string, unknown>;
        grabbed_history?: unknown[];
      };
      this._detailExtra = {
        ...res.movie,
        grabbed_history: res.grabbed_history ?? [],
      };
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
      const res = (await this._ws("release_search", {
        [this._profile.idField]: movieId,
      })) as {
        releases: ReleaseRow[];
      };
      const releases = res.releases ?? [];
      this._releaseCache.set(movieId, { at: now, releases });
      this._releases = releases;
    } catch (err) {
      this._fail("release_search", err);
      this._releases = [];
    } finally {
      this._releaseBusy = false;
    }
  }

  private async _loadEpisodeReleases(episodeId: number): Promise<void> {
    this._releaseBusy = true;
    try {
      const res = (await this._ws("release_search", {
        episode_id: episodeId,
      })) as { releases: ReleaseRow[] };
      const releases = res.releases ?? [];
      this._releaseCache.set(episodeId, { at: Date.now(), releases });
      this._releases = releases;
    } catch (err) {
      this._fail("release_search", err);
      this._releases = [];
    } finally {
      this._releaseBusy = false;
    }
  }

  protected render() {
    if (this._configError) {
      return html`
        <ha-card data-screen="G03">
          <p><strong>${this._profile.defaultTitle} card can't start</strong></p>
          <p>${this._configError}</p>
        </ha-card>
      `;
    }

    if (this._mismatch) {
      const other = this.app === "sonarr" ? "Radarr" : "Sonarr";
      return html`
        <ha-card data-screen="G03" data-mismatch="true">
          <p><strong>Wrong instance</strong></p>
          <p>
            This ${this._profile.nounTitle} card is pointed at ${other}. Choose a
            ${this._profile.product} instance.
          </p>
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
    const healthCount = this._state?.health?.length ?? 0;
    const sideDetail =
      this._layoutTablet &&
      !this._mobileDetail &&
      Boolean(this._selectedMovie) &&
      this._tab === "library";

    return html`
      <ha-card
        data-screen=${ifDefined(this._compact ? "G04" : undefined)}
        class="${this._compact ? "compact" : ""} ${this._layoutTablet
          ? "layout-tablet"
          : ""} ${sideDetail ? "with-side-panel" : ""}"
      >
        ${this._headerChips().length
          ? html`<div class="header">
              <div class="chips">${this._renderChips()}</div>
            </div>`
          : nothing}

        ${showTabBar
          ? this._renderTabs(tabs, queueCount, failedInQueue, healthCount)
          : nothing}

        ${this._offline ? this._renderOfflineBanner() : nothing}

        <div class="${this._offline ? "offline-dim" : ""} layout-body">
          <div class="main-pane">
            ${this._tab === "library" ? this._renderLibrary() : nothing}
            ${this._tab === "downloading" ? this._renderDownloading() : nothing}
            ${this._tab === "add" ? this._renderAdd() : nothing}
            ${this._tab === "issues" ? this._renderIssues() : nothing}
          </div>
          ${sideDetail ? this._renderDetailPanel() : nothing}
        </div>

        ${!sideDetail && this._tab === "library" && this._selectedMovie
          ? this._renderDetailDialog()
          : nothing}
        ${this._manualMovieId ? this._renderManualSearch() : nothing}
        ${this._grabOkScreen
          ? html`<span hidden data-screen="M07" aria-hidden="true"></span>`
          : nothing}

        ${renderStatusSheet(
          this._statusOpen,
          this._state?.health ?? [],
          this._state?.disk_space ?? [],
          cfg,
          () => (this._statusOpen = false),
          this._profile.product,
        )}
        ${renderFailureSheet(
          "Failure details",
          this._failureDetail,
          () => (this._failureDetail = ""),
        )}
        ${renderAddSheet(
          this._addSheetOpen,
          this._layoutTablet,
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
          this.app,
          this._addMonitor,
          (mode) => (this._addMonitor = mode),
        )}
        ${renderQualitySheet(
          this._qualityOpen,
          this._selectedMovie?.title,
          this._selectedMovie?.year,
          this._state?.quality_profiles ?? [],
          this._selectedMovie?.qualityProfileId,
          this._qualityPendingId,
          this._qualitySearch,
          this._qualityBusy,
          (v) => (this._qualitySearch = v),
          (id) => (this._qualityPendingId = id),
          () => void this._saveQualityProfile(),
          () => (this._qualityOpen = false),
        )}
        ${this._queueOverflow
          ? renderQueueOverflowSheet(
              true,
              this._queueTitle(this._queueOverflow),
              this.app === "sonarr" ? undefined : this._queueOverflow.movie?.year,
              this._hideDestructive,
              this._offline,
              () => (this._queueOverflow = undefined),
              () => {
                const row = this._queueOverflow;
                this._queueOverflow = undefined;
                if (row) {
                  this._openConfirm("d04b", {
                    title: this._queueTitle(row),
                    queue_id: row.id,
                  });
                }
              },
              () => {
                const row = this._queueOverflow;
                this._queueOverflow = undefined;
                if (row) {
                  this._openConfirm("d04", {
                    title: this._queueTitle(row),
                    year: this.app === "sonarr" ? undefined : row.movie?.year,
                    queue_id: row.id,
                  });
                }
              },
            )
          : nothing}
        ${renderConfirmDialog(
          this._confirm,
          this._confirmBusy,
          this._layoutTablet,
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
          { product: this._profile.product, noun: this._profile.noun },
        )}
        <div class="live-region" aria-live="polite"></div>
      </ha-card>
    `;
  }

  private _renderTabs(
    tabs: TabId[],
    queueCount: number,
    failedInQueue: boolean,
    healthCount: number,
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
                  : t === "issues"
                    ? "Issues"
                    : "Library"}
              ${t === "downloading" && queueCount > 0
                ? html`
                    <span class="badge ${failedInQueue ? "error" : "warn"}"
                      >${queueCount}</span
                    >
                  `
                : nothing}
              ${t === "issues" && (healthCount > 0 || this._offline)
                ? html`
                    <span class="badge ${this._offline ? "error" : "warn"}"
                      >${this._offline ? "!" : healthCount}</span
                    >
                  `
                : nothing}
            </button>
          `,
        )}
      </div>
    `;
  }

  private _headerChips(): ("disk" | "queue" | "health")[] {
    return this.config.show_header_chips ?? [];
  }

  private _renderOfflineBanner() {
    const last = this._state?.last_success;
    const screen = this._layoutTablet ? "G01T" : "G01";
    return html`
      <div class="banner" role="alert" data-screen=${screen}>
        <strong>Can't reach ${this._profile.product}.</strong> Showing data from ${last ? formatRelative(last) : "cache"}.
        Actions are off until it's back. Retrying every 30 s.
        <button class="text" @click=${() => void this._refresh()}>Retry</button>
        <button class="text" @click=${() => this._switchTab("issues")}>
          Issues
        </button>
      </div>
    `;
  }

  private _renderChips() {
    const chips = this._headerChips();
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
    if (this._loading || (this._libraryLoading && !this._libraryItems.length)) {
      return html`<div data-screen="L04" class="skeleton-block"></div>`;
    }

    return html`
      <div data-screen="L01" class="library-pane">
        <input
          class="search-field"
          placeholder="Search your library"
          aria-label="Search your library"
          .value=${this._librarySearch}
          @input=${(e: Event) => {
            this._librarySearch = (e.target as HTMLInputElement).value;
            if (this._librarySearchTimer) {
              clearTimeout(this._librarySearchTimer);
            }
            this._librarySearchTimer = setTimeout(
              () => void this._resetLibrary(),
              LIBRARY_SEARCH_DEBOUNCE_MS,
            );
          }}
        />
        <div class="chip-row library-toolbar" role="toolbar" aria-label="Library sort">
          <select
            class="sort-select"
            aria-label="Sort"
            .value=${this._librarySort}
            @change=${(e: Event) => {
              this._librarySort = (e.target as HTMLSelectElement)
                .value as LibrarySort;
              void this._resetLibrary();
            }}
          >
            <option value="title">Title</option>
            <option value="added">Added</option>
            <option value="year">Year</option>
          </select>
        </div>

        <div class="library-scroll">
          ${this._libraryItems.length
            ? html`
                <arr-virtual-list
                  data-screen="L05"
                  class="library-virtual"
                  style="--arr-cols: ${this._libraryColumns}; --arr-virtual-height: 100%"
                  .itemCount=${this._libraryItems.length}
                  .columns=${this._libraryColumns}
                  .itemHeight=${this._posterRowHeight}
                  rowClass="poster-grid"
                  .contentKey=${this._libraryItems}
                  .renderRow=${this._libraryRowRender}
                  @scroll=${this._onLibraryScroll}
                ></arr-virtual-list>
              `
            : html`<p>No ${this._profile.plural} match your filters.</p>`}
          ${this._libraryItems.length < this._libraryTotal
            ? html`<div data-library-sentinel class="library-load-sentinel"></div>`
            : nothing}
          ${this._libraryLoadingMore
            ? html`<p class="hint-muted">Loading more…</p>`
            : nothing}
        </div>
      </div>
    `;
  }

  private _libraryTile(m: LibraryItem) {
    return html`
      <button
        class="poster-btn small"
        @click=${() => void this._openMovieDetail(m)}
      >
        <img
          src=${posterUrlForTile(m.posterUrl)}
          alt=""
          loading="lazy"
        />
        <span class="poster-caption">
          ${m.title}
          ${this.app === "sonarr"
            ? html`<span class="poster-status"
                >${this._seriesCaption(m as SeriesSlim)}</span
              >`
            : nothing}
        </span>
      </button>
    `;
  }

  private _seriesCaption(series: SeriesSlim): string {
    const run = seriesRunLabel(series.status);
    return [series.year, run].filter((part) => part).join(" · ");
  }

  private _libraryItem(m: LibraryItem) {
    return html`
      <button
        class="poster-btn"
        role="listitem"
        aria-label=${m.title ?? this._profile.nounTitle}
        @click=${() => void this._openMovieDetail(m)}
      >
        <img
          src=${posterUrlForTile(m.posterUrl)}
          alt=""
          loading="lazy"
        />
        <span class="poster-caption">
          ${m.title}
          ${this.app === "sonarr"
            ? html`<span class="poster-status"
                >${this._seriesCaption(m as SeriesSlim)}</span
              >`
            : nothing}
        </span>
      </button>
    `;
  }

  private _renderIssues() {
    if (this._loading) {
      return html`<div data-screen="I02" class="skeleton-block"></div>`;
    }
    return renderIssuesPanel(
      this._state?.health ?? [],
      this._state?.disk_space ?? [],
      this.config,
      this._offline,
      this._profile.product,
    );
  }

  private _renderDownloading() {
    if (this._loading && !this._state?.queue) {
      return html`<div data-screen="D05" class="skeleton-block"></div>`;
    }
    const rows = this._queueRecords();
    if (!rows.length) {
      return html`
        <div data-screen="D02" class="download-empty">
          <p>
            <ha-icon icon="mdi:check-circle"></ha-icon> Nothing downloading
          </p>
          <p class="hint-muted">
            Active downloads will appear here as poster tiles.
          </p>
        </div>
      `;
    }
    const listScreen = this._layoutTablet ? "D01T" : "D01";
    return html`
      <div data-screen=${listScreen} class="download-pane">
        <div class="download-scroll">
          <div
            class="download-grid"
            style="--arr-cols: ${this._posterColumns}"
            role="list"
          >
            ${rows.map((row) => this._renderQueueTile(row))}
          </div>
        </div>
      </div>
    `;
  }

  private _renderQueueTile(row: QueueItem) {
    const title = this._queueTitle(row);
    const failed = (row.status || "").toLowerCase() === "failed";
    const importAttn = (row.trackedDownloadStatus || "")
      .toLowerCase()
      .includes("import");
    const hide = this._hideDestructive;
    const pct = queueProgress(row);
    const exiting = this._exitingQueueIds.includes(row.id);
    const movieId = this._queueMediaId(row);
    const poster = movieId ? this._queuePosters[movieId] ?? "" : "";
    const metaLine = [
      row.quality?.quality?.name,
      row.size ? formatBytes(row.size) : "",
      row.timeleft,
    ]
      .filter(Boolean)
      .join(" · ");
    return html`
      <article
        class="queue-tile ${failed ? "attention" : importAttn ? "attention warn" : ""} ${exiting ? "exiting" : ""}"
        role="listitem"
        data-screen=${exiting ? "D06" : nothing}
        aria-label=${`${title}, ${queueStatusLabel(row)}`}
      >
        <div class="queue-tile-poster">
          <img src=${poster} alt="" loading="lazy" />
          <div
            class="queue-tile-progress"
            role="progressbar"
            aria-valuenow=${pct}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="${title} progress"
          >
            <div class="progress-fill" style="width: ${pct}%"></div>
          </div>
          <span class="queue-tile-status pill ${failed ? "failed" : ""}"
            >${queueStatusLabel(row)}</span
          >
          <div class="queue-tile-label">
            <p class="queue-tile-title">${title}</p>
            ${metaLine
              ? html`<p class="queue-tile-meta">${metaLine}</p>`
              : nothing}
          </div>
          ${!hide
            ? html`<button
                class="queue-tile-overflow"
                aria-label="More actions for ${title}"
                data-screen="D03"
                @click=${() => (this._queueOverflow = row)}
              >
                ⋮
              </button>`
            : nothing}
        </div>
        ${(!hide && failed) ||
        (hide && queueNeedsAttention(row)) ||
        (importAttn && row.outputPath)
          ? html`<div class="queue-tile-actions">
              ${!hide && failed
                ? html`<button
                    class="tile-action tile-action--danger tile-action--muted"
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
              ${hide && queueNeedsAttention(row)
                ? html`<p class="hint-muted" data-screen="D07T">
                    <ha-icon icon="mdi:information-outline"></ha-icon>
                    Removing is turned off on this dashboard.
                  </p>`
                : nothing}
              ${importAttn && row.outputPath
                ? html`<button
                    class="primary compact"
                    data-action="retry-import"
                    ?disabled=${this._offline}
                    @click=${() => void this._retryImport(row)}
                  >
                    Retry import
                  </button>`
                : nothing}
            </div>`
          : nothing}
      </article>
    `;
  }

  private _renderAdd() {
    const screen =
      this._addPhase === "added"
        ? "A05"
        : this._addPhase === "searching"
          ? "A02"
          : this._addPhase === "results"
            ? this._layoutTablet
              ? "A03T"
              : "A03"
            : this._addPhase === "no_results"
              ? "A06"
              : this._addPhase === "error"
                ? "A07"
                : "A01";
    const libraryUpcoming =
      this._addPhase === "start" && !this._addQuery.trim()
        ? this._addUpcoming
        : [];

    return html`
      <svg width="0" height="0" aria-hidden="true"></svg>
      <div data-screen=${screen} class="add-pane">
        <input
          class="search-field"
          placeholder="Search for a ${this._profile.noun} to add"
          aria-label="Search for a ${this._profile.noun} to add"
          ?disabled=${this._offline}
          .value=${this._addQuery}
          @input=${(e: Event) => {
            this._addQuery = (e.target as HTMLInputElement).value;
            this._scheduleLookup();
          }}
        />
        ${this.app === "sonarr" &&
        this._addPhase === "start" &&
        !this._addQuery.trim() &&
        this._upcomingEpisodes.length
          ? html`
              <section data-screen="A01" class="row-section">
                <h3>Upcoming</h3>
                <div class="episode-list">
                  ${this._upcomingEpisodes.map((ep) => {
                    const code = episodeCode(ep.seasonNumber, ep.episodeNumber);
                    const label = [ep.seriesTitle, code, ep.title]
                      .filter((part) => part)
                      .join(" · ");
                    return html`
                      <div class="episode-row">
                        <span>${label}</span>
                        <span class="episode-when"
                          >${formatAirDate(ep.airDateUtc)}</span
                        >
                      </div>
                    `;
                  })}
                </div>
              </section>
            `
          : nothing}
        ${this.app === "sonarr" &&
        this._addPhase === "start" &&
        !this._addQuery.trim() &&
        this._addRecent.length
          ? html`
              <section class="row-section" data-row="recent">
                <h3>Recently added</h3>
                <div
                  class="coming-grid"
                  style="--arr-cols: ${this._libraryColumns}"
                >
                  ${this._addRecent.map((series) => this._libraryTile(series))}
                </div>
              </section>
            `
          : nothing}
        ${this.app !== "sonarr" && libraryUpcoming.length
          ? html`
              <section data-screen="A01" class="row-section">
                <h3>Coming soon in your library</h3>
                <div
                  class="coming-grid"
                  style="--arr-cols: ${this._libraryColumns}"
                >
                  ${libraryUpcoming.map((m) => this._libraryTile(m))}
                </div>
              </section>
            `
          : nothing}
        ${this._addPhase === "searching"
          ? html`<div
              class="lookup-grid lookup-skeleton"
              style="--arr-cols: ${this._libraryColumns}"
              aria-busy="true"
            >
              ${[0, 1, 2, 3, 4, 5].map(
                () => html`<div class="lookup-card skeleton-poster"></div>`,
              )}
            </div>`
          : nothing}
        ${this._addPhase === "no_results"
          ? html`
              <p>No ${this._profile.plural} found for “${this._addQuery}”</p>
              <p class="hint-muted">
                Check the spelling, or try the original title or the year.
              </p>
            `
          : nothing}
        ${this._addPhase === "error"
          ? html`
              <p><strong>Search didn't work</strong></p>
              <p class="error-text">${this._addError}</p>
              <button class="primary" @click=${() => this._scheduleLookup(true)}>
                Try again
              </button>
            `
          : nothing}
        ${this._lookupResults.length && this._addPhase !== "searching"
          ? html`
              <div
                class="lookup-grid"
                role="list"
                style="--arr-cols: ${this._libraryColumns}"
              >
                ${this._lookupResults.map((r) => {
                  const lib = this._lookupLib[this._lookupLibKey(r)];
                  const poster = lookupPosterUrl(r);
                  const title = String(r.title ?? this._profile.nounTitle);
                  const year = r.year;
                  const label =
                    year != null && year !== ""
                      ? `${title} (${String(year)})`
                      : title;
                  const run =
                    this.app === "sonarr" ? seriesRunLabel(r.status) : "";
                  return html`
                    <article class="lookup-card" role="listitem">
                      ${poster
                        ? html`<img
                            class="lookup-poster"
                            src=${poster}
                            alt=""
                            loading="lazy"
                          />`
                        : html`<div
                            class="lookup-poster lookup-poster--empty"
                          ></div>`}
                      <div class="lookup-title">
                        <span>${label}</span>
                        ${run
                          ? html`<span class="lookup-status">${run}</span>`
                          : nothing}
                        ${this.app !== "sonarr" && lookupComingSoon(r)
                          ? html`<span class="lookup-soon">Soon</span>`
                          : nothing}
                      </div>
                      <div class="lookup-actions">
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
                                data-action=${this.app === "sonarr"
                                  ? "add-series"
                                  : "add-movie"}
                                ?disabled=${this._offline}
                                @click=${() => this._openAddSheet(r)}
                              >
                                Add ${this._profile.noun}
                              </button>
                            `}
                      </div>
                    </article>
                  `;
                })}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private _detailBody(item: LibraryItem, sidePanel = false) {
    if (this.app === "sonarr") {
      return this._seriesDetailBody(item as SeriesSlim, sidePanel);
    }
    const m = item as MovieSlim;
    const extra = this._detailExtra;
    const hide = this._hideDestructive;
    const size = m.sizeOnDisk;
    const screen =
      hide && this._layoutTablet
        ? "M12T"
        : sidePanel
          ? "M01T"
          : m.hasFile
            ? "M01"
            : "M02";
    return html`
      <div data-screen=${screen}>
      <button
        class="text"
        @click=${() => this._closeMovieDetail()}
      >
        ← Back
      </button>
      <h2>${m.title} (${m.year})</h2>
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
          @click=${() => {
            this._qualityPendingId =
              this._selectedMovie?.qualityProfileId ??
              this._state?.quality_profiles?.[0]?.id;
            this._qualityOpen = true;
          }}
        >
          Change quality profile
        </button>
      </div>
      ${!hide
        ? html`
            <section>
              <h3>Fix or remove</h3>
              ${m.hasFile
                ? html`<button
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
                        showBlockCheckbox: Boolean(
                          (
                            this._detailExtra?.grabbed_history as
                              | unknown[]
                              | undefined
                          )?.length,
                        ),
                      })}
                  >
                    Delete file & redownload
                  </button>`
                : nothing}
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
                Remove ${this._profile.noun}
              </button>
            </section>
          `
        : nothing}
      </div>
    `;
  }

  private _seriesDetailBody(series: SeriesSlim, sidePanel = false) {
    const extra = this._detailExtra;
    const hide = this._hideDestructive;
    const seasons = (
      (extra?.seasons as SeriesSeason[] | undefined) ??
      series.seasons ??
      []
    )
      .slice()
      .sort((a, b) => a.seasonNumber - b.seasonNumber);
    const run = seriesRunLabel(series.status ?? extra?.status);
    const episodes = `${series.episodeFileCount ?? 0}/${series.episodeCount ?? 0}`;
    const screen = sidePanel ? "M01T" : series.hasFile ? "M01" : "M02";
    return html`
      <div data-screen=${screen}>
        <button class="text" @click=${() => this._closeMovieDetail()}>
          ← Back
        </button>
        <h2>${series.title}${series.year ? ` (${series.year})` : ""}</h2>
        <img
          class="detail-poster"
          src=${series.posterUrl ?? ""}
          alt=""
          loading="lazy"
        />
        <dl class="detail-dl">
          <dt>Network</dt>
          <dd>${series.network ?? (extra?.network as string) ?? "—"}</dd>
          <dt>Status</dt>
          <dd>${run || series.status || "—"}</dd>
          <dt>Seasons</dt>
            <dd>${series.seasonCount ?? (seasons.length || "—")}</dd>
          <dt>Episodes</dt>
          <dd>${episodes}</dd>
        </dl>
        <p class="overview">
          ${series.overview ?? (extra?.overview as string) ?? ""}
        </p>
        <label>
          <input
            type="checkbox"
            role="switch"
            .checked=${series.monitored ?? true}
            ?disabled=${this._offline}
            @change=${(e: Event) =>
              void this._setMonitored(
                series.id,
                (e.target as HTMLInputElement).checked,
                series.title,
              )}
          />
          Monitored
        </label>
        ${seasons.length
          ? html`
              <section>
                <h3>Seasons</h3>
                ${seasons.map((season) => this._seasonRow(series, season))}
              </section>
            `
          : nothing}
        <div class="detail-actions">
          <button
            class="primary"
            ?disabled=${this._offline}
            @click=${() => void this._movieSearch(series)}
          >
            Search series
          </button>
          <button
            class="primary"
            data-screen="M04"
            ?disabled=${this._offline}
            @click=${() => void this._openManualSearch(series)}
          >
            Manual search
          </button>
          <button
            class="text"
            data-screen="M08"
            ?disabled=${this._offline}
            @click=${() => {
              this._qualityPendingId =
                this._selectedMovie?.qualityProfileId ??
                this._state?.quality_profiles?.[0]?.id;
              this._qualityOpen = true;
            }}
          >
            Change quality profile
          </button>
        </div>
        ${hide
          ? nothing
          : html`
              <section>
                <h3>Fix or remove</h3>
                <button
                  class="outline-danger"
                  data-action="remove-series"
                  ?disabled=${this._offline}
                  @click=${() =>
                    this._openConfirm("m10", {
                      title: series.title,
                      series_id: series.id,
                    })}
                >
                  Remove series
                </button>
              </section>
            `}
      </div>
    `;
  }

  private _seasonRow(series: SeriesSlim, season: SeriesSeason) {
    const name =
      season.seasonNumber === 0
        ? "Specials"
        : `Season ${season.seasonNumber}`;
    const files = season.episodeFileCount ?? 0;
    const total = season.episodeCount ?? 0;
    return html`
      <div class="season-row">
        <div class="season-copy">
          <strong>${name}</strong>
          <div class="hint-muted">${files}/${total} episodes</div>
        </div>
        <label>
          <input
            type="checkbox"
            role="switch"
            aria-label=${`Monitor ${name}`}
            .checked=${season.monitored ?? false}
            ?disabled=${this._offline}
            @change=${(e: Event) =>
              void this._setSeasonMonitored(
                series.id,
                season.seasonNumber,
                (e.target as HTMLInputElement).checked,
              )}
          />
          Monitor
        </label>
        <button
          class="text"
          ?disabled=${this._offline}
          @click=${() =>
            void this._seasonSearch(series.id, season.seasonNumber)}
        >
          Search
        </button>
      </div>
    `;
  }

  private _renderDetailPanel() {
    const m = this._selectedMovie;
    if (!m) return nothing;
    return html`
      <aside class="side-panel">${this._detailBody(m, true)}</aside>
    `;
  }

  private _renderDetailDialog() {
    const m = this._selectedMovie;
    if (!m) return nothing;
    const dialogScreen = this._searchAgainBusy
      ? "M03"
      : m.hasFile
        ? "M01"
        : "M02";
    return html`
      <div
        class="sheet-backdrop detail-popup-backdrop"
        @click=${(e: Event) => {
          if (e.target === e.currentTarget) this._closeMovieDetail();
        }}
      >
        <div
          class="sheet-panel detail-popup"
          role="dialog"
          aria-modal="true"
          aria-label=${`${m.title ?? this._profile.nounTitle} details`}
          data-screen=${dialogScreen}
        >
          ${this._detailBody(m, false)}
        </div>
      </div>
    `;
  }

  private _renderManualSearch() {
    const all = this._releases;
    const rejectedCount = all.filter((r) => r.approved === false).length;
    const approvedCount = all.filter((r) => r.approved !== false).length;
    const filtered = all.filter((r) =>
      this._showRejected ? true : r.approved !== false,
    );
    const sorted = sortReleases(filtered, this._releaseSort);
    const bestGuid = sorted.find((r) => r.approved !== false)?.guid;
    const screen = this._releaseBusy
      ? "M04"
      : !sorted.length
        ? "M11"
        : this._layoutTablet
          ? "M05T"
          : "M05";
    return html`
      <dialog open class="release-dialog" data-screen=${screen}>
        <button class="text" @click=${() => (this._manualMovieId = undefined)}>
          ← Back
        </button>
        <h2>Manual search</h2>
        ${this.app === "sonarr"
          ? this._episodes.length
            ? html`
                <label>
                  Episode
                  <select
                    aria-label="Episode"
                    data-field="episode"
                    .value=${String(this._episodeId ?? "")}
                    @change=${(e: Event) => {
                      const id = Number((e.target as HTMLSelectElement).value);
                      this._episodeId = id;
                      void this._loadEpisodeReleases(id);
                    }}
                  >
                    ${this._episodes.map((episode) => {
                      const code = episodeCode(
                        episode.seasonNumber,
                        episode.episodeNumber,
                      );
                      const label = [code, episode.title]
                        .filter((part) => part)
                        .join(" ");
                      return html`<option value=${String(episode.id)}>
                        ${label || "Episode"}
                      </option>`;
                    })}
                  </select>
                </label>
              `
            : this._episodesLoading
              ? html`<p>Loading episodes…</p>`
              : html`<p>No episodes on this series yet.</p>`
          : nothing}
        ${this.app === "sonarr" && !this._episodes.length
          ? nothing
          : html`
        <label>
          <input
            type="checkbox"
            role="switch"
            .checked=${this._showRejected}
            @change=${(e: Event) =>
              (this._showRejected = (e.target as HTMLInputElement).checked)}
          />
          Show rejected releases
        </label>
        ${this._releaseBusy
          ? html`
              <p>Searching indexers…</p>
              <p class="hint-muted">
                This can take up to a minute. You can close this and come back.
              </p>
              <div class="skeleton-list" aria-busy="true"></div>
            `
          : !sorted.length
            ? html`
                <p>No releases found</p>
                <p class="hint-muted">
                  None of your indexers have this ${
                    this.app === "sonarr" ? "episode" : this._profile.noun
                  } right now.
                  ${this._profile.product} keeps checking while it's monitored.
                </p>
              `
            : html`
                <div class="release-header">
                  <span
                    >${approvedCount} releases · ${rejectedCount} rejected</span
                  >
                  <select
                    aria-label="Sort releases"
                    .value=${this._releaseSort}
                    @change=${(e: Event) =>
                      (this._releaseSort = (e.target as HTMLSelectElement)
                        .value as ReleaseSort)}
                  >
                    <option value="match">Best match</option>
                    <option value="size">Size</option>
                    <option value="age">Age</option>
                    <option value="seeders">Seeders</option>
                  </select>
                </div>
                <div role="list">
                  ${sorted.map((r) => this._releaseRow(r, r.guid === bestGuid))}
                </div>
              `}
        `}
      </dialog>
    `;
  }

  private _releaseRow(r: ReleaseRow, bestMatch: boolean) {
    const rejected = r.approved === false;
    const reasons = (r.rejections ?? []).join(" · ");
    const peers =
      r.protocol === "usenet" || r.seeders == null
        ? "Usenet"
        : `${r.seeders} seeders`;
    return html`
      <div class="release-row ${rejected ? "rejected" : ""}" role="listitem">
        <div>
          <strong class="mono">${r.title ?? r.indexer ?? "Release"}</strong>
          <div class="release-header">
            <span class="release-chip">${releaseQualityName(r)}</span>
            <span class="mono"
              >${formatBytes(r.size)} · ${r.age ?? "?"}d · ${peers}</span
            >
            <span>${r.indexer ?? "—"}</span>
            <span class="release-chip"
              >Score ${r.customFormatScore ?? 0}</span
            >
            ${bestMatch && !rejected
              ? html`<span class="best-match-pill">Best match</span>`
              : nothing}
          </div>
          ${rejected
            ? html`<p class="hint-muted">
                <ha-icon icon="mdi:alert-outline"></ha-icon> Rejected:
                ${reasons}
              </p>`
            : nothing}
        </div>
        ${rejected && this._hideDestructive
          ? nothing
          : html`<button
              class="${rejected ? "text" : "primary"}"
              ?disabled=${this._offline || this._releaseBusy}
              @click=${() => this._grabRelease(r, rejected, reasons)}
            >
              ${rejected ? "Grab anyway" : "Grab"}
            </button>`}
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
      this._grabOkScreen = true;
      window.setTimeout(() => (this._grabOkScreen = false), 4000);
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
    showActionFailure(this, command, err, this._profile.product);
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
          await this._ws(this._profile.commands.remove, {
            [this._profile.idField]: payload[this._profile.idField],
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
          await this._animateQueueExit(Number(payload.queue_id));
          break;
        case "d04b":
          await this._ws("queue_remove", {
            queue_id: payload.queue_id,
            remove_from_client: this._confirm.removeFromClient ?? true,
          });
          showToast(this, toastRemoveQueue(String(payload.title)));
          await this._animateQueueExit(Number(payload.queue_id));
          break;
        case "m06": {
          const rel = payload.release as ReleaseRow;
          await this._ws("grab_release", { release: rel });
          showToast(this, toastGrab());
          this._manualMovieId = undefined;
          break;
        }
        case null:
          break;
        default: {
          const _exhaustive: never = kind;
          void _exhaustive;
          break;
        }
      }
      if (kind !== "d04" && kind !== "d04b") {
        await this._refresh();
      }
    } catch (err) {
      const cmd =
        kind === "m10"
          ? this._profile.commands.remove
          : kind === "m09"
            ? "delete_file_redownload"
            : kind === "m06"
              ? "grab_release"
              : kind === "d04" || kind === "d04b"
                ? "queue_remove"
                : kind === null
                  ? "queue_remove"
                  : neverCommand(kind);
      this._fail(cmd, err);
    } finally {
      this._confirmBusy = false;
      this._confirm = null;
    }
  }

  private async _animateQueueExit(queueId: number): Promise<void> {
    await animateQueueRowExit(() => {
      if (!this._exitingQueueIds.includes(queueId)) {
        this._exitingQueueIds = [...this._exitingQueueIds, queueId];
      }
    });
    await this._refresh();
    this._exitingQueueIds = this._exitingQueueIds.filter((id) => id !== queueId);
  }

  private async _retryImport(row: QueueItem): Promise<void> {
    try {
      await this._ws("retry_import", {
        output_path: row.outputPath,
        download_client_id: row.downloadId,
      });
      showToast(this, toastRetryImport(this._queueTitle(row)));
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
      await this._ws(this._profile.commands.setMonitored, {
        [this._profile.idField]: movieId,
        monitored,
      });
      showToast(
        this,
        monitored
          ? toastMonitorOn(title ?? this._profile.nounTitle)
          : toastMonitorOff(title ?? this._profile.nounTitle, this._profile.product),
      );
      await this._refresh();
    } catch (err) {
      this._fail(this._profile.commands.setMonitored, err);
    }
  }

  private async _movieSearch(m: LibraryItem): Promise<void> {
    this._searchAgainBusy = true;
    try {
      await this._ws(this._profile.commands.search, {
        [this._profile.idField]: m.id,
      });
      showToast(this, toastSearchAgain(m.title));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("not_found") || msg.includes("gone")) {
        showToast(this, toastGone(this._profile.noun));
        this._selectedMovie = undefined;
      } else {
        this._fail(this._profile.commands.search, err);
      }
    } finally {
      this._searchAgainBusy = false;
    }
  }

  private async _seasonSearch(
    seriesId: number,
    seasonNumber: number,
  ): Promise<void> {
    try {
      await this._ws(this._profile.commands.seasonSearch, {
        series_id: seriesId,
        season_number: seasonNumber,
      });
      showToast(this, toastSearchAgain(`season ${seasonNumber}`));
    } catch (err) {
      this._fail(this._profile.commands.seasonSearch, err);
    }
  }

  private async _setSeasonMonitored(
    seriesId: number,
    seasonNumber: number,
    monitored: boolean,
  ): Promise<void> {
    try {
      await this._ws(this._profile.commands.setSeasonMonitored, {
        series_id: seriesId,
        season_number: seasonNumber,
        monitored,
      });
      showToast(
        this,
        monitored
          ? toastMonitorOn(`season ${seasonNumber}`)
          : toastMonitorOff(`season ${seasonNumber}`, this._profile.product),
      );
    } catch (err) {
      this._fail(this._profile.commands.setSeasonMonitored, err);
    }
  }

  private async _openManualSearch(m: LibraryItem): Promise<void> {
    if (this.app !== "sonarr") {
      await this._loadReleases(m.id);
      return;
    }
    this._manualMovieId = m.id;
    this._releases = [];
    this._episodes = [];
    this._episodeId = undefined;
    this._episodesLoading = true;
    try {
      const res = (await this._ws("get_episodes", {
        series_id: m.id,
      })) as { episodes?: SeriesEpisode[] };
      this._episodes = res.episodes ?? [];
      const first =
        this._episodes.find((episode) => !episode.hasFile) ??
        this._episodes[0];
      this._episodeId = first?.id;
    } catch (err) {
      this._fail("get_episodes", err);
      this._episodes = [];
    } finally {
      this._episodesLoading = false;
    }
    if (this._episodeId != null) {
      await this._loadEpisodeReleases(this._episodeId);
    }
  }

  private async _saveQualityProfile(): Promise<void> {
    const profileId = this._qualityPendingId;
    const m = this._selectedMovie;
    if (!m || profileId == null) return;
    const profiles = this._state?.quality_profiles ?? [];
    const name = profiles.find((p) => p.id === profileId)?.name ?? "profile";
    this._qualityBusy = true;
    try {
      await this._ws(this._profile.commands.setQuality, {
        [this._profile.idField]: m.id,
        quality_profile_id: profileId,
        search: this._qualitySearch,
      });
      showToast(this, toastProfile(name, this._qualitySearch));
      this._qualityOpen = false;
      await this._refresh();
    } catch (err) {
      this._fail(this._profile.commands.setQuality, err);
    } finally {
      this._qualityBusy = false;
    }
  }

  public getCardSize(): number {
    return this._compact ? 4 : 8;
  }
}

function neverCommand(kind: never): string {
  return kind;
}

defineElement("arr-card", ArrDashboardCard);

class ArrMoviesCard extends ArrDashboardCard {}

class ArrSeriesCard extends ArrDashboardCard {
  protected override app: ArrApp = "sonarr";
}

defineElement("arr-movies-card", ArrMoviesCard);
defineElement("arr-series-card", ArrSeriesCard);

declare global {
  interface HTMLElementTagNameMap {
    "arr-card": ArrDashboardCard;
  }
}

import "./editor";

(window as unknown as { customCards?: unknown[] }).customCards =
  (window as unknown as { customCards?: unknown[] }).customCards ?? [];
(window as unknown as { customCards: unknown[] }).customCards.push(
  {
    type: "custom:arr-movies-card",
    name: "Arr Dashboard",
    description: "Radarr library, queue, and add card",
    preview: true,
    documentationURL: "https://github.com/SCWPretorius/ha-arr-dashboard",
  },
  {
    type: "custom:arr-series-card",
    name: "Arr Series",
    icon: "mdi:television",
    description: "Sonarr library, queue, and add card",
    preview: true,
    documentationURL: "https://github.com/SCWPretorius/ha-arr-dashboard",
  },
);

export function getConfigElement() {
  return document.createElement("arr-card-editor");
}

export function getStubConfig(hass: HomeAssistant) {
  void hass;
  return { type: "custom:arr-card", instance: "" };
}