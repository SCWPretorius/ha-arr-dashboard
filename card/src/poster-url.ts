/** TMDb tile size for library grid/list thumbnails (see image.tmdb.org size docs). */
const TMDB_TILE_SIZE = "w185";

const TMDB_PREFIX = "https://image.tmdb.org/t/p/";

/** Prefer a smaller TMDb profile when the URL is a TMDb image; otherwise unchanged. */
export function posterUrlForTile(url: string | undefined): string {
  if (!url?.startsWith(TMDB_PREFIX)) {
    return url ?? "";
  }
  const rest = url.slice(TMDB_PREFIX.length);
  const slash = rest.indexOf("/");
  if (slash < 0) {
    return url;
  }
  const path = rest.slice(slash + 1);
  return `${TMDB_PREFIX}${TMDB_TILE_SIZE}/${path}`;
}