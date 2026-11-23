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

  it("renders lookup hits as poster cards with an add button", async () => {
    const el = document.createElement("arr-card") as ArrDashboardCard;
    el.hass = mockHass as never;
    el.setConfig({ type: "custom:arr-card", tabs: ["add"], default_tab: "add" });
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 60));
    await el.updateComplete;
    const card = el as unknown as {
      _addPhase: string;
      _addQuery: string;
      _lookupResults: Record<string, unknown>[];
    };
    card._addPhase = "results";
    card._addQuery = "Dune";
    card._lookupResults = [
      {
        title: "Dune",
        year: 2021,
        tmdbId: 438631,
        status: "announced",
        images: [
          {
            coverType: "poster",
            remoteUrl: "https://image.tmdb.org/t/p/original/dune.jpg",
          },
        ],
      },
    ];
    await el.updateComplete;
    const cardEl = el.shadowRoot?.querySelector(".lookup-card");
    const img = cardEl?.querySelector("img.lookup-poster");
    expect(img?.getAttribute("src")).to.equal(
      "https://image.tmdb.org/t/p/w185/dune.jpg",
    );
    expect(cardEl?.querySelector(".lookup-title")?.textContent).to.contain(
      "Dune (2021)",
    );
    expect(cardEl?.querySelector(".lookup-soon")?.textContent).to.equal("Soon");
    const add = cardEl?.querySelector('[data-action="add-movie"]');
    expect(add?.textContent?.trim()).to.equal("Add movie");
    expect(el.shadowRoot?.textContent).not.to.contain("Coming soon in results");
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

  it("reorders the poster grid when the sort dropdown changes", async () => {
    const sorts: string[] = [];
    const el = document.createElement("arr-card") as ArrDashboardCard;
    el.hass = {
      callWS: async (msg: Record<string, unknown>) => {
        if (msg.type === "config_entries/get") {
          return [{ entry_id: "abc", domain: "arr_dashboard", title: "Radarr" }];
        }
        if (msg.type === "arr_dashboard") {
          const data = (msg.data as Record<string, unknown>) ?? {};
          if (msg.command === "library_page") {
            sorts.push(String(data.sort ?? "title"));
          }
          return mockArrDashboard(String(msg.command), data, 60, true);
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
    await new Promise((r) => setTimeout(r, 80));
    await el.updateComplete;
    const caption = () =>
      el.shadowRoot
        ?.querySelector(".library-scroll .poster-grid .poster-caption")
        ?.textContent?.trim();
    const before = caption();
    expect(before).to.be.a("string").and.not.empty;
    const select = el.shadowRoot?.querySelector(
      ".sort-select",
    ) as HTMLSelectElement;
    select.value = "year";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 80));
    await el.updateComplete;
    expect(sorts).to.include("year");
    expect(caption()).to.not.equal(before);
    expect(select.value).to.equal("year");
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

function seriesHass() {
  return {
    callWS: async (msg: Record<string, unknown>) => {
      if (msg.type === "config_entries/get") {
        return [
          { entry_id: "rad", domain: "arr_dashboard", title: "Radarr" },
          { entry_id: "son", domain: "arr_dashboard", title: "Sonarr" },
        ];
      }
      if (msg.type === "auth/sign_path") {
        return { path: String(msg.path) };
      }
      if (msg.type !== "arr_dashboard") return {};
      switch (msg.command) {
        case "list_instances":
          return {
            instances: [
              { entry_id: "rad", title: "Radarr", app: "radarr" },
              { entry_id: "son", title: "Sonarr", app: "sonarr" },
            ],
          };
        case "get_state":
          return {
            reachable: true,
            app: "sonarr",
            library_revision: "s:1",
            queue: {
              records: [
                {
                  id: 7,
                  status: "downloading",
                  series: { title: "Dark", id: 4 },
                  seasonNumber: 1,
                  episode: { title: "Beginnings", episodeNumber: 2 },
                  size: 1e9,
                  sizeleft: 4e8,
                },
              ],
              totalRecords: 1,
            },
            queue_count: 1,
            health: [],
            disk_space: [],
            root_folders: [{ id: 1, path: "/tv", freeSpace: 1 }],
            quality_profiles: [{ id: 3, name: "HD-1080p" }],
            system: {},
          };
        case "library_upcoming":
          return {
            items: [
              {
                seriesId: 4,
                seriesTitle: "Dark",
                seasonNumber: 1,
                episodeNumber: 2,
                title: "Beginnings",
                airDateUtc: "2026-12-01T00:00:00Z",
              },
            ],
          };
        case "library_page":
          return {
            total: 1,
            revision: "s:1",
            offset: 0,
            items: [
              {
                id: 4,
                title: "Dark",
                year: 2017,
                status: "ended",
                hasFile: true,
                added: new Date().toISOString(),
                posterUrl: "",
              },
            ],
          };
        case "library_match":
          return { series: null };
        default:
          return {};
      }
    },
    locale: { language: "en" },
  };
}

describe("arr-series-card", () => {
  it("uses series labels on lookup, downloads, and upcoming", async () => {
    const el = document.createElement("arr-series-card") as ArrDashboardCard;
    el.hass = seriesHass() as never;
    el.setConfig({
      type: "custom:arr-series-card",
      tabs: ["add", "downloading"],
      default_tab: "downloading",
    });
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 80));
    await el.updateComplete;
    expect(el.shadowRoot?.textContent).to.contain(
      "Dark · S01E02 · Beginnings",
    );
    expect(el.shadowRoot?.textContent).not.to.contain("Add movie");

    const card = el as unknown as {
      _tab: string;
      _addPhase: string;
      _addQuery: string;
      _lookupResults: Record<string, unknown>[];
      _upcomingEpisodes: unknown[];
      requestUpdate: () => void;
    };
    card._tab = "add";
    card._addPhase = "results";
    card._addQuery = "Dark";
    card._lookupResults = [
      { title: "Dark", year: 2017, tvdbId: 318408, status: "continuing" },
    ];
    card._upcomingEpisodes = [
      {
        seriesId: 4,
        seriesTitle: "Dark",
        seasonNumber: 1,
        episodeNumber: 2,
        title: "Beginnings",
        airDateUtc: "2026-12-01T00:00:00Z",
      },
    ];
    card.requestUpdate();
    await el.updateComplete;
    const add = el.shadowRoot?.querySelector('[data-action="add-series"]');
    expect(add?.textContent?.trim()).to.equal("Add series");
    expect(el.shadowRoot?.textContent).to.contain("Continuing");
    expect(el.shadowRoot?.textContent).not.to.contain("Soon");
  });

  it("shows a monitor field on the add sheet and no minimum availability", async () => {
    const el = document.createElement("arr-series-card") as ArrDashboardCard;
    el.hass = seriesHass() as never;
    el.setConfig({
      type: "custom:arr-series-card",
      tabs: ["add"],
      default_tab: "add",
    });
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 60));
    await el.updateComplete;
    const card = el as unknown as {
      _state: object;
      _openAddSheet: (hit: Record<string, unknown>) => void;
    };
    card._state = {
      quality_profiles: [{ id: 3, name: "HD-1080p" }],
      root_folders: [{ id: 1, path: "/tv", freeSpace: 1 }],
    };
    card._openAddSheet({ title: "Dark", year: 2017, tvdbId: 318408 });
    await el.updateComplete;
    const sheet = el.shadowRoot?.querySelector(
      '[data-screen="A04"], [data-screen="A04T"]',
    );
    const monitor = sheet?.querySelector(
      '[data-field="monitor"]',
    ) as HTMLSelectElement | null;
    expect(monitor).to.exist;
    expect(monitor?.value).to.equal("all");
    expect(sheet?.textContent).to.contain("Search for missing episodes");
    expect(sheet?.textContent).to.contain("Future episodes");
    expect(sheet?.textContent).not.to.contain("Minimum availability");
    expect(sheet?.textContent).not.to.contain("Monitor this movie");
  });

  it("shows a mismatch instead of the Radarr library", async () => {
    const el = document.createElement("arr-series-card") as ArrDashboardCard;
    el.hass = seriesHass() as never;
    el.setConfig({
      type: "custom:arr-series-card",
      instance: "Radarr",
      tabs: ["library"],
      default_tab: "library",
    });
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 60));
    await el.updateComplete;
    const mismatch = el.shadowRoot?.querySelector("[data-mismatch]");
    expect(mismatch?.textContent).to.contain("pointed at Radarr");
    expect(el.shadowRoot?.querySelector("arr-virtual-list")).to.equal(null);
    expect(el.shadowRoot?.textContent).not.to.contain("Movie");
  });

  it("recent row uses full series, including shows with no episode files", async () => {
    const added = new Date().toISOString();
    const el = document.createElement("arr-series-card") as ArrDashboardCard;
    el.hass = {
      callWS: async (msg: Record<string, unknown>) => {
        if (msg.type === "config_entries/get") {
          return [{ entry_id: "son", domain: "arr_dashboard", title: "Sonarr" }];
        }
        if (msg.type === "auth/sign_path") {
          return { path: String(msg.path) };
        }
        if (msg.type !== "arr_dashboard") return {};
        const data = (msg.data ?? {}) as Record<string, unknown>;
        switch (msg.command) {
          case "list_instances":
            return {
              instances: [{ entry_id: "son", title: "Sonarr", app: "sonarr" }],
            };
          case "get_state":
            if (data.scope === "full") {
              return {
                reachable: true,
                app: "sonarr",
                series: [
                  {
                    id: 8,
                    title: "No Files Yet",
                    year: 2024,
                    hasFile: false,
                    episodeFileCount: 0,
                    added,
                    posterUrl: "",
                  },
                ],
                upcoming: [],
                queue: { records: [], totalRecords: 0 },
                queue_count: 0,
                health: [],
                disk_space: [],
                root_folders: [],
                quality_profiles: [],
                system: {},
              };
            }
            return {
              reachable: true,
              app: "sonarr",
              library_revision: "s:1",
              queue: { records: [], totalRecords: 0 },
              queue_count: 0,
              health: [],
              disk_space: [],
              root_folders: [],
              quality_profiles: [],
              system: {},
            };
          case "library_upcoming":
            return { items: [] };
          case "library_page":
            return {
              total: 1,
              revision: "s:1",
              offset: 0,
              items: [
                {
                  id: 4,
                  title: "On Disk Only",
                  hasFile: true,
                  added,
                  posterUrl: "",
                },
              ],
            };
          default:
            return {};
        }
      },
      locale: { language: "en" },
    } as never;
    el.setConfig({
      type: "custom:arr-series-card",
      instance: "Sonarr",
      tabs: ["add"],
      default_tab: "add",
      recent_days: 7,
    });
    document.body.appendChild(el);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 80));
    await el.updateComplete;
    const recent = el.shadowRoot?.querySelector('[data-row="recent"]');
    expect(recent?.textContent).to.contain("No Files Yet");
    expect(recent?.textContent).not.to.contain("On Disk Only");
  });
});

describe("arr-card editor", () => {
  it("follows the series card type for the monitor default", async () => {
    const editor = document.createElement("arr-card-editor") as HTMLElement & {
      setConfig: (config: Record<string, unknown>) => void;
    };
    editor.setConfig({ type: "custom:arr-series-card" });
    document.body.appendChild(editor);
    await editor.updateComplete;
    const monitor = editor.querySelector(
      '[data-field="monitor"]',
    ) as HTMLSelectElement | null;
    expect(monitor).to.exist;
    expect(monitor?.value).to.equal("all");
    expect(editor.textContent).to.contain("Search for missing episodes");
    expect(editor.textContent).not.to.contain("Minimum availability");
  });
});