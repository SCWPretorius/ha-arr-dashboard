/** Spec §10 confirm and §11 toast copy (exact labels). */

export function toastAdded(title: string, searchOn: boolean): string {
  return searchOn
    ? `Added ${title}. Searching for a download…`
    : `Added ${title}. It won't download until you search.`;
}

export function toastSearchAgain(title: string): string {
  return `Searching for ${title}…`;
}

export function toastGrab(): string {
  return "Sent to download client. Watch it in Downloading.";
}

export function toastRemoveQueue(title: string): string {
  return `Removed ${title} from downloads.`;
}

export function toastRemoveBlocklist(title: string, search: boolean): string {
  return search
    ? `Removed ${title} and blocked the release. Searching for another…`
    : `Removed ${title} and blocked the release.`;
}

export function toastRetryImport(title: string): string {
  return `Retrying import for ${title}…`;
}

export function toastImportDone(title: string): string {
  return `${title} is ready to watch.`;
}

export function toastProfile(name: string, searching: boolean): string {
  return searching
    ? `Quality profile set to ${name}. Searching…`
    : `Quality profile set to ${name}.`;
}

export function toastMonitorOn(title: string): string {
  return `Monitoring on for ${title}.`;
}

export function toastMonitorOff(title: string): string {
  return `Monitoring off for ${title}. Radarr won't download or upgrade it.`;
}

export function toastDeleteRedownload(title: string): string {
  return `Deleted the file. Searching for a new copy of ${title}…`;
}

export function toastRemoveMovie(title: string, deleted: boolean): string {
  return deleted
    ? `Removed ${title} and deleted its files.`
    : `Removed ${title}.`;
}

export function toastGone(): string {
  return "That movie was already removed.";
}

export function toastFailure(verb: string, message: string): string {
  return `Couldn't ${verb}. Radarr said: ${message}`;
}

export function toastRadarrBack(): string {
  return "Radarr is back.";
}

export const FAILURE_VERBS: Record<string, string> = {
  add_movie: "add the movie",
  movie_search: "start the search",
  grab_release: "send the release",
  queue_remove: "remove the download",
  retry_import: "retry the import",
  set_quality_profile: "change the profile",
  set_monitored: "update monitoring",
  delete_file_redownload: "delete the file",
  remove_movie: "remove the movie",
};