import type { ArrApp } from "./app-profile";
import type { HomeAssistant } from "./types";

export interface ArrState {
  reachable: boolean;
  app?: ArrApp;
  movies?: MovieSlim[];
  series?: SeriesSlim[];
  library_revision?: string;
  queue: { records?: QueueItem[]; totalRecords?: number };
  queue_count: number;
  health: HealthItem[];
  disk_space: DiskItem[];
  root_folders: RootFolder[];
  quality_profiles: QualityProfile[];
  system: Record<string, unknown>;
  last_success?: string;
}

export interface MovieSlim {
  id: number;
  title: string;
  year?: number;
  monitored?: boolean;
  hasFile?: boolean;
  posterUrl?: string;
  quality?: string;
  sizeOnDisk?: number;
  status?: string;
  tmdbId?: number;
  imdbId?: string;
  added?: string;
  overview?: string;
  runtime?: number;
  certification?: string;
  path?: string;
  qualityProfileId?: number;
}

export interface SeriesSeason {
  seasonNumber: number;
  monitored?: boolean;
  episodeCount?: number;
  episodeFileCount?: number;
}

export interface SeriesSlim {
  id: number;
  title: string;
  year?: number;
  tvdbId?: number;
  network?: string;
  status?: string;
  seasonCount?: number;
  episodeCount?: number;
  episodeFileCount?: number;
  hasFile?: boolean;
  monitored?: boolean;
  added?: string;
  posterUrl?: string;
  qualityProfileId?: number;
  path?: string;
  overview?: string;
  seasons?: SeriesSeason[];
}

export interface CalendarEpisode {
  seriesId: number;
  seriesTitle: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  airDateUtc?: string;
}

export type LibraryItem = MovieSlim | SeriesSlim;

export interface QueueItem {
  id: number;
  title?: string;
  status?: string;
  trackedDownloadStatus?: string;
  size?: number;
  sizeleft?: number;
  timeleft?: string;
  outputPath?: string;
  downloadId?: string;
  movie?: { title?: string; year?: number; id?: number };
  series?: { title?: string; id?: number };
  seasonNumber?: number;
  episodeNumber?: number;
  episode?: { title?: string; episodeNumber?: number };
  quality?: { quality?: { name?: string } };
  statusMessages?: unknown;
  errorMessage?: string;
}

export interface HealthItem {
  source: string;
  type: string;
  message: string;
}

export interface DiskItem {
  path: string;
  freeSpace: number;
  totalSpace: number;
}

export interface RootFolder {
  id: number;
  path: string;
  freeSpace: number;
}

export interface LibraryPageResult {
  total: number;
  revision: string;
  offset: number;
  items: LibraryItem[];
}

export interface ArrInstanceInfo {
  entry_id: string;
  title: string;
  app: ArrApp;
}

export interface ResolvedArrEntry {
  entryId: string;
  /** App from list_instances. Missing when the command did not identify the entry. */
  app?: ArrApp;
  /** Named entry belongs to the other app. */
  mismatch: boolean;
}

export interface QualityProfile {
  id: number;
  name: string;
  items?: { quality?: { name?: string }; name?: string }[];
  cutoff?: { name?: string };
}

export interface ConfigEntryFragment {
  entry_id: string;
  domain: string;
  title: string;
}

const posterSignCache = new Map<string, string>();

export async function signPosterPath(
  hass: HomeAssistant,
  path: string,
): Promise<string> {
  if (!path.startsWith("/api/arr_dashboard")) {
    return path;
  }
  const cached = posterSignCache.get(path);
  if (cached) return cached;
  const res = (await hass.callWS({
    type: "auth/sign_path",
    path,
    expires: 60 * 60,
  })) as { path: string };
  posterSignCache.set(path, res.path);
  return res.path;
}

export async function callArr(
  hass: HomeAssistant,
  entryId: string,
  command: string,
  data?: Record<string, unknown>,
): Promise<unknown> {
  return hass.callWS({
    type: "arr_dashboard",
    entry_id: entryId,
    command,
    data: data ?? {},
  });
}

function asApp(value: unknown): ArrApp {
  return value === "sonarr" ? "sonarr" : "radarr";
}

async function fetchInstances(
  hass: HomeAssistant,
  entryId: string,
): Promise<ArrInstanceInfo[] | undefined> {
  try {
    const res = (await hass.callWS({
      type: "arr_dashboard",
      entry_id: entryId,
      command: "list_instances",
      data: {},
    })) as { instances?: ArrInstanceInfo[] };
    if (!Array.isArray(res?.instances)) return undefined;
    return res.instances.map((row) => ({
      entry_id: row.entry_id,
      title: row.title,
      app: asApp(row.app),
    }));
  } catch {
    return undefined;
  }
}

/**
 * Bind a card to one config entry.
 * With no instance name, only an entry of `app` is chosen.
 * A named entry of the other app is returned with mismatch set.
 * Entries missing from list_instances count as Radarr.
 */
export async function resolveArrEntry(
  hass: HomeAssistant,
  instance: string | undefined,
  app: ArrApp,
): Promise<ResolvedArrEntry | undefined> {
  const entries = (await hass.callWS({
    type: "config_entries/get",
    domain: "arr_dashboard",
  })) as ConfigEntryFragment[];
  const arr = entries.filter((e) => e.domain === "arr_dashboard");
  if (!arr.length) return undefined;

  const listed = await fetchInstances(hass, arr[0].entry_id);
  const known = new Map<string, ArrApp>();
  if (listed) {
    for (const row of listed) known.set(row.entry_id, asApp(row.app));
  }

  const appOf = (entryId: string): ArrApp | undefined =>
    listed ? (known.get(entryId) ?? "radarr") : undefined;

  if (!instance) {
    const match = arr.find((entry) => (appOf(entry.entry_id) ?? "radarr") === app);
    if (!match) return undefined;
    return { entryId: match.entry_id, app: appOf(match.entry_id) ?? app, mismatch: false };
  }

  const match = arr.find(
    (entry) => entry.entry_id === instance || entry.title === instance,
  );
  if (!match) return undefined;
  const listedApp = appOf(match.entry_id);
  if (listedApp && listedApp !== app) {
    return { entryId: match.entry_id, app: listedApp, mismatch: true };
  }
  return { entryId: match.entry_id, app: listedApp, mismatch: false };
}

export async function resolveEntryId(
  hass: HomeAssistant,
  instance?: string,
  app: ArrApp = "radarr",
): Promise<string | undefined> {
  const resolved = await resolveArrEntry(hass, instance, app);
  if (!resolved || resolved.mismatch) return undefined;
  return resolved.entryId;
}