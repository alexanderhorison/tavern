export type Level = -1 | 0 | 1 | 2;
export type Floor = Level | "all";
export type Archetype = "warrior" | "mage" | "archer" | "swordsman" | "healer";
export type RecordKind = "note" | "decision" | "review";
export const GAP = 7.5;
export const FLOOR_NAMES: Record<Level, string> = {
  [-1]: "Coordination den",
  0: "Welcome & recreation",
  1: "Bithealth",
  2: "Personal projects",
};
export const FLOOR_MARKS: Record<Level, string> = {
  [-1]: "B",
  0: "G",
  1: "1",
  2: "2",
};
export interface Room {
  id: string;
  name: string;
  theme: string;
  context: string;
  level: Level;
  x: number;
  z: number;
  width: number;
  depth: number;
  color: string;
  kind: "project" | "archive" | "supervisor" | "recreation" | "entry" | "den";
}
export const ROOMS: Room[] = [
  {
    id: "tba",
    name: "TBA - ERP AI Project",
    theme: "Quartermaster’s hall",
    context:
      "Your personal ERP AI project. Detailed project context has not been added.",
    level: 2,
    x: -9,
    z: -3.3,
    width: 5.7,
    depth: 6.2,
    color: "#9fb99b",
    kind: "project",
  },
  {
    id: "power",
    name: "Power Passion Ecommerce",
    theme: "Merchant’s workshop",
    context:
      "Your personal ecommerce project. Detailed project context has not been added.",
    level: 2,
    x: -3,
    z: -3.3,
    width: 5.7,
    depth: 6.2,
    color: "#d9947d",
    kind: "project",
  },
  {
    id: "kaffee",
    name: "Kaffee Area Mobile Apps",
    theme: "Alchemist’s café",
    context:
      "Your personal mobile apps project. Detailed project context has not been added.",
    level: 2,
    x: 3,
    z: -3.3,
    width: 5.7,
    depth: 6.2,
    color: "#d4b877",
    kind: "project",
  },
  {
    id: "engage",
    name: "1Engage Hackaton Landing Page",
    theme: "Bard’s atelier",
    context:
      "Your personal hackathon landing page project. Detailed project context has not been added.",
    level: 2,
    x: 9,
    z: -3.3,
    width: 5.7,
    depth: 6.2,
    color: "#b3a3cc",
    kind: "project",
  },
  {
    id: "archive",
    name: "Personal archive",
    theme: "Stories worth keeping",
    context:
      "Your personal knowledge library. Add notes, decisions, and reviewed work; new records add books to the guild.",
    level: 2,
    x: -8.7,
    z: 3.5,
    width: 5.4,
    depth: 3.5,
    color: "#d7bd8c",
    kind: "archive",
  },
  {
    id: "bithealth",
    name: "Bithealth",
    theme: "Healer’s study",
    context:
      "Your company workspace: you work at Bithealth. This whole floor is dedicated to company work. No company documents have been imported.",
    level: 1,
    x: 0,
    z: -2.1,
    width: 23,
    depth: 8.9,
    color: "#96b8c5",
    kind: "project",
  },
  {
    id: "supervisor",
    name: "Captain’s chamber",
    theme: "Your own quiet corner",
    context:
      "Your supervisor avatar has a map desk, a writing routine, and time to check in on the guild. These are decorative routines.",
    level: 0,
    x: -8.8,
    z: -3.6,
    width: 5.9,
    depth: 5.8,
    color: "#d4b48d",
    kind: "supervisor",
  },
  {
    id: "entrance",
    name: "Guild entrance",
    theme: "Welcome, adventurer",
    context:
      "The ground-floor entrance and quest reception. No real task dispatch or gateway connection is running.",
    level: 0,
    x: -9,
    z: 3.6,
    width: 5.5,
    depth: 4.4,
    color: "#c0ad85",
    kind: "entry",
  },
  {
    id: "tavern",
    name: "The Copper Kettle",
    theme: "Tavern & bar",
    context:
      "A warm place for a mug, a chat, and a break. Character conversations and sounds are decorative.",
    level: 0,
    x: 1.3,
    z: -4.1,
    width: 8,
    depth: 4.4,
    color: "#bd8b62",
    kind: "recreation",
  },
  {
    id: "games",
    name: "Games lounge",
    theme: "Billiards & board games",
    context:
      "Billiards, tabletop games, and a little friendly rivalry. Decorative recreation area.",
    level: 0,
    x: -1.6,
    z: 3.1,
    width: 8.1,
    depth: 4.9,
    color: "#a6b492",
    kind: "recreation",
  },
  {
    id: "training",
    name: "Training yard",
    theme: "Archery & practice",
    context:
      "Archery targets and a training dummy for your adventure party. Decorative routines only.",
    level: 0,
    x: 9.2,
    z: -4.2,
    width: 4.3,
    depth: 4.4,
    color: "#bfa97f",
    kind: "recreation",
  },
  {
    id: "fishing",
    name: "Stillwater pond",
    theme: "Fishing & daydreaming",
    context:
      "A quiet fishing pond with gently moving water. No real agent status is inferred from a fishing break.",
    level: 0,
    x: 8.8,
    z: -0.1,
    width: 4.6,
    depth: 3.5,
    color: "#86bcb8",
    kind: "recreation",
  },
  {
    id: "pool",
    name: "Sunbeam pool",
    theme: "Swimming & relaxing",
    context:
      "The guild swimming pool. The billiards table is in the games lounge.",
    level: 0,
    x: 8.7,
    z: 4.1,
    width: 4.8,
    depth: 3.6,
    color: "#87c3cc",
    kind: "recreation",
  },
  {
    id: "den",
    name: "Coordination den",
    theme: "The strategist’s lantern",
    context:
      "The shadowy basement for your coordinating agent. Select a coordinator in party settings later; selecting this room brightens its lanterns.",
    level: -1,
    x: 0,
    z: 0,
    width: 18,
    depth: 10.8,
    color: "#9383b2",
    kind: "den",
  },
];
export const roomById = (id: string) => ROOMS.find((room) => room.id === id);
export const ARCHETYPES: {
  id: Archetype;
  name: string;
  color: string;
  description: string;
}[] = [
  {
    id: "warrior",
    name: "Warrior",
    color: "#bd784c",
    description: "Copper armor, a brave heart, and a crimson cape.",
  },
  {
    id: "mage",
    name: "Mage",
    color: "#9781ba",
    description: "A lilac hat, curious eyes, and one more book.",
  },
  {
    id: "archer",
    name: "Archer",
    color: "#7b9c72",
    description: "A sage hood, a bow, and a fondness for fresh air.",
  },
  {
    id: "swordsman",
    name: "Swordsman",
    color: "#c4a172",
    description: "A peach cloak and a steady hand on the map.",
  },
  {
    id: "healer",
    name: "Healer",
    color: "#97bfc0",
    description: "A soft cream robe, a little satchel, and a caring spirit.",
  },
];
export interface Agent {
  id: string;
  name: string;
  archetype: Archetype;
  role: string;
  personality: string;
  profile: string;
  home: string;
}
export interface KnowledgeRecord {
  id: string;
  roomId: string;
  title: string;
  kind: RecordKind;
  body: string;
  sourceUrl: string;
  createdAt: string;
  provenance: "manual" | "snapshot";
}
export interface TaskSnapshot {
  slotId: string;
  taskStatus: string;
  taskTitle: string;
  details: string;
}
export interface Snapshot {
  source: string;
  recordedAt: string;
  importedAt: string;
  agents: TaskSnapshot[];
}
export interface Workspace {
  version: 1;
  agents: Agent[];
  supervisorName: string;
  coordinator: string | null;
  records: KnowledgeRecord[];
  snapshot: Snapshot | null;
}
export const INITIAL: Workspace = {
  version: 1,
  supervisorName: "You",
  coordinator: null,
  records: [],
  snapshot: null,
  agents: [
    {
      id: "slot-1",
      name: "Agent slot 1",
      archetype: "warrior",
      role: "Role to be assigned",
      personality: "Brave, thoughtful, and always happy to lend a hand.",
      profile: "",
      home: "tba",
    },
    {
      id: "slot-2",
      name: "Agent slot 2",
      archetype: "mage",
      role: "Role to be assigned",
      personality: "Curious and calm. Collects books and unexpected ideas.",
      profile: "",
      home: "bithealth",
    },
    {
      id: "slot-3",
      name: "Agent slot 3",
      archetype: "archer",
      role: "Role to be assigned",
      personality: "Observant, playful, and happiest beside the pond.",
      profile: "",
      home: "training",
    },
  ],
};
const STORAGE_KEY = "tavern.workspace.v1";
const clipped = (value: unknown, fallback = "", limit = 300) =>
  typeof value === "string" ? value.trim().slice(0, limit) : fallback;
// Record IDs are local labels, not credentials. Support temporary HTTP VPS previews too.
const newRecordId = () =>
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `record-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
export function safeUrl(value: string) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}
export function validateRecord(
  input: unknown,
  provenance: "manual" | "snapshot",
): KnowledgeRecord {
  if (!input || typeof input !== "object")
    throw new Error("Each record must be an object.");
  const value = input as Record<string, unknown>;
  if (!roomById(String(value.roomId)))
    throw new Error("A record refers to an unknown room.");
  const title = clipped(value.title, "", 120);
  if (!title) throw new Error("Every record needs a title.");
  if (!["note", "decision", "review"].includes(String(value.kind)))
    throw new Error("Record kind must be note, decision, or review.");
  return {
    id: clipped(value.id) || newRecordId(),
    roomId: String(value.roomId),
    title,
    kind: value.kind as RecordKind,
    body: clipped(value.body, "", 10000),
    sourceUrl: safeUrl(clipped(value.sourceUrl, "", 2000)),
    createdAt: clipped(value.createdAt) || new Date().toISOString(),
    provenance,
  };
}
export function parseSnapshot(input: unknown): {
  snapshot: Snapshot;
  records: KnowledgeRecord[];
} {
  if (!input || typeof input !== "object")
    throw new Error("The snapshot must be a JSON object.");
  const value = input as Record<string, unknown>;
  if (value.schemaVersion !== 1)
    throw new Error("Expected snapshot schemaVersion 1.");
  const source = clipped(value.source);
  if (!source) throw new Error("A snapshot needs a source label.");
  const recordedAt = clipped(value.recordedAt);
  if (!recordedAt || !Number.isFinite(Date.parse(recordedAt)))
    throw new Error("A snapshot needs a valid recordedAt timestamp.");
  if (!Array.isArray(value.agents) || value.agents.length > 3)
    throw new Error("A snapshot may contain up to three agent slots.");
  const seen = new Set<string>();
  const agents = value.agents.map((raw: unknown) => {
    if (!raw || typeof raw !== "object")
      throw new Error("Invalid agent snapshot.");
    const item = raw as Record<string, unknown>;
    const slotId = clipped(item.slotId);
    if (
      !INITIAL.agents.some((agent) => agent.id === slotId) ||
      seen.has(slotId)
    )
      throw new Error(
        "Agent slot IDs must be unique slot-1, slot-2, or slot-3.",
      );
    seen.add(slotId);
    const taskStatus = clipped(item.taskStatus, "", 100);
    if (!taskStatus) throw new Error("Agent snapshots need a taskStatus.");
    return {
      slotId,
      taskStatus,
      taskTitle: clipped(item.taskTitle, "", 300),
      details: clipped(item.details, "", 5000),
    };
  });
  const records = Array.isArray(value.records)
    ? value.records
        .slice(0, 300)
        .map((record) => validateRecord(record, "snapshot"))
    : [];
  return {
    snapshot: {
      source,
      recordedAt,
      importedAt: new Date().toISOString(),
      agents,
    },
    records,
  };
}
export function loadWorkspace(): Workspace {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (value?.version !== 1) return structuredClone(INITIAL);
    const agents = INITIAL.agents.map((defaultAgent) => {
      const raw = Array.isArray(value.agents)
        ? value.agents.find((a: Agent) => a.id === defaultAgent.id)
        : null;
      if (!raw) return defaultAgent;
      return {
        ...defaultAgent,
        name: clipped(raw.name, defaultAgent.name, 40),
        role: clipped(raw.role, defaultAgent.role, 100),
        personality: clipped(raw.personality, defaultAgent.personality, 700),
        profile: clipped(raw.profile, "", 100),
        archetype: ARCHETYPES.some((a) => a.id === raw.archetype)
          ? raw.archetype
          : defaultAgent.archetype,
        home: roomById(raw.home) ? raw.home : defaultAgent.home,
      };
    });
    const records = Array.isArray(value.records)
      ? value.records
          .slice(0, 500)
          .map((r: KnowledgeRecord) =>
            validateRecord(
              r,
              r.provenance === "snapshot" ? "snapshot" : "manual",
            ),
          )
      : [];
    let snapshot = null;
    if (value.snapshot)
      snapshot = parseSnapshot({
        ...value.snapshot,
        schemaVersion: 1,
      }).snapshot;
    return {
      version: 1,
      agents,
      supervisorName: clipped(value.supervisorName, "You", 40),
      coordinator: agents.some((a) => a.id === value.coordinator)
        ? value.coordinator
        : null,
      records,
      snapshot,
    };
  } catch {
    return structuredClone(INITIAL);
  }
}
export function saveWorkspace(workspace: Workspace) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
}
export function mergeRecords(
  existing: KnowledgeRecord[],
  incoming: KnowledgeRecord[],
) {
  const byId = new Map(existing.map((record) => [record.id, record]));
  incoming.forEach((record) => byId.set(record.id, record));
  return [...byId.values()];
}
