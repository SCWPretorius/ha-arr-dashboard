"""Constants for the Arr Dashboard integration."""

from typing import Literal

DOMAIN = "arr_dashboard"

CONF_VERIFY_SSL = "verify_ssl"
CONF_POLL_INTERVAL = "poll_interval"
CONF_APP = "app"

APP_RADARR = "radarr"
APP_SONARR = "sonarr"
AppKind = Literal["radarr", "sonarr"]

DEFAULT_POLL_INTERVAL = 30
MIN_ARR_VERSION = (4, 0, 0)
MIN_RADARR_VERSION = MIN_ARR_VERSION
MIN_SONARR_VERSION = MIN_ARR_VERSION

ATTR_INSTANCE = "instance"
ATTR_MEDIA_TYPE = "media_type"

MEDIA_TYPE_MOVIE = "movie"
MEDIA_TYPE_SERIES = "series"

WS_TYPE_ARR_DASHBOARD = "arr_dashboard"

SERVICE_LOOKUP = "lookup"
SERVICE_ADD_MOVIE = "add_movie"
SERVICE_MOVIE_SEARCH = "movie_search"
SERVICE_RELEASE_SEARCH = "release_search"
SERVICE_GRAB_RELEASE = "grab_release"
SERVICE_QUEUE_REMOVE = "queue_remove"
SERVICE_QUEUE_REMOVE_BLOCKLIST = "queue_remove_blocklist"
SERVICE_QUEUE_REMOVE_SEARCH_AGAIN = "queue_remove_search_again"
SERVICE_RETRY_IMPORT = "retry_import"
SERVICE_DELETE_FILE_REDOWNLOAD = "delete_file_redownload"
SERVICE_REMOVE_MOVIE = "remove_movie"
SERVICE_SET_MONITORED = "set_monitored"
SERVICE_SET_QUALITY_PROFILE = "set_quality_profile"

# Spec §12 event names (HA automations)
EVENT_DOWNLOAD_FAILED = "arr_download_failed"
EVENT_DOWNLOAD_COMPLETED = "arr_download_completed"
EVENT_MOVIE_ADDED = "arr_movie_added"
EVENT_SERIES_ADDED = "arr_series_added"
EVENT_HEALTH_ISSUE = "arr_health_issue"

RADARR_MIN_VERSION_STR = "4.0.0"