import { describe, it, expect } from "vitest";
import { resolveEntryId } from "./ws";
import type { HomeAssistant } from "./types";

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
});