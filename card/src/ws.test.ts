import { describe, it, expect } from "vitest";
import { resolveArrEntry, resolveEntryId } from "./ws";
import type { HomeAssistant } from "./types";

function hassWith(
  entries: { entry_id: string; title: string }[],
  instances?: { entry_id: string; title: string; app?: string }[] | "fail",
): HomeAssistant {
  return {
    callWS: async (msg: Record<string, unknown>) => {
      if (msg.type === "config_entries/get") {
        return entries.map((entry) => ({
          ...entry,
          domain: "arr_dashboard",
        }));
      }
      if (msg.type === "arr_dashboard" && msg.command === "list_instances") {
        if (instances === "fail") throw new Error("unknown_command");
        return { instances: instances ?? [] };
      }
      return {};
    },
  } as unknown as HomeAssistant;
}

describe("resolveEntryId", () => {
  it("uses config_entries/get for arr_dashboard domain", async () => {
    const calls: unknown[] = [];
    const hass = {
      callWS: async (msg: Record<string, unknown>) => {
        calls.push(msg);
        if (msg.type === "config_entries/get") {
          return [
            {
              entry_id: "e1",
              domain: "arr_dashboard",
              title: "Radarr",
            },
          ];
        }
        return [];
      },
    } as unknown as HomeAssistant;
    const id = await resolveEntryId(hass);
    expect(id).to.equal("e1");
    expect(calls[0]).to.deep.equal({
      type: "config_entries/get",
      domain: "arr_dashboard",
    });
  });

  it("returns undefined when instance name does not match", async () => {
    const hass = {
      callWS: async () => [
        { entry_id: "e1", domain: "arr_dashboard", title: "Radarr" },
      ],
    } as unknown as HomeAssistant;
    const id = await resolveEntryId(hass, "Missing");
    expect(id).to.be.undefined;
  });

  it("does not auto-pick a lone Radarr entry for the series card", async () => {
    const hass = hassWith(
      [{ entry_id: "rad", title: "Radarr" }],
      [{ entry_id: "rad", title: "Radarr", app: "radarr" }],
    );
    const id = await resolveEntryId(hass, undefined, "sonarr");
    expect(id).to.be.undefined;
    const named = await resolveArrEntry(hass, "Radarr", "sonarr");
    expect(named?.entryId).to.equal("rad");
    expect(named?.mismatch).to.equal(true);
  });

  it("auto-picks the Sonarr entry and treats a missing app as Radarr", async () => {
    const hass = hassWith(
      [
        { entry_id: "rad", title: "Radarr" },
        { entry_id: "son", title: "Sonarr" },
        { entry_id: "old", title: "Old" },
      ],
      [
        { entry_id: "son", title: "Sonarr", app: "sonarr" },
        { entry_id: "rad", title: "Radarr", app: "radarr" },
      ],
    );
    const series = await resolveEntryId(hass, undefined, "sonarr");
    const movies = await resolveEntryId(hass, undefined, "radarr");
    expect(series).to.equal("son");
    expect(movies).to.equal("rad");
    const legacy = await resolveArrEntry(hass, "Old", "sonarr");
    expect(legacy?.app).to.equal("radarr");
    expect(legacy?.mismatch).to.equal(true);
  });
});