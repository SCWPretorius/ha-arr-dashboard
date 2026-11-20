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
    if (msg.type === "config_entries/get") {
      return [{ entry_id: "abc", domain: "arr_dashboard", title: "Radarr" }];
    }
    if (msg.type === "auth/sign_path") {
      return { path: `${String(msg.path)}?auth=signed` };
    }
    if (msg.type === "arr_dashboard" && msg.command === "get_state") {
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

describe("arr-card bootstrap G03", () => {
  it("shows config error when config_entries/get fails", async () => {
    const el = document.createElement("arr-card") as ArrDashboardCard;
    el.hass = {
      callWS: async () => {
        throw new Error("unknown_command");
      },
    } as never;
    el.setConfig({ type: "custom:arr-card" });
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 40));
    await el.updateComplete;
    const err = el.shadowRoot?.querySelector('[data-screen="G03"]');
    expect(err).to.exist;
  });
});

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

describe("arr-card library grid", () => {
  it("shows a scrollable poster grid and no recently added row", async () => {
    const el = document.createElement("arr-card") as ArrDashboardCard;
    el.hass = mockHass as never;
    el.setConfig({
      type: "custom:arr-card",
      tabs: ["library"],
      default_tab: "library",
      layout: "tablet",
      compact: false,
      show_rows: ["upcoming", "recent"],
    });
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 80));
    await el.updateComplete;
    const grid = el.shadowRoot?.querySelector(".library-scroll .poster-grid");
    expect(grid).to.exist;
    expect(grid?.querySelectorAll(".poster-btn").length).to.be.greaterThan(1);
    expect(el.shadowRoot?.textContent).not.to.contain("Recently added");
    expect(el.shadowRoot?.querySelector("arr-virtual-list")).to.equal(null);
  });

  it("keeps grid row layout for 300 movies", async () => {
    const el = document.createElement("arr-card") as ArrDashboardCard;
    el.hass = {
      callWS: async (msg: Record<string, unknown>) => {
        if (msg.type === "config_entries/get") {
          return [{ entry_id: "abc", domain: "arr_dashboard", title: "Radarr" }];
        }
        if (msg.type === "arr_dashboard" && msg.command === "get_state") {
          return {
            reachable: true,
            movies: mockMovies(300),
            queue: { records: [], totalRecords: 0 },
            queue_count: 0,
            health: [],
            disk_space: [],
            root_folders: [],
            quality_profiles: [],
            system: {},
          };
        }
        return {};
      },
    } as never;
    el.setConfig({
      type: "custom:arr-card",
      tabs: ["library"],
      default_tab: "library",
      library_view: "grid",
    });
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 120));
    await el.updateComplete;
    const grid = el.shadowRoot?.querySelector(".library-scroll .poster-grid");
    expect(grid).to.exist;
    expect(grid?.querySelectorAll(".poster-btn").length).to.equal(300);
  });
});

describe("arr-card remove missing movie", () => {
  it("shows remove movie without delete when there is no file", async () => {
    const el = document.createElement("arr-card") as ArrDashboardCard;
    el.hass = mockHass as never;
    el.setConfig({ type: "custom:arr-card", tabs: ["library"] });
    document.body.appendChild(el);
    await el.updateComplete;
    (el as unknown as { _selectedMovie: object })._selectedMovie = {
      id: 9,
      title: "Missing",
      year: 2022,
      hasFile: false,
    };
    await el.updateComplete;
    const deleteBtn = el.shadowRoot?.querySelector(
      '[data-action="delete-redownload"]',
    );
    const removeBtn = el.shadowRoot?.querySelector('[data-action="remove-movie"]');
    expect(deleteBtn).to.be.null;
    expect(removeBtn).to.exist;
  });
});

describe("arr-card A01 upcoming row", () => {
  it("shows Coming soon in your library on add start", async () => {
    const el = document.createElement("arr-card") as ArrDashboardCard;
    el.hass = mockHass as never;
    el.setConfig({
      type: "custom:arr-card",
      tabs: ["add"],
      default_tab: "add",
    });
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 80));
    await el.updateComplete;
    const row = el.shadowRoot?.querySelector('[data-screen="A01"]');
    expect(row).to.exist;
    expect(row?.textContent).to.contain("Coming soon in your library");
  });
});

