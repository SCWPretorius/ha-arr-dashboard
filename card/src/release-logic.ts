import type { ReleaseRow } from "./types";

export type ReleaseSort = "match" | "size" | "age" | "seeders";

export function sortReleases(
  rows: ReleaseRow[],
  sort: ReleaseSort,
): ReleaseRow[] {
  const copy = [...rows];
  switch (sort) {
    case "size":
      copy.sort((a, b) => (b.size ?? 0) - (a.size ?? 0));
      break;
    case "age":
      copy.sort((a, b) => (a.age ?? 0) - (b.age ?? 0));
      break;
    case "seeders":
      copy.sort((a, b) => (b.seeders ?? 0) - (a.seeders ?? 0));
      break;
    case "match":
    default:
      break;
  }
  return copy;
}

export function releaseQualityName(release: ReleaseRow): string {
  return release.quality?.quality?.name ?? "—";
}