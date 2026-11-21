import type { MovieSlim, QueueItem } from "./ws";

export type LibraryChip = "all" | "missing" | "downloaded" | "in_queue";
export type LibrarySort = "title" | "added" | "year";

/** Matches `.library-scroll .poster-grid` padding and gap in styles.ts. */
const LIBRARY_GRID_PAD_X = 24;
const LIBRARY_GRID_GAP_X = 8;
const LIBRARY_GRID_ROW_PAD_Y = 12;
const LIBRARY_TILE_MIN = 160;

/**
 * How many posters fit across the library grid at this card width.
 * Wider cards add columns; posters stay near the minimum tile width.
 */
export function libraryPosterColumns(width: number): number {
  const available = Math.max(0, width - LIBRARY_GRID_PAD_X);
  const cols = Math.floor(
    (available + LIBRARY_GRID_GAP_X) / (LIBRARY_TILE_MIN + LIBRARY_GRID_GAP_X),
  );
  return Math.max(2, cols);
}

/** Virtual-row height for a 2:3 poster plus the row's vertical padding. */
export function libraryPosterRowHeight(width: number, columns: number): number {
  const cols = Math.max(1, columns);
  const available = Math.max(0, width - LIBRARY_GRID_PAD_X);
  const tileW =
    (available - LIBRARY_GRID_GAP_X * Math.max(0, cols - 1)) / cols;
  return Math.ceil(Math.max(0, tileW) * (3 / 2) + LIBRARY_GRID_ROW_PAD_Y);
}

export function inLibrary(
  movies: MovieSlim[],
  hit: { tmdbId?: number; title?: string; year?: number },
): MovieSlim | undefined {
  if (hit.tmdbId) {
    const m = movies.find((x) => x.tmdbId === hit.tmdbId);
    if (m) return m;
  }
  const t = (hit.title ?? "").toLowerCase();
  return movies.find(
    (x) => x.title?.toLowerCase() === t && x.year === hit.year,
  );
}

export function filterMovies(
  movies: MovieSlim[],
  chip: LibraryChip,
  search: string,
  queue: QueueItem[],
): MovieSlim[] {
  let list = [...movies];
  const q = search.trim().toLowerCase();
  if (q) {
    list = list.filter((m) => m.title?.toLowerCase().includes(q));
  }
  if (chip === "missing") {
    list = list.filter((m) => !m.hasFile);
  } else if (chip === "downloaded") {
    list = list.filter((m) => m.hasFile);
  } else if (chip === "in_queue") {
    const ids = new Set(
      queue.map((r) => r.movie?.id).filter((id): id is number => id != null),
    );
    list = list.filter((m) => ids.has(m.id));
  }
  return list;
}

export function sortMovies(
  movies: MovieSlim[],
  sort: LibrarySort,
): MovieSlim[] {
  const list = [...movies];
  switch (sort) {
    case "added":
      list.sort((a, b) => (b.added ?? "").localeCompare(a.added ?? ""));
      break;
    case "year":
      list.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
      break;
    case "title":
    default:
      list.sort((a, b) =>
        (a.title ?? "").localeCompare(b.title ?? "", undefined, {
          sensitivity: "base",
        }),
      );
      break;
  }
  return list;
}

export function upcomingMovies(movies: MovieSlim[], _days: number): MovieSlim[] {
  void _days;
  return movies.filter((m) => {
    const st = (m.status ?? "").toLowerCase();
    return st === "incinemas" || st === "announced" || st === "in cinemas";
  }).slice(0, 12);
}

export function recentMovies(movies: MovieSlim[], days: number): MovieSlim[] {
  const since = Date.now() - days * 86400000;
  return movies
    .filter((m) => {
      if (!m.added) return false;
      return new Date(m.added).getTime() >= since;
    })
    .sort((a, b) => (b.added ?? "").localeCompare(a.added ?? ""))
    .slice(0, 12);
}

export function indexLetters(movies: MovieSlim[]): string[] {
  const letters = new Set<string>();
  for (const m of movies) {
    const ch = (m.title ?? "?")[0]?.toUpperCase();
    if (ch && /[A-Z]/.test(ch)) letters.add(ch);
    else letters.add("#");
  }
  return [...letters].sort();
}