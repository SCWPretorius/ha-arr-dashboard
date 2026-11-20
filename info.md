# Arr Dashboard

Radarr library, download queue, and add-movie card for Home Assistant — one HACS install bundles the integration and Lovelace card.

## Install

### (a) HACS custom repository

1. Publish this repository as a **public** GitHub repo (HACS requires public access for custom repositories).
2. In Home Assistant: **HACS → Integrations → ⋮ → Custom repositories**.
3. Add the repository URL and category **Integration**.
4. Search for **Arr Dashboard**, download, and restart Home Assistant.
5. **Settings → Devices & services → Add integration → Arr Dashboard** and enter your Radarr URL, API key, and options.

The Lovelace card JavaScript is bundled with the integration — no separate Dashboard repo or manual Resources entry.

### (b) Manual copy

1. Copy the folder `custom_components/arr_dashboard` to your Home Assistant `/config/custom_components/arr_dashboard`.
2. Restart Home Assistant.
3. Add the integration under **Settings → Devices & services**.

## Card YAML examples

**Wall tablet (Library default, hide destructive actions):**

```yaml
type: custom:arr-card
instance: radarr
title: Movies
layout: tablet
default_tab: library
hide_destructive_actions: true
show_rows: [upcoming, recent]
library_view: grid
library_sort: added
```

**Personal dashboard:**

```yaml
type: custom:arr-card
instance: radarr
default_tab: library
add_defaults:
  quality_profile: HD-1080p
  root_folder: /data/movies
  search_on_add: true
```

## Automation example (failed download event)

```yaml
alias: Movie download failed
triggers:
  - trigger: event
    event_type: arr_download_failed
actions:
  - action: notify.notify
    data:
      title: Movie download failed
      message: "{{ trigger.event.data.title }} ({{ trigger.event.data.year }})"
```