# Arr Dashboard

Home Assistant custom integration and bundled Lovelace cards for [Radarr](https://radarr.video/) and [Sonarr](https://sonarr.tv/). One HACS install adds the backend and registers both cards. Radarr and Sonarr are separate config entries, and each card sits on its own dashboard view.

<!-- Screenshot coming soon — add `docs/screenshot.png` and uncomment: -->
<!-- ![Arr Dashboard Lovelace card](docs/screenshot.png) -->

## Requirements

- **Home Assistant** 2026.2 or newer
- **HACS** (Home Assistant Community Store)
- **Radarr** 4.0 or newer, reachable from Home Assistant (Radarr **v3 REST API**)
- **Sonarr** 4.0 or newer, if you use the series card (Sonarr **v3 REST API**)

## Install (HACS)

1. In Home Assistant, open **HACS**.
2. Open the **Integrations** tab.
3. Tap the **⋮** (three-dot) menu → **Custom repositories**.
4. Add the repository URL `https://github.com/SCWPretorius/ha-arr-dashboard` and set category **Integration**.
5. Search for **Arr Dashboard**, choose **Download**, then **Restart** Home Assistant.

## Add the integration

1. Go to **Settings → Devices & services**.
2. Tap **Add integration** and search for **Arr Dashboard**.
3. Choose **Radarr** or **Sonarr**. Each app is its own config entry. Add the integration a second time for the other app.
4. Enter:
   - **URL** — for example `http://192.168.1.10:7878` for Radarr or `http://192.168.1.10:8989` for Sonarr (HTTP or HTTPS).
   - **API key** — in Radarr or Sonarr: **Settings → General → Security → API Key**.
   - Optional: **Verify SSL**, **Name**. The name is the config entry title. The card `instance` option is that title or the entry id.

If the URL, API key, or app version is wrong, the config flow shows an error and does not finish setup. Radarr and Sonarr must be at least **4.0.0** (checked via `/api/v3/system/status`). An older entry with no `app` value is Radarr.

### Options

After setup, open the integration’s **Configure** (options flow) to set **Poll interval** (seconds, 5–300; default **30**). This controls how often the integration refreshes data for the cards and sensors.

## Add the Lovelace card

The integration serves and registers the card script automatically—**no manual Lovelace resource** is required in normal use.

The integration registers two cards. Put each one on its own view. **`instance`** is the config entry **title** or **entry id** (Settings → Devices & services). It is optional when only one entry of that app exists.

Movies view:

```yaml
type: custom:arr-movies-card
instance: Radarr
title: Movies
```

Series view:

```yaml
type: custom:arr-series-card
instance: Sonarr
title: Series
```

In the card picker these are **Arr Dashboard** (`custom:arr-movies-card`) and **Arr Series** (`custom:arr-series-card`, icon `mdi:television`). A card pointed at the other app shows a short mismatch message. Series detail lists seasons with monitor and search. It does not browse episodes.

`custom:arr-card` still works for existing dashboards and loads the movie card.

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
| `type` | string | — | Required: `custom:arr-movies-card`, `custom:arr-series-card`, or `custom:arr-card` (movies). |
| `instance` | string | *(first entry of that app)* | Config entry title or entry id. |
| `title` | string | `Movies` or `Series` | Card title in the header. Movies card defaults to Movies; series card defaults to Series. |
| `icon` | string | `mdi:movie-open` or `mdi:television` | Header icon. Movies card defaults to `mdi:movie-open`; series card defaults to `mdi:television`. |
| `tabs` | list | `add`, `downloading`, `library`, `issues` | Which tabs appear (at least one). |
| `default_tab` | string | `library` | Initial tab: `library`, `downloading`, `add`, or `issues`. |
| `compact` | `auto` \| boolean | `auto` | Compact layout; `auto` uses narrow width. |
| `layout` | `auto` \| `phone` \| `tablet` | `auto` | Layout preset for phone vs tablet. |
| `show_header_chips` | list | `[]` | Optional chips: `disk`, `queue`, `health`. |
| `upcoming_days` | number | `14` | Days ahead for upcoming titles on the **Add** tab. |
| `recent_days` | number | `7` | Days back for recent titles on the **Add** tab. |
| `library_sort` | string | `title` | Library sort: `title`, `added`, or `year`. |
| `add_defaults.quality_profile` | string | — | Default quality profile name when adding a movie or series. |
| `add_defaults.root_folder` | string | — | Default root folder path when adding a movie or series. |
| `add_defaults.minimum_availability` | string | `released` | Movies card only: `announced`, `inCinemas`, or `released`. |
| `add_defaults.search_on_add` | boolean | `true` | Start a search when adding a movie or series. |
| `add_defaults.monitor` | string | `all` | Series card only: `all`, `future`, `missing`, `existing`, `firstSeason`, `latestSeason`, or `none`. |
| `hide_destructive_actions` | boolean | `false` | Hides fix/remove-style buttons in this card’s UI only (see below). |
| `external_link` | string \| `false` | `false` | URL opened from the status sheet; empty input means disabled. |

Use the visual card editor in the dashboard UI for the same fields where available.

`hide_destructive_actions` only removes destructive buttons from this card’s UI (including rejected-release “Grab anyway”). It does **not** restrict who can call integration WebSocket commands; anyone signed in to Home Assistant can still run those actions from another client.

## Tabs

| Tab | What it does |
| --- | --- |
| **Library** | Poster grid of movies or series that have files; search, sort, scroll to load more, and open details. Series detail is seasons with monitor and search. |
| **Downloads** | Live download queue with progress, failures, and queue actions (refresh polls about every 5 seconds on this tab). |
| **Add** | Look up a movie or series, set profile and folder, and add it. Movies use availability; series use a monitor mode. Upcoming and recent windows sit on this tab. Recent series includes shows added in `recent_days` even when they have no episode files yet. |
| **Issues** | Health warnings and disk space from the integration; optional link via `external_link`. |

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
   url: /arr_dashboard/frontend/arr-dashboard-card.js?v=1.2.1
   type: module
   ```

   Replace `1.2.0` with the version in `custom_components/arr_dashboard/manifest.json`.

5. Clear the browser cache or the Home Assistant Companion app cache (Settings → troubleshoot / clear cache).

### Card shows it cannot find the instance

Add the matching integration entry first. `instance` is the entry title or entry id. A movie card needs the Radarr entry; a series card needs the Sonarr entry.

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