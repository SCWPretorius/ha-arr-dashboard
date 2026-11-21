import { describe, it, expect, beforeEach, vi } from "vitest";
import "./arr-card";
import type { ArrDashboardCard } from "./arr-card";

function mockMovies(count: number, allOnDisk = false) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Movie ${String.fromCharCode(65 + (i % 26))}${i}`,
    year: 2000 + (i % 20),
    hasFile: allOnDisk ? true : i % 3 === 0,
    posterUrl: "",
    status: i % 5 === 0 ? "inCinemas" : "released",
    added: new Date(Date.now() - i * 86400000).toISOString(),
  }));
}

function mockLibraryPage(
  movies: ReturnType<typeof mockMovies>,
  data: Record<string, unknown>,
) {
  let list = movies.filter((m) => m.hasFile);
  const q = String(data.search ?? "").trim().toLowerCase();
  if (q) {
    list = list.filter((m) => m.title.toLowerCase().includes(q));
  }
  const sort = String(data.sort ?? "title");
  if (sort === "added") {
    list = [...list].sort((a, b) => b.added.localeCompare(a.added));
  } else if (sort === "year") {
    list = [...list].sort((a, b) => b.year - a.year);
  } else {
    list = [...list].sort((a, b) => a.title.localeCompare(b.title));
  }
  const offset = Number(data.offset ?? 0);
  const limit = Number(data.limit ?? 48);
  return {
    total: list.length,
    offset,
    revision: "mock:1",
    items: list.slice(offset, offset + limit),
  };
}

function mockArrDashboard(
  command: string,
  data: Record<string, unknown>,
  movieCount = 60,
  allOnDisk = false,
) {
  const movies = mockMovies(movieCount, allOnDisk);
  const core = {
    reachable: true,
    library_revision: "mock:1",
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
    disk_space: [{ path: "/movies", freeSpace: 1e12, totalSpace: 2e12 }],
    root_folders: [{ id: 1, path: "/movies", freeSpace: 1e12 }],
    quality_profiles: [{ id: 1, name: "HD" }],
    system: {},
    last_success: new Date().toISOString(),
  };
  switch (command) {
    case "get_state":
      if (data.scope === "queue") {
        return {
          reachable: core.reachable,
          queue: core.queue,
          queue_count: core.queue_count,
          health: core.health,
          disk_space: core.disk_space,
          last_success: core.last_success,
        };
      }
      return core;
    case "library_page":
      return mockLibraryPage(movies, data);
    case "library_upcoming":
      return {
        items: movies.filter((m) => (m.status ?? "").includes("Cinemas")),
      };
    case "library_match":
      return { movie: null };
    case "lookup":
      return { results: [] };
    default:
      return {};
  }
}

const mockHass = {
  callWS: async (msg: Record<string, unknown>) => {
    if (msg.type === "config_entries/get") {
      return [{ entry_id: "abc", domain: "arr_dashboard", title: "Radarr" }];
    }
    if (msg.type === "auth/sign_path") {
      return { path: `${String(msg.path)}?auth=signed` };
    }
    if (msg.type === "arr_dashboard") {
      return mockArrDashboard(
        String(msg.command),
        (msg.data as Record<string, unknown>) ?? {},
      );
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
    expect(remove).to.be.null;
    expect(el.shadowRoot?.textContent).not.to.contain("Remove & search again");
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

describe("arr-card issues tab", () => {
  it("shows health messages on the Issues tab", async () => {
    const el = document.createElement("arr-card") as ArrDashboardCard;
    el.hass = mockHass as never;
    el.setConfig({
      type: "custom:arr-card",
      tabs: ["library", "issues"],
      default_tab: "issues",
    });
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 60));
    await el.updateComplete;
    const pane = el.shadowRoot?.querySelector('[data-screen="I01"]');
    expect(pane).to.exist;
    expect(pane?.textContent).to.contain("Disk low");
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
    });
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 80));
    await el.updateComplete;
    const list = el.shadowRoot?.querySelector("arr-virtual-list");
    expect(list).to.exist;
    expect(el.shadowRoot?.textContent).not.to.contain("Recently added");
    const grid = el.shadowRoot?.querySelector(".library-scroll .poster-grid");
    expect(grid?.querySelector(".poster-caption")?.textContent).to.contain(
      "Movie",
    );
    expect(el.shadowRoot?.querySelector(".chip-row .filter-chip")).to.equal(
      null,
    );
  });

  it("loads more library pages when the viewport sentinel intersects", async () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    let callback: IntersectionObserverCallback = () => {};
    const MockIo = vi.fn(
      (cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) => {
        callback = cb;
        return { observe, disconnect, unobserve: vi.fn(), takeRecords: vi.fn() };
      },
    );
    vi.stubGlobal("IntersectionObserver", MockIo);

    const pageCalls: number[] = [];
    const el = document.createElement("arr-card") as ArrDashboardCard;
    el.hass = {
      callWS: async (msg: Record<string, unknown>) => {
        if (msg.type === "config_entries/get") {
          return [{ entry_id: "abc", domain: "arr_dashboard", title: "Radarr" }];
        }
        if (msg.type === "arr_dashboard" && msg.command === "library_page") {
          pageCalls.push(Number((msg.data as { offset?: number }).offset ?? 0));
          return mockArrDashboard(
            String(msg.command),
            (msg.data as Record<string, unknown>) ?? {},
            200,
            true,
          );
        }
        if (msg.type === "arr_dashboard") {
          return mockArrDashboard(
            String(msg.command),
            (msg.data as Record<string, unknown>) ?? {},
            200,
            true,
          );
        }
        return {};
      },
    } as never;
    el.setConfig({
      type: "custom:arr-card",
      tabs: ["library"],
      default_tab: "library",
    });
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 120));
    await el.updateComplete;
    expect(MockIo).toHaveBeenCalled();
    expect(observe).toHaveBeenCalled();
    const internal = el as unknown as { _libraryItems: unknown[]; _libraryTotal: number };
    expect(internal._libraryTotal).to.equal(200);
    const before = internal._libraryItems.length;
    callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    await new Promise((r) => setTimeout(r, 80));
    await el.updateComplete;
    expect(internal._libraryItems.length).to.be.greaterThan(before);
    expect(pageCalls).to.include(before);
    vi.unstubAllGlobals();
  });

  it("opens movie details in a popup on a narrow card", async () => {
    const el = document.createElement("arr-card") as ArrDashboardCard;
    el.hass = mockHass as never;
    el.setConfig({
      type: "custom:arr-card",
      tabs: ["library"],
      default_tab: "library",
      layout: "tablet",
    });
    document.body.appendChild(el);
    await el.updateComplete;
    const card = el as unknown as {
      _hostWidth: number;
      _selectedMovie: object;
      requestUpdate: () => void;
    };
    card._hostWidth = 408;
    card._selectedMovie = {
      id: 1,
      title: "The Secret Life of Walter Mitty",
      year: 2013,
      hasFile: true,
    };
    card.requestUpdate();
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector(".detail-popup")).to.exist;
    expect(el.shadowRoot?.querySelector(".side-panel")).to.equal(null);
    expect(el.shadowRoot?.textContent).to.contain(
      "The Secret Life of Walter Mitty",
    );

    card._hostWidth = 1100;
    card.requestUpdate();
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector(".side-panel")).to.exist;
    expect(el.shadowRoot?.querySelector(".detail-popup")).to.equal(null);
  });

  it("lazy-loads library pages instead of mounting every movie", async () => {
    const el = document.createElement("arr-card") as ArrDashboardCard;
    el.hass = {
      callWS: async (msg: Record<string, unknown>) => {
        if (msg.type === "config_entries/get") {
          return [{ entry_id: "abc", domain: "arr_dashboard", title: "Radarr" }];
        }
        if (msg.type === "arr_dashboard") {
          return mockArrDashboard(
            String(msg.command),
            (msg.data as Record<string, unknown>) ?? {},
            300,
            true,
          );
        }
        return {};
      },
    } as never;
    el.setConfig({
      type: "custom:arr-card",
      tabs: ["library"],
      default_tab: "library",
    });
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 150));
    await el.updateComplete;
    const internal = el as unknown as {
      _libraryItems: { length: number };
      _libraryTotal: number;
    };
    expect(internal._libraryTotal).to.equal(300);
    expect(internal._libraryItems.length).to.be.lessThan(300);
    expect(el.shadowRoot?.querySelector("arr-virtual-list")).to.exist;
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
    expect(row?.querySelector(".coming-grid")).to.exist;
    expect(row?.querySelector(".h-scroll")).to.equal(null);
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