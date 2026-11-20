import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant } from "./types";

@customElement("arr-card-editor")
export class ArrCardEditor extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public lovelace?: unknown;
  @state() private _config: Record<string, unknown> = {};

  setConfig(config: Record<string, unknown>): void {
    this._config = { ...config };
  }

  protected createRenderRoot() {
    return this;
  }

  private _value(key: string): unknown {
    return this._config[key];
  }

  private _set(key: string, value: unknown): void {
    this._config = { ...this._config, [key]: value };
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected render() {
    const hide = Boolean(this._value("hide_destructive_actions"));
    return html`
      <div class="card-config">
        <h3>General</h3>
        <label>
          Title
          <input
            .value=${String(this._value("title") ?? "Movies")}
            @change=${(e: Event) =>
              this._set("title", (e.target as HTMLInputElement).value)}
          />
        </label>
        <label>
          Instance
          <input
            .value=${String(this._value("instance") ?? "")}
            @change=${(e: Event) =>
              this._set("instance", (e.target as HTMLInputElement).value)}
          />
        </label>
        <label>
          Default tab
          <select
            .value=${String(this._value("default_tab") ?? "library")}
            @change=${(e: Event) =>
              this._set(
                "default_tab",
                (e.target as HTMLSelectElement).value,
              )}
          >
            <option value="library">Library</option>
            <option value="downloading">Downloading</option>
            <option value="add">Add</option>
          </select>
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
          Hides buttons only. It doesn't change who is allowed to do what.
        </p>
        <label>
          <input
            type="checkbox"
            .checked=${this._value("add_defaults") &&
            (this._value("add_defaults") as { search_on_add?: boolean })
              .search_on_add !== false}
            @change=${(e: Event) => {
              const ad = (this._value("add_defaults") as object) ?? {};
              this._set("add_defaults", {
                ...ad,
                search_on_add: (e.target as HTMLInputElement).checked,
              });
            }}
          />
          Start searching now (default for Add movie)
        </label>
      </div>
    `;
  }
}

export function getStubConfig(): Record<string, string> {
  return { instance: "" };
}