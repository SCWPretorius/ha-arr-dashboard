export function formatBytes(bytes?: number): string {
  if (!bytes) return "";
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(0)} MB`;
  return `${bytes} B`;
}

export function formatAirDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatRelative(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs} hr ago`;
  return d.toLocaleDateString();
}

export function queueProgress(row: {
  size?: number;
  sizeleft?: number;
}): number {
  const size = row.size ?? 0;
  const left = row.sizeleft ?? size;
  if (!size) return 0;
  return Math.min(100, Math.max(0, Math.round(((size - left) / size) * 100)));
}

export function queueStatusLabel(row: {
  status?: string;
  trackedDownloadStatus?: string;
}): string {
  const st = row.status ?? "Queued";
  const tr = row.trackedDownloadStatus;
  if (tr && tr !== st) return `${st} · ${tr}`;
  return st;
}