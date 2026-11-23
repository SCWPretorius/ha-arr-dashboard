import { LitElement, html } from "lit";
import { property, state } from "lit/decorators.js";
import {
  isMonitorMode,
  isSeriesCardType,
  MONITOR_MODES,
  monitorLabel,
} from "./app-profile";
import { defineElement } from "./define-element";
import type { ArrCardConfig, TabId } from "./types";

export class ArrCardEditor extends LitElement {
  @property({ attribute: false }) public lovelace?: unknown;
  @state() private _config: Partial<ArrCardConfig> = {};

  setConfig(config: Record<string, unknown>): void {
    this._config = { ...(config as Partial<ArrCardConfig>) };
  }

  protected createRenderRoot() {
    return this;
  }

  private _value<K extends keyof ArrCardConfig>(key: K): ArrCardConfig[K] | undefined {
    return this._config[key];
  }

  private _set<K extends keyof ArrCardConfig>(
    key: K,
    value: ArrCardConfig[K],
  ): void {
    this._config = { ...this._config, [key]: value };
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _toggleTab(tab: TabId, on: boolean): void {
    const cur = [
      ...(this._value("tabs") ?? ["add", "downloading", "library", "issues"]),
    ];
    const next = on
      ? [...new Set([...cur, tab])]
      : cur.filter((t) => t !== tab);
    if (next.length) this._set("tabs", next as TabId[]);
  }

  private get _series(): boolean {
    return isSeriesCardType(this._config.type);
  }

  private get _product(): "Sonarr" | "Radarr" {
    return this._series ? "Sonarr" : "Radarr";
  }

  private _toggleChip(chip: "disk" | "queue" | "health", on: boolean): void {
    const cur = [...(this._value("show_header_chips") ?? [])];
    const next = on
      ? [...new Set([...cur, chip])]
      : cur.filter((c) => c !== chip);
    this._set("show_header_chips", next);
  }

  protected render() {
    const tabs = this._value("tabs") ?? ["add", "downloading", "library", "issues"];
    const ad = this._value("add_defaults") ?? {};
    const hide = Boolean(this._value("hide_destructive_actions"));

    return html`
      <div class="card-config">
          <h3>General</h3>
          <label>
            Instance
            <input
              .value=${String(this._value("instance") ?? "")}
              @change=${(e: Event) =>
                this._set("instance", (e.target as HTMLInputElement).value)}
            />
          </label>
          <label>
            Compact
            <select
              .value=${this._value("compact") === true
                ? "true"
                : this._value("compact") === false
                  ? "false"
                  : "auto"}
              @change=${(e: Event) => {
                const v = (e.target as HTMLSelectElement).value;
                this._set(
                  "compact",
                  v === "auto" ? "auto" : v === "true",
                );
              }}
            >
              <option value="auto">Auto</option>
              <option value="true">Always</option>
              <option value="false">Never</option>
            </select>
          </label>
          <label>
            Layout
            <select
              .value=${String(this._value("layout") ?? "auto")}
              @change=${(e: Event) =>
                this._set(
                  "layout",
                  (e.target as HTMLSelectElement).value as ArrCardConfig["layout"],
                )}
            >
              <option value="auto">Auto</option>
              <option value="phone">Phone</option>
              <option value="tablet">Tablet</option>
            </select>
          </label>
          <label>
            Open ${this._product} URL (status sheet)
            <input
              .value=${String(
                this._value("external_link") === false
                  ? ""
                  : this._value("external_link") ?? "",
              )}
              @change=${(e: Event) => {
                const v = (e.target as HTMLInputElement).value.trim();
                this._set("external_link", v ? v : false);
              }}
            />
          </label>

          <h3>Tabs</h3>
          <label>
            Default tab
            <select
              .value=${String(this._value("default_tab") ?? "library")}
              @change=${(e: Event) =>
                this._set(
                  "default_tab",
                  (e.target as HTMLSelectElement).value as TabId,
                )}
            >
              <option value="library">Library</option>
              <option value="downloading">Downloading</option>
              <option value="add">Add</option>
              <option value="issues">Issues</option>
            </select>
          </label>
          <p>Show tabs:</p>
          ${(["add", "downloading", "library", "issues"] as TabId[]).map(
            (t) => html`
              <label>
                <input
                  type="checkbox"
                  .checked=${tabs.includes(t)}
                  @change=${(e: Event) =>
                    this._toggleTab(
                      t,
                      (e.target as HTMLInputElement).checked,
                    )}
                />
                ${t}
              </label>
            `,
          )}
          <p>Header chips:</p>
          ${(["disk", "queue", "health"] as const).map(
            (c) => html`
              <label>
                <input
                  type="checkbox"
                  .checked=${(this._value("show_header_chips") ?? []).includes(
                    c,
                  )}
                  @change=${(e: Event) =>
                    this._toggleChip(
                      c,
                      (e.target as HTMLInputElement).checked,
                    )}
                />
                ${c}
              </label>
            `,
          )}

          <h3>Library</h3>
          <label>
            Upcoming window (days, Add tab)
            <input
              type="number"
              min="1"
              .value=${String(this._value("upcoming_days") ?? 14)}
              @change=${(e: Event) =>
                this._set(
                  "upcoming_days",
                  Number((e.target as HTMLInputElement).value),
                )}
            />
          </label>
          <label>
            Recent window (days)
            <input
              type="number"
              min="1"
              .value=${String(this._value("recent_days") ?? 7)}
              @change=${(e: Event) =>
                this._set(
                  "recent_days",
                  Number((e.target as HTMLInputElement).value),
                )}
            />
          </label>
          <p class="hint-muted">
            Library is always a poster grid of on-disk ${this._series ? "series" : "movies"}.
          </p>
          <label>
            Default sort
            <select
              .value=${String(this._value("library_sort") ?? "title")}
              @change=${(e: Event) =>
                this._set("library_sort", (e.target as HTMLSelectElement).value)}
            >
              <option value="title">Title</option>
              <option value="added">Added</option>
              <option value="year">Year</option>
            </select>
          </label>

          <h3>Add defaults</h3>
          <label>
            Quality profile name
            <input
              .value=${String(ad.quality_profile ?? "")}
              @change=${(e: Event) =>
                this._set("add_defaults", {
                  ...ad,
                  quality_profile: (e.target as HTMLInputElement).value,
                })}
            />
          </label>
          <label>
            Root folder path
            <input
              .value=${String(ad.root_folder ?? "")}
              @change=${(e: Event) =>
                this._set("add_defaults", {
                  ...ad,
                  root_folder: (e.target as HTMLInputElement).value,
                })}
            />
          </label>
          ${this._series
            ? html`
                <label>
                  Monitor
                  <select
                    data-field="monitor"
                    .value=${String(ad.monitor ?? "all")}
                    @change=${(e: Event) => {
                      const next = (e.target as HTMLSelectElement).value;
                      this._set("add_defaults", {
                        ...ad,
                        monitor: isMonitorMode(next) ? next : "all",
                      });
                    }}
                  >
                    ${MONITOR_MODES.map(
                      (mode) => html`
                        <option value=${mode}>${monitorLabel(mode)}</option>
                      `,
                    )}
                  </select>
                </label>
              `
            : html`
                <label>
                  Minimum availability
                  <select
                    .value=${String(ad.minimum_availability ?? "released")}
                    @change=${(e: Event) =>
                      this._set("add_defaults", {
                        ...ad,
                        minimum_availability: (e.target as HTMLSelectElement)
                          .value,
                      })}
                  >
                    <option value="announced">Announced</option>
                    <option value="inCinemas">In cinemas</option>
                    <option value="released">Released</option>
                  </select>
                </label>
              `}
          <label>
            <input
              type="checkbox"
              .checked=${ad.search_on_add !== false}
              @change=${(e: Event) =>
                this._set("add_defaults", {
                  ...ad,
                  search_on_add: (e.target as HTMLInputElement).checked,
                })}
            />
            ${this._series
              ? "Search for missing episodes (default for Add series)"
              : "Start searching now (default for Add movie)"}
          </label>

          <h3>Safety</h3>
          <label>
            <input
              type="checkbox"
              .checked=${hide}
              @change=${(e: Event) =>
                this._set(
                  "hide_destructive_actions",
                  (e.target as HTMLInputElement).checked,
                )}
            />
            Hide fix and remove buttons on this dashboard
          </label>
          <p class="hint">
            Hides buttons only. It doesn't change who is allowed to do what in
            ${this._product}.
          </p>
      </div>
    `;
  }
}

defineElement("arr-card-editor", ArrCardEditor);

export function getStubConfig(): Record<string, string> {
  return { instance: "" };
}