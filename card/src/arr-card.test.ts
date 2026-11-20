import { describe, it, expect, beforeEach } from "vitest";
import "./arr-card";
import type { ArrDashboardCard } from "./arr-card";

const mockHass = {
  callWS: async (msg: Record<string, unknown>) => {
    if (msg.type === "config_entries/list") {
      return [{ entry_id: "abc", domain: "arr_dashboard", title: "Radarr" }];
    }
    if (msg.command === "get_state") {
      return {
        reachable: true,
        movies: [],
        queue: {
          records: [
            {
              id: 1,
              status: "failed",
              movie: { title: "Fail", year: 2020 },
            },
          ],
          totalRecords: 1,
        },
        queue_count: 1,
        health: [],
        disk_space: [],
        root_folders: [],
        quality_profiles: [],
        system: {},
      };
    }
    return {};
  },
  locale: { language: "en" },
};

describe("arr-card hide_destructive_actions", () => {
  let el: ArrDashboardCard;

  beforeEach(async () => {
    el = document.createElement("arr-card") as ArrDashboardCard;
    el.hass = mockHass as never;
    el.setConfig({
      type: "custom:arr-card",
      hide_destructive_actions: true,
      tabs: ["downloading"],
      default_tab: "downloading",
    });
    document.body.appendChild(el);
    await el.updateComplete;
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 50));
    await el.updateComplete;
  });

  it("removes destructive queue buttons from the DOM", () => {
    const remove = el.shadowRoot?.querySelector('[data-action="queue-remove"]');
    const removeSearch = el.shadowRoot?.querySelector(
      '[data-action="remove-search-again"]',
    );
    expect(remove).to.be.null;
    expect(removeSearch).to.be.null;
    const hint = el.shadowRoot?.querySelector(".hint-muted");
    expect(hint?.textContent).to.contain("Removing is turned off");
  });
});

describe("arr-card confirm dialog", () => {
  it("shows cancel-focused confirm for remove movie", async () => {
    const el = document.createElement("arr-card") as ArrDashboardCard;
    el.hass = mockHass as never;
    el.setConfig({
      type: "custom:arr-card",
      tabs: ["library"],
      default_tab: "library",
    });
    document.body.appendChild(el);
    await el.updateComplete;
    (el as unknown as { _selectedMovie: object })._selectedMovie = {
      id: 1,
      title: "Test",
      year: 2000,
      hasFile: true,
    };
    (el as unknown as { _openConfirm: (k: string, p: object) => void })._openConfirm(
      "m10",
      { title: "Test", movie_id: 1 },
    );
    await el.updateComplete;
    const dialog = el.shadowRoot?.querySelector('dialog[role="alertdialog"]');
    expect(dialog).to.exist;
    const cancel = dialog?.querySelector("button.text");
    expect(cancel?.textContent?.trim()).to.equal("Cancel");
  });
});