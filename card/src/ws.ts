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
    type: "config_entries/list",
  })) as { entry_id: string; domain: string; title: string }[];
  const arr = entries.filter((e) => e.domain === "arr_dashboard");
  if (!arr.length) return undefined;
  if (!instance) return arr[0].entry_id;
  const match = arr.find(
    (e) => e.entry_id === instance || e.title === instance,
  );
  return match?.entry_id ?? arr[0].entry_id;
}