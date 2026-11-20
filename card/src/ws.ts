import type { HomeAssistant } from "./types";

export interface ArrState {
  reachable: boolean;
  movies: MovieSlim[];
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

export interface QualityProfile {
  id: number;
  name: string;
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

export async function resolveEntryId(
  hass: HomeAssistant,
  instance?: string,
): Promise<string | undefined> {
  const entries = (await hass.callWS({
    type: "config_entries/get",
    domain: "arr_dashboard",
  })) as ConfigEntryFragment[];
  const arr = entries.filter((e) => e.domain === "arr_dashboard");
  if (!arr.length) return undefined;
  if (!instance) return arr[0].entry_id;
  const match = arr.find(
    (e) => e.entry_id === instance || e.title === instance,
  );
  if (!match) return undefined;
  return match.entry_id;
}