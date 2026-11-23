# Arr Dashboard

Home Assistant custom integration and bundled Lovelace card for [Radarr](https://radarr.video/). One HACS install adds the backend connection and registers the card—browse your movie library, manage the download queue, add titles, and read Radarr health from a dashboard.

<!-- Screenshot coming soon — add `docs/screenshot.png` and uncomment: -->
<!-- ![Arr Dashboard Lovelace card](docs/screenshot.png) -->

## Requirements

- **Home Assistant** 2026.2 or newer
- **HACS** (Home Assistant Community Store)
- **Radarr** 4.0 or newer, reachable from Home Assistant (uses the Radarr **v3 REST API**)

## Install (HACS)

1. In Home Assistant, open **HACS**.
2. Open the **Integrations** tab.
3. Tap the **⋮** (three-dot) menu → **Custom repositories**.
4. Add the repository URL `https://github.com/SCWPretorius/ha-arr-dashboard` and set category **Integration**.
5. Search for **Arr Dashboard**, choose **Download**, then **Restart** Home Assistant.

## Add the integration

1. Go to **Settings → Devices & services**.
2. Tap **Add integration** and search for **Arr Dashboard**.
3. Enter:
   - **Radarr URL** — e.g. `http://192.168.1.10:7878` (HTTP or HTTPS).
   - **API key** — in Radarr: **Settings → General → Security → API Key**.
   - Optional: **Verify SSL**, **Name** (friendly title for this instance).

If the URL, key, or Radarr version is wrong, the config flow shows an error and does not finish setup. Radarr must be at least **4.0.0** (checked via `/api/v3/system/status`).

### Options

After setup, open the integration’s **Configure** (options flow) to set **Poll interval** (seconds, 5–300; default **30**). This controls how often the integration refreshes Radarr data for the card and sensors.

## Add the Lovelace card

The integration serves and registers the card script automatically—**no manual Lovelace resource** is required in normal use.

1. Edit your dashboard → **Add card** → search for **Arr Dashboard** (registered as `custom:arr-movies-card`).
2. Or add YAML, for example:

```yaml
type: custom:arr-movies-card
instance: radarr
```

- **`instance`** — optional when you have only one Arr Dashboard config entry. With multiple entries, set this to the integration entry **title** or **entry ID** (as shown under **Settings → Devices & services**).
- **`custom:arr-card`** still works for existing dashboards; it loads the same card element.

Minimal example with a few common options:

```yaml
type: custom:arr-movies-card
instance: radarr
title: Movies
default_tab: library
hide_destructive_actions: true
```

## Card configuration

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | string | — | Required: `custom:arr-movies-card` or `custom:arr-card`. |
| `instance` | string | *(first entry)* | Arr Dashboard config entry title or entry ID when multiple instances exist. |
| `title` | string | `Movies` | Card title in the header. |
| `icon` | string | `mdi:movie-open` | Header icon (MDI name). |
| `tabs` | list | `add`, `downloading`, `library`, `issues` | Which tabs appear (at least one). |
| `default_tab` | string | `library` | Initial tab: `library`, `downloading`, `add`, or `issues`. |
| `compact` | `auto` \| boolean | `auto` | Compact layout; `auto` uses narrow width. |
| `layout` | `auto` \| `phone` \| `tablet` | `auto` | Layout preset for phone vs tablet. |
| `show_header_chips` | list | `[]` | Optional chips: `disk`, `queue`, `health`. |
| `upcoming_days` | number | `14` | Days ahead for upcoming titles on the **Add** tab. |
| `recent_days` | number | `7` | Days back for recent titles on the **Add** tab. |
| `library_sort` | string | `title` | Library sort: `title`, `added`, or `year`. |
| `add_defaults.quality_profile` | string | — | Default quality profile name when adding a movie. |
| `add_defaults.root_folder` | string | — | Default root folder path when adding a movie. |
| `add_defaults.minimum_availability` | string | `released` | `announced`, `inCinemas`, or `released`. |
| `add_defaults.search_on_add` | boolean | `true` | Start Radarr search when adding a movie. |
| `hide_destructive_actions` | boolean | `false` | Hides fix/remove-style buttons in this card’s UI only (see below). |
| `external_link` | string \| `false` | `false` | URL opened from the status sheet; empty input means disabled. |

Use the visual card editor in the dashboard UI for the same fields where available.

`hide_destructive_actions` only removes destructive buttons from this card’s UI (including rejected-release “Grab anyway”). It does **not** restrict who can call integration WebSocket commands; anyone signed in to Home Assistant can still run those actions from another client.

## Tabs

| Tab | What it does |
| --- | --- |
| **Library** | Poster grid of movies on disk; search, sort, scroll to load more, and open movie details/actions. |
| **Downloads** | Live Radarr download queue with progress, failures, and queue actions (refresh polls about every 5 seconds on this tab). |
| **Add** | Look up movies, set profile/folder/availability, add to Radarr, and browse upcoming/recent windows. |
| **Issues** | Radarr health warnings and disk space from the integration; optional link via `external_link`. |

## Updating

1. In **HACS**, update **Arr Dashboard**.
2. **Restart** Home Assistant.

You do not need a browser hard refresh for card changes: the integration registers `/arr_dashboard/frontend/arr-dashboard-card.js?v=<version>` so the version query updates after an upgrade.

## Troubleshooting

### “Custom element doesn't exist” / card not found

1. **Restart** Home Assistant after installing or updating the integration.
2. Confirm **Arr Dashboard** is loaded: **Settings → Devices & services** → integration present and not in an error state.
3. In **Storage** Lovelace mode, check **Dashboard → Resources** for a module URL containing `/arr_dashboard/frontend/arr-dashboard-card.js`.
4. In **YAML** `resource_mode`, the integration still preloads the card via the frontend extra-JS URL when possible. If the card never loads, add a Lovelace resource manually:

   ```yaml
   url: /arr_dashboard/frontend/arr-dashboard-card.js?v=1.2.0
   type: module
   ```

   Replace `1.2.0` with the version in `custom_components/arr_dashboard/manifest.json`.

5. Clear the browser cache or the Home Assistant Companion app cache (Settings → troubleshoot / clear cache).

### Card shows “No Radarr instance”

Add the integration first. If you have more than one Arr Dashboard entry, set `instance` to the correct title or entry ID.

### Debug logs

Enable logging for the integration, then check **Settings → System → Logs**:

```yaml
logger:
  logs:
    custom_components.arr_dashboard: debug
```

## Development

```bash
pip install -r requirements_test.txt
PYTHONPATH=. python -m pytest -q
ruff check custom_components tests
cd card && npm ci && npm run build && npm test
```

## License

MIT License — Copyright (c) 2026 Schalk Pretorius. See [LICENSE](LICENSE).

Maintained by [@SCWPretorius](https://github.com/SCWPretorius). Issues: [GitHub Issues](https://github.com/SCWPretorius/ha-arr-dashboard/issues).