describe("arr-card M08 quality sheet", () => {
  it("disables Save profile until selection changes", async () => {
    const el = document.createElement("arr-card") as ArrDashboardCard;
    el.hass = mockHass as never;
    el.setConfig({ type: "custom:arr-card", tabs: ["library"] });
    document.body.appendChild(el);
    await el.updateComplete;
    Object.assign(el, {
      _selectedMovie: {
        id: 1,
        title: "Test",
        year: 2020,
        qualityProfileId: 1,
        hasFile: true,
      },
      _state: {
        quality_profiles: [
          {
            id: 1,
            name: "HD",
            items: [
              { quality: { name: "720p" } },
              { quality: { name: "1080p" } },
            ],
            cutoff: { name: "1080p" },
          },
          { id: 2, name: "SD", items: [{ quality: { name: "480p" } }] },
        ],
      },
      _qualityOpen: true,
      _qualityPendingId: 1,
    });
    el.requestUpdate();
    await el.updateComplete;
    const save = el.shadowRoot?.querySelector(
      '[data-screen="M08"] button.primary',
    );
    expect(save?.textContent?.trim()).to.equal("Save profile");
    expect(save?.hasAttribute("disabled")).to.equal(true);
    Object.assign(el, { _qualityPendingId: 2 });
    el.requestUpdate();
    await el.updateComplete;
    expect(save?.hasAttribute("disabled")).to.equal(false);
  });
});

describe("arr-card manual search M05", () => {
  it("renders release header and best match pill", async () => {
    const el = document.createElement("arr-card") as ArrDashboardCard;
    el.hass = mockHass as never;
    el.setConfig({ type: "custom:arr-card" });
    document.body.appendChild(el);
    await el.updateComplete;
    Object.assign(el, {
      _manualMovieId: 1,
      _releaseBusy: false,
      _releases: [
        {
          guid: "good",
          title: "Movie.1080p",
          approved: true,
          size: 5e9,
          age: 2,
          seeders: 10,
          indexer: "Tracker",
          customFormatScore: 42,
          quality: { quality: { name: "1080p" } },
        },
        {
          guid: "bad",
          title: "Cam",
          approved: false,
          rejections: ["CAM"],
        },
      ],
    });
    el.requestUpdate();
    await el.updateComplete;
    const header = el.shadowRoot?.querySelector(".release-header span");
    expect(header?.textContent).to.contain("1 releases");
    const best = el.shadowRoot?.querySelector(".best-match-pill");
    expect(best?.textContent).to.equal("Best match");
  });
});

describe("arr-card D06 queue row exit", () => {
  it("marks row exiting during animateQueueRowExit", async () => {
    const el = document.createElement("arr-card") as ArrDashboardCard;
    el.hass = mockHass as never;
    el.setConfig({
      type: "custom:arr-card",
      tabs: ["downloading"],
      default_tab: "downloading",
    });
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 60));
    await el.updateComplete;
    Object.assign(el, { _exitingQueueIds: [1] });
    el.requestUpdate();
    await el.updateComplete;
    const row = el.shadowRoot?.querySelector('[data-screen="D06"]');
    expect(row).to.exist;
    expect(row?.classList.contains("exiting")).to.equal(true);
  });
});

describe("arr-card hide grab anyway", () => {
  it("omits Grab anyway on rejected releases", async () => {
    const el = document.createElement("arr-card") as ArrDashboardCard;
    el.hass = mockHass as never;
    el.setConfig({
      type: "custom:arr-card",
      hide_destructive_actions: true,
    });
    document.body.appendChild(el);
    await el.updateComplete;
    Object.assign(el, {
      _manualMovieId: 1,
      _releaseBusy: false,
      _releases: [
        {
          title: "Bad",
          approved: false,
          rejections: ["CAM"],
          size: 1e9,
        },
      ],
      _showRejected: true,
    });
    el.requestUpdate();
    await el.updateComplete;
    const grab = el.shadowRoot?.querySelector(".release-row button");
    expect(grab).to.be.null;
  });
});