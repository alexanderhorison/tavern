import { describe, expect, it, vi } from "vitest";
import {
  INITIAL,
  ROOMS,
  mergeRecords,
  parseSnapshot,
  safeUrl,
  validateRecord,
} from "./workspace";
import {
  canStand,
  insideSpawn,
  moveWithCollision,
  stairHeight,
} from "./navigation";
import { GAP, type Level } from "./workspace";

describe("Honest task-status imports", () => {
  const snapshot = {
    schemaVersion: 1,
    source: "Manually exported Hermes snapshot",
    recordedAt: "2026-10-09T10:00:00Z",
    agents: [
      {
        slotId: "slot-1",
        taskStatus: "Task ended",
        taskTitle: "Review a plan",
      },
    ],
  };
  it("starts with three slots and no invented task data or coordinator", () => {
    expect(INITIAL.agents).toHaveLength(3);
    expect(INITIAL.snapshot).toBeNull();
    expect(INITIAL.coordinator).toBeNull();
    expect(INITIAL.agents.every((a) => !a.profile)).toBe(true);
  });
  it("preserves recorded time and source, independently from the import time", () => {
    const { snapshot: result } = parseSnapshot(snapshot);
    expect(result.recordedAt).toBe(snapshot.recordedAt);
    expect(result.source).toBe(snapshot.source);
    expect(result.agents[0].taskStatus).toBe("Task ended");
    expect(result).not.toHaveProperty("connected");
  });
  it("does not fill in task status for absent slots", () => {
    const result = parseSnapshot(snapshot);
    expect(result.snapshot.agents).toHaveLength(1);
  });
  it("rejects unsupported schemas and undated data", () => {
    expect(() => parseSnapshot({ ...snapshot, schemaVersion: 2 })).toThrow();
    expect(() => parseSnapshot({ ...snapshot, recordedAt: "" })).toThrow();
    expect(() => parseSnapshot({ ...snapshot, source: "" })).toThrow();
  });
  it("rejects duplicate and unknown agent slots", () => {
    expect(() =>
      parseSnapshot({
        ...snapshot,
        agents: [snapshot.agents[0], snapshot.agents[0]],
      }),
    ).toThrow();
    expect(() =>
      parseSnapshot({
        ...snapshot,
        agents: [{ slotId: "slot-4", taskStatus: "Working" }],
      }),
    ).toThrow();
  });
});
describe("Knowledge and floor boundaries", () => {
  it("places only Bithealth on the company floor and all four personal projects on Floor 2", () => {
    expect(
      ROOMS.filter((r) => r.kind === "project" && r.level === 1).map(
        (r) => r.id,
      ),
    ).toEqual(["bithealth"]);
    expect(
      ROOMS.filter((r) => r.kind === "project" && r.level === 2).map(
        (r) => r.id,
      ),
    ).toEqual(["tba", "power", "kaffee", "engage"]);
  });
  it("labels records by their actual provenance and avoids executable source URLs", () => {
    const record = validateRecord(
      {
        title: "A decision",
        roomId: "tba",
        kind: "decision",
        sourceUrl: "javascript:alert(1)",
      },
      "manual",
    );
    expect(record.provenance).toBe("manual");
    expect(record.sourceUrl).toBe("");
    expect(safeUrl("https://example.com/source")).toBe(
      "https://example.com/source",
    );
  });
  it("rejects records in nonexistent rooms and blank titles", () => {
    expect(() =>
      validateRecord({ title: "", roomId: "tba", kind: "note" }, "manual"),
    ).toThrow();
    expect(() =>
      validateRecord(
        { title: "Hello", roomId: "unknown", kind: "note" },
        "manual",
      ),
    ).toThrow();
  });
  it("updates stable record IDs instead of adding duplicate books on repeated imports", () => {
    const a = validateRecord(
      { id: "one", title: "First", roomId: "archive", kind: "note" },
      "snapshot",
    );
    const b = { ...a, title: "Updated" };
    expect(mergeRecords([a], [b])).toEqual([b]);
  });
  it("can save distinct records on an HTTP preview without randomUUID", () => {
    vi.stubGlobal("crypto", {});
    try {
      const input = { title: "A local note", roomId: "archive", kind: "note" };
      const first = validateRecord(input, "manual"),
        second = validateRecord(input, "manual");
      expect(first.id).toBeTruthy();
      expect(first.id).not.toBe(second.id);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
describe("First-person navigation", () => {
  it("keeps all default floor spawns outside walls and furniture", () => {
    for (const floor of [-1, 0, 1, 2] as Level[])
      expect(canStand(insideSpawn(floor), floor)).toBe(true);
  });
  it("allows project doorways while blocking the adjacent wall and workbench", () => {
    expect(canStand({ x: 3, z: -0.15 }, 2)).toBe(true);
    expect(canStand({ x: 1.1, z: -0.15 }, 2)).toBe(false);
    expect(canStand({ x: 3, z: -4.2 }, 2)).toBe(false);
  });
  it("blocks water and outer boundaries", () => {
    expect(canStand({ x: 8.7, z: 4.1 }, 0)).toBe(false);
    expect(canStand({ x: 30, z: 0 }, 0)).toBe(false);
  });
  it("slides along a wall instead of crossing it", () => {
    const result = moveWithCollision({ x: 1.1, z: 0.5 }, 0.1, -0.5, 2);
    expect(result.x).toBeCloseTo(1.2);
    expect(result.z).toBe(0.5);
  });
  it("connects each stair to the correct floor elevations", () => {
    for (const floor of [-1, 0, 1] as Level[]) {
      expect(stairHeight(5, floor)).toBe(floor * GAP);
      expect(stairHeight(-5, floor)).toBe((floor + 1) * GAP);
    }
  });
});
