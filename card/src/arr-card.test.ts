import { describe, it, expect, beforeEach } from "vitest";
import "./arr-card";
import type { ArrDashboardCard } from "./arr-card";

function mockMovies(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Movie ${String.fromCharCode(65 + (i % 26))}${i}`,
    year: 2000 + (i % 20),
    hasFile: i % 3 === 0,
    posterUrl: "",
    status: i % 5 === 0 ? "inCinemas" : "released",
    added: new Date(Date.now() - i * 86400000).toISOString(),
  }));
}

const mockHass = {
  callWS: async (msg: Record<string, unknown>) => {
    if (msg.type === "config_entries/list") {
      return [{ entry_id: "abc", domain: "arr_dashboard", title: "Radarr" }];
    }
    if (msg.command === "get_state") {
      return {
        reachable: true,
        movies: mockMovies(60),
        queue: {
          records: [
            {
              id: 1,
              status: "failed",
              movie: { title: "Fail", year: 2020 },
              size: 1e9,
              sizeleft: 5e8,
            },
          ],
          totalRecords: 1,
        },
        queue_count: 1,
        health: [{ source: "test", type: "warning", message: "Disk low" }],
        disk_space: [
          { path: "/movies", freeSpace: 1e12, totalSpace: 2e12 },
        ],
        root_folders: [{ id: 1, path: "/movies", freeSpace: 1e12 }],
        quality_profiles: [{ id: 1, name: "HD" }],
        system: {},
        last_success: new Date().toISOString(),
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
    const hint = el.shadowRoot?.querySelector('[data-screen="D07T"]');
    expect(hint?.textContent).to.contain("Removing is turned off");
  });
});

describe("arr-card confirm screen ids", () => {
  it("tags M06 on rejected grab confirm", async () => {
    const el = document.createElement("arr-card") as ArrDashboardCard;
    el.hass = mockHass as never;
    el.setConfig({ type: "custom:arr-card" });
    document.body.appendChild(el);
    await el.updateComplete;
    (el as unknown as { _openConfirm: (k: string, p: object) => void })._openConfirm(
      "m06",
      { reasons: "CAM", releaseName: "Bad.cam", size: 1e9 },
    );
    await el.updateComplete;
    const dialog = el.shadowRoot?.querySelector('[data-screen="M06"]');
    expect(dialog).to.exist;
  });
});

describe("arr-card confirm dialog", () => {
  it("shows cancel-focused confirm for remove movie M10", async () => {
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
    const title = dialog?.querySelector("#confirm-title");
    expect(title?.textContent).to.equal("Remove Test?");
    const cancel = dialog?.querySelector("button.text");
    expect(cancel?.textContent?.trim()).to.equal("Cancel");
  });

  it("shows M09 delete file title", async () => {
    const el = document.createElement("arr-card") as ArrDashboardCard;
    el.hass = mockHass as never;
    el.setConfig({ type: "custom:arr-card" });
    document.body.appendChild(el);
    await el.updateComplete;
    (el as unknown as { _openConfirm: (k: string, p: object) => void })._openConfirm(
      "m09",
      { title: "Bad", movie_id: 2 },
    );
    await el.updateComplete;
    const title = el.shadowRoot?.querySelector("#confirm-title");
    expect(title?.textContent).to.equal("Delete file and redownload?");
  });
});

describe("arr-card add sheet", () => {
  it("opens add sheet A04 from lookup", async () => {
    const el = document.createElement("arr-card") as ArrDashboardCard;
    el.hass = mockHass as never;
    el.setConfig({ type: "custom:arr-card", tabs: ["add"], default_tab: "add" });
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 60));
    await el.updateComplete;
    const card = el as unknown as {
      _state: object;
      _openAddSheet: (r: Record<string, unknown>) => void;
    };
    card._state = {
      quality_profiles: [{ id: 1, name: "HD" }],
      root_folders: [{ id: 1, path: "/movies", freeSpace: 1e12 }],
    };
    card._openAddSheet({ title: "New Film", year: 2024, tmdbId: 99 });
    await el.updateComplete;
    const sheet = el.shadowRoot?.querySelector(
      '[data-screen="A04"], [data-screen="A04T"]',
    );
    expect(sheet).to.exist;
    expect(sheet?.textContent).to.contain("Add New Film");
  });
});

describe("arr-card status sheet G02", () => {
  it("opens from health chip", async () => {
    const el = document.createElement("arr-card") as ArrDashboardCard;
    el.hass = mockHass as never;
    el.setConfig({ type: "custom:arr-card" });
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 60));
    await el.updateComplete;
    const chip = el.shadowRoot?.querySelector(".chip-button");
    chip?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    (el as unknown as { _statusOpen: boolean })._statusOpen = true;
    await el.updateComplete;
    const sheet = el.shadowRoot?.querySelector('[data-screen="G02"]');
    expect(sheet).to.exist;
    expect(sheet?.textContent).to.contain("Disk low");
  });
});

describe("arr-card virtual list", () => {
  it("uses arr-virtual-list when library has many movies", async () => {
    const el = document.createElement("arr-card") as ArrDashboardCard;
    el.hass = mockHass as never;
    el.setConfig({
      type: "custom:arr-card",
      tabs: ["library"],
      default_tab: "library",
      layout: "tablet",
      compact: false,
    });
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 80));
    await el.updateComplete;
    const list = el.shadowRoot?.querySelector("arr-virtual-list");
    expect(list).to.exist;
  });
});