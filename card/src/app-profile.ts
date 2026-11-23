export type ArrApp = "radarr" | "sonarr";

export type MonitorMode =
  | "all"
  | "future"
  | "missing"
  | "existing"
  | "firstSeason"
  | "latestSeason"
  | "none";

export interface AppCommands {
  add: "add_movie" | "add_series";
  get: "get_movie" | "get_series";
  search: "movie_search" | "series_search";
  seasonSearch: "season_search";
  remove: "remove_movie" | "remove_series";
  setMonitored: "set_monitored" | "set_series_monitored";
  setSeasonMonitored: "set_season_monitored";
  setQuality: "set_quality_profile" | "set_series_quality_profile";
}

export interface AppProfile {
  app: ArrApp;
  noun: "movie" | "series";
  nounTitle: "Movie" | "Series";
  plural: "movies" | "series";
  product: "Radarr" | "Sonarr";
  defaultTitle: "Movies" | "Series";
  defaultIcon: "mdi:movie-open" | "mdi:television";
  cardType: "custom:arr-movies-card" | "custom:arr-series-card";
  idField: "movie_id" | "series_id";
  commands: AppCommands;
}

const RADARR_PROFILE: AppProfile = {
  app: "radarr",
  noun: "movie",
  nounTitle: "Movie",
  plural: "movies",
  product: "Radarr",
  defaultTitle: "Movies",
  defaultIcon: "mdi:movie-open",
  cardType: "custom:arr-movies-card",
  idField: "movie_id",
  commands: {
    add: "add_movie",
    get: "get_movie",
    search: "movie_search",
    seasonSearch: "season_search",
    remove: "remove_movie",
    setMonitored: "set_monitored",
    setSeasonMonitored: "set_season_monitored",
    setQuality: "set_quality_profile",
  },
};

const SONARR_PROFILE: AppProfile = {
  app: "sonarr",
  noun: "series",
  nounTitle: "Series",
  plural: "series",
  product: "Sonarr",
  defaultTitle: "Series",
  defaultIcon: "mdi:television",
  cardType: "custom:arr-series-card",
  idField: "series_id",
  commands: {
    add: "add_series",
    get: "get_series",
    search: "series_search",
    seasonSearch: "season_search",
    remove: "remove_series",
    setMonitored: "set_series_monitored",
    setSeasonMonitored: "set_season_monitored",
    setQuality: "set_series_quality_profile",
  },
};

export function profileFor(app: ArrApp): AppProfile {
  switch (app) {
    case "radarr":
      return RADARR_PROFILE;
    case "sonarr":
      return SONARR_PROFILE;
    default: {
      const _never: never = app;
      return _never;
    }
  }
}

export function isSeriesCardType(type: string | undefined): boolean {
  return (type ?? "").includes("arr-series-card");
}

export const MONITOR_MODES: readonly MonitorMode[] = [
  "all",
  "future",
  "missing",
  "existing",
  "firstSeason",
  "latestSeason",
  "none",
];

export function isMonitorMode(value: unknown): value is MonitorMode {
  return (
    value === "all" ||
    value === "future" ||
    value === "missing" ||
    value === "existing" ||
    value === "firstSeason" ||
    value === "latestSeason" ||
    value === "none"
  );
}

export function monitorLabel(mode: MonitorMode): string {
  switch (mode) {
    case "all":
      return "All episodes";
    case "future":
      return "Future episodes";
    case "missing":
      return "Missing episodes";
    case "existing":
      return "Existing episodes";
    case "firstSeason":
      return "First season";
    case "latestSeason":
      return "Latest season";
    case "none":
      return "None";
    default: {
      const _never: never = mode;
      return _never;
    }
  }
}

export function seriesRunLabel(status: unknown): "Continuing" | "Ended" | "" {
  const value = String(status ?? "").toLowerCase();
  if (value === "continuing") return "Continuing";
  if (value === "ended") return "Ended";
  return "";
}

export function episodeCode(
  seasonNumber: number | undefined,
  episodeNumber: number | undefined,
): string {
  if (seasonNumber == null || episodeNumber == null) return "";
  const season = String(seasonNumber).padStart(2, "0");
  const episode = String(episodeNumber).padStart(2, "0");
  return `S${season}E${episode}`;
}
