import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Castle,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Compass,
  Download,
  Feather,
  FileCheck,
  Gamepad2,
  LampDesk,
  Layers3,
  Map,
  Maximize2,
  Menu,
  Minus,
  Music2,
  Pause,
  Play,
  PlugZap,
  Plus,
  RotateCcw,
  Settings2,
  Shield,
  Sparkles,
  Swords,
  Upload,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { CameraCommand, Direction } from "./scene/GuildScene";
import type { Routine } from "./scene/Characters";
import Portrait from "./components/Portrait";
import {
  ARCHETYPES,
  FLOOR_MARKS,
  FLOOR_NAMES,
  ROOMS,
  INITIAL,
  loadWorkspace,
  mergeRecords,
  parseSnapshot,
  roomById,
  saveWorkspace,
  validateRecord,
  type Agent,
  type Floor,
  type KnowledgeRecord,
  type Level,
  type Workspace,
} from "./lib/workspace";
import { GuildAudio } from "./lib/audio";

const GuildScene = lazy(() => import("./scene/GuildScene"));

class SceneBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="scene-error">
        <Castle size={48} />
        <h2>The guild needs a 3D-capable browser</h2>
        <p>
          Enable hardware acceleration and reload, or try a recent Chrome, Edge,
          Firefox, or Safari.
        </p>
        <button onClick={() => location.reload()}>Reload the guild</button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    dialog.current
      ?.querySelector<HTMLElement>("button, input, select, textarea")
      ?.focus();
    const keys = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const focusable = [
          ...(dialog.current?.querySelectorAll<HTMLElement>(
            "button:not([disabled]), input, select, textarea, a[href]",
          ) || []),
        ];
        if (event.shiftKey && document.activeElement === focusable[0]) {
          event.preventDefault();
          focusable.at(-1)?.focus();
        }
        if (!event.shiftKey && document.activeElement === focusable.at(-1)) {
          event.preventDefault();
          focusable[0]?.focus();
        }
      }
    };
    document.addEventListener("keydown", keys);
    return () => {
      document.removeEventListener("keydown", keys);
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="modal-backdrop"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={dialog}
      >
        <header>
          <div>
            <span className="eyebrow">GUILD JOURNAL</span>
            <h2 id="modal-title">{title}</h2>
          </div>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
const floorLevels: Level[] = [2, 1, 0, -1];
function RoomIcon({ roomId, size = 18 }: { roomId: string; size?: number }) {
  const kind = roomById(roomId)?.kind;
  return kind === "archive" ? (
    <BookOpen size={size} />
  ) : kind === "den" ? (
    <Compass size={size} />
  ) : kind === "supervisor" ? (
    <Shield size={size} />
  ) : kind === "recreation" ? (
    <Gamepad2 size={size} />
  ) : kind === "entry" ? (
    <Castle size={size} />
  ) : (
    <Feather size={size} />
  );
}
export default function App() {
  const [workspace, setWorkspace] = useState<Workspace>(loadWorkspace);
  const [floor, setFloor] = useState<Floor>("all");
  const [mode, setMode] = useState<"guild" | "inside">("guild");
  const [selection, setSelection] = useState<string | null>(null);
  const [tab, setTab] = useState<"party" | "rooms" | "journal">("party");
  const [paused, setPaused] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [labels, setLabels] = useState(true);
  const [quality, setQuality] = useState<"balanced" | "low">(() =>
    window.innerWidth < 700 ? "low" : "balanced",
  );
  const [routines, setRoutines] = useState<Record<string, Routine>>({});
  const [held, setHeld] = useState(new Set<Direction>());
  const [command, setCommand] = useState<CameraCommand | null>(null);
  const [modal, setModal] = useState<
    "help" | "settings" | "agent" | "record" | null
  >(null);
  const [editingAgent, setEditingAgent] = useState("slot-1");
  const [agentDraft, setAgentDraft] = useState<Agent>(workspace.agents[0]);
  const [coordinatorDraft, setCoordinatorDraft] = useState(false);
  const [recordDraft, setRecordDraft] = useState({
    roomId: "archive",
    title: "",
    kind: "note" as KnowledgeRecord["kind"],
    body: "",
    sourceUrl: "",
  });
  const [music, setMusic] = useState(false),
    [sounds, setSounds] = useState(false),
    [volume, setVolume] = useState(0.3);
  const [notice, setNotice] = useState("");
  const [mobilePanel, setMobilePanel] = useState(false);
  const importInput = useRef<HTMLInputElement>(null),
    viewport = useRef<HTMLDivElement>(null),
    audio = useRef<GuildAudio | null>(null);
  const closeModal = useCallback(() => setModal(null), []);
  const onRoutine = useCallback(
    (id: string, routine: Routine) =>
      setRoutines((previous) =>
        previous[id] === routine ? previous : { ...previous, [id]: routine },
      ),
    [],
  );
  const onSelect = useCallback((id: string) => {
    setSelection(id || null);
    if (id) setMobilePanel(true);
  }, []);
  useEffect(() => {
    try {
      saveWorkspace(workspace);
    } catch {
      setNotice(
        "Browser storage is full or unavailable. Export your guild to keep a copy.",
      );
    }
  }, [workspace]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 7000);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    const instance = new GuildAudio();
    audio.current = instance;
    return () => instance.dispose();
  }, []);
  useEffect(() => {
    const clear = () => setHeld(new Set());
    window.addEventListener("pointerup", clear);
    window.addEventListener("pointercancel", clear);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("pointerup", clear);
      window.removeEventListener("pointercancel", clear);
      window.removeEventListener("blur", clear);
    };
  }, []);
  const selectedAgent = workspace.agents.find(
    (agent) => agent.id === selection,
  );
  const selectedRoom =
    selection === "supervisor" ? undefined : roomById(selection || "");
  const task = workspace.snapshot?.agents.find(
    (agent) => agent.slotId === selectedAgent?.id,
  );
  const fireCamera = (type: CameraCommand["type"]) =>
    setCommand({ type, nonce: performance.now() });
  const chooseFloor = (next: Floor) => {
    setFloor(mode === "inside" && next === "all" ? 0 : next);
  };
  const enter = () => {
    if (floor === "all") setFloor(selectedRoom?.level ?? 0);
    setHeld(new Set());
    setMode("inside");
  };
  const openAgent = (id: string) => {
    const agent = workspace.agents.find((a) => a.id === id)!;
    setEditingAgent(id);
    setAgentDraft({ ...agent });
    setCoordinatorDraft(workspace.coordinator === id);
    setModal("agent");
  };
  const openRecord = () => {
    setRecordDraft({
      roomId: selectedRoom?.id ?? "archive",
      title: "",
      kind: "note",
      body: "",
      sourceUrl: "",
    });
    setModal("record");
  };
  const toggleAudio = async (kind: "music" | "sounds") => {
    try {
      await audio.current?.activate();
      if (kind === "music") {
        audio.current!.music = !music;
        setMusic(!music);
      } else {
        audio.current!.sounds = !sounds;
        setSounds(!sounds);
      }
    } catch {
      setNotice(
        "Audio could not start in this browser. Try again after interacting with the page.",
      );
    }
  };
  const exportGuild = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(workspace, null, 2)], {
        type: "application/json",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "tavern-guild-backup.json";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Guild backup exported.");
  };
  const importSnapshot = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > 2_000_000)
        throw new Error("Choose a JSON file smaller than 2 MB.");
      const input = JSON.parse(await file.text());
      if (
        input.version === 1 &&
        Array.isArray(input.agents) &&
        Array.isArray(input.records)
      ) {
        if (
          input.agents.length !== 3 ||
          input.agents.some(
            (a: Agent) =>
              !INITIAL.agents.some((defaultAgent) => a.id === defaultAgent.id),
          )
        )
          throw new Error("Backup must contain the three guild slots.");
        const normalized = {
          ...INITIAL,
          ...input,
          agents: INITIAL.agents.map((defaultAgent) => {
            const a = input.agents.find(
              (item: Agent) => item.id === defaultAgent.id,
            );
            return {
              ...defaultAgent,
              name: String(a.name || defaultAgent.name).slice(0, 40),
              role: String(a.role || defaultAgent.role).slice(0, 100),
              personality: String(a.personality || "").slice(0, 700),
              profile: String(a.profile || "").slice(0, 100),
              archetype: ARCHETYPES.some((item) => item.id === a.archetype)
                ? a.archetype
                : defaultAgent.archetype,
              home: roomById(a.home) ? a.home : defaultAgent.home,
            };
          }),
          supervisorName: String(input.supervisorName || "You").slice(0, 40),
          coordinator: INITIAL.agents.some((a) => a.id === input.coordinator)
            ? input.coordinator
            : null,
          records: input.records
            .slice(0, 500)
            .map((r: KnowledgeRecord) =>
              validateRecord(
                r,
                r.provenance === "snapshot" ? "snapshot" : "manual",
              ),
            ),
          snapshot: input.snapshot
            ? parseSnapshot({ ...input.snapshot, schemaVersion: 1 }).snapshot
            : null,
        };
        setWorkspace(normalized);
        setNotice("Guild backup restored. Hermes remains disconnected.");
      } else {
        const parsed = parseSnapshot(input);
        setWorkspace((previous) => ({
          ...previous,
          snapshot: parsed.snapshot,
          records: mergeRecords(previous.records, parsed.records),
        }));
        setNotice(
          "Snapshot imported. Status is historical snapshot data; no live connection was started.",
        );
      }
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "This JSON file could not be imported.",
      );
    }
    if (importInput.current) importInput.current.value = "";
  };
  const directionButton = (
    direction: Direction,
    icon: ReactNode,
    label: string,
  ) => (
    <button
      className={`direction ${held.has(direction) ? "pressed" : ""}`}
      aria-label={label}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        setHeld((previous) => new Set(previous).add(direction));
      }}
      onPointerUp={() =>
        setHeld((previous) => {
          const next = new Set(previous);
          next.delete(direction);
          return next;
        })
      }
      onKeyDown={(event) => {
        if (event.key === " " || event.key === "Enter")
          setHeld((previous) => new Set(previous).add(direction));
      }}
      onKeyUp={() => setHeld(new Set())}
    >
      {icon}
    </button>
  );
  const currentLevel = floor === "all" ? null : floor;
  const recordCards = (records: KnowledgeRecord[]) =>
    records.length ? (
      <div className="records-list">
        {records.map((record) => (
          <article className="record-card" key={record.id}>
            <div className="record-top">
              <span className={`record-kind ${record.kind}`}>
                {record.kind === "review" ? (
                  <FileCheck size={12} />
                ) : record.kind === "decision" ? (
                  <Compass size={12} />
                ) : (
                  <Feather size={12} />
                )}
                {record.kind}
              </span>
              <span>
                {record.provenance === "manual" ? "You added" : "Imported"}
              </span>
            </div>
            <h4>{record.title}</h4>
            {record.body && <p>{record.body}</p>}
            <footer>
              <button
                onClick={() => {
                  onSelect(record.roomId);
                  setTab("rooms");
                }}
              >
                {roomById(record.roomId)?.name}
              </button>
              {record.sourceUrl && (
                <a href={record.sourceUrl} target="_blank" rel="noreferrer">
                  Source ↗
                </a>
              )}
              <button
                aria-label={`Delete ${record.title}`}
                onClick={() =>
                  setWorkspace((previous) => ({
                    ...previous,
                    records: previous.records.filter((r) => r.id !== record.id),
                  }))
                }
              >
                Remove
              </button>
            </footer>
          </article>
        ))}
      </div>
    ) : (
      <div className="empty-state">
        <BookOpen size={29} />
        <h3>A story waiting to be written</h3>
        <p>
          Add your first note, decision, or reviewed work. Every record adds a
          little more knowledge to the guild.
        </p>
        <button className="primary-button" onClick={openRecord}>
          <Plus size={15} /> Add a record
        </button>
      </div>
    );

  return (
    <div className="app-shell">
      <div className="app-content" aria-hidden={modal ? true : undefined}>
        <header className="app-header">
          <button
            className="brand"
            onClick={() => {
              setMode("guild");
              setFloor("all");
              setSelection(null);
              fireCamera("reset");
            }}
            aria-label="Tavern guild home"
          >
            <span className="brand-mark">
              <Castle size={25} strokeWidth={1.6} />
            </span>
            <span>
              <strong>
                Tavern<span className="brand-dot">.</span>
              </strong>
              <span className="brand-caption">YOUR AGENT GUILD</span>
            </span>
          </button>
          <div className="view-switch" aria-label="Camera view">
            <button
              className={mode === "guild" ? "active" : ""}
              onClick={() => {
                setMode("guild");
                setHeld(new Set());
              }}
            >
              <Layers3 size={15} /> Guild view
            </button>
            <button
              className={mode === "inside" ? "active" : ""}
              onClick={enter}
            >
              <Compass size={15} /> Step inside
            </button>
          </div>
          <div className="header-actions">
            <button
              className="connection-badge"
              aria-label="Hermes disconnected"
              title="Hermes gateway is disconnected"
              onClick={() => setModal("settings")}
            >
              <PlugZap size={14} />
              <span>Hermes disconnected</span>
            </button>
            <button
              className="icon-button"
              aria-label="Help and controls"
              onClick={() => setModal("help")}
            >
              <CircleHelp size={19} />
            </button>
            <button
              className="icon-button"
              aria-label="Guild settings"
              onClick={() => setModal("settings")}
            >
              <Settings2 size={19} />
            </button>
          </div>
        </header>
        <main>
          <section className="world" aria-label="Interactive 3D guild">
            <div className="scene-breadcrumb">
              <span className="live-glyph">
                <Map size={15} />
              </span>
              <div>
                <strong>
                  {currentLevel === null
                    ? "The whole guild"
                    : FLOOR_NAMES[currentLevel]}
                </strong>
                <span>
                  {mode === "inside"
                    ? "Walk around & make yourself at home"
                    : currentLevel === 1
                      ? "Your company workspace"
                      : currentLevel === 2
                        ? "Your personal project rooms"
                        : currentLevel === -1
                          ? "A quiet place to coordinate"
                          : "A cozy place for big ideas"}
                </span>
              </div>
              <span className="preview-badge">Local workspace</span>
            </div>
            <nav className="floor-rail" aria-label="Floors">
              <span className="rail-title">LEVELS</span>
              <button
                title="All floors"
                aria-label="Show all floors"
                aria-pressed={floor === "all"}
                className={floor === "all" ? "active" : ""}
                onClick={() => {
                  if (mode === "inside") setMode("guild");
                  setFloor("all");
                }}
              >
                <Layers3 size={18} />
              </button>
              {floorLevels.map((level) => (
                <button
                  key={level}
                  aria-label={`Show ${level === -1 ? "basement" : level === 0 ? "ground floor" : `floor ${level}`}`}
                  title={FLOOR_NAMES[level]}
                  className={floor === level ? "active" : ""}
                  aria-pressed={floor === level}
                  onClick={() => chooseFloor(level)}
                >
                  {FLOOR_MARKS[level]}
                  <span>
                    {level === -1
                      ? "DEN"
                      : level === 0
                        ? "GROUND"
                        : level === 1
                          ? "WORK"
                          : "PERSONAL"}
                  </span>
                </button>
              ))}
            </nav>
            <div className="canvas-container" ref={viewport}>
              <SceneBoundary>
                <Suspense
                  fallback={
                    <div className="scene-loading">
                      <Castle size={32} />
                      <p>Opening the guild…</p>
                    </div>
                  }
                >
                  <GuildScene
                    floor={floor}
                    setFloor={setFloor}
                    mode={mode}
                    workspace={workspace}
                    selection={selection}
                    onSelect={onSelect}
                    paused={paused}
                    labels={labels}
                    onRoutine={onRoutine}
                    held={held}
                    command={command}
                    quality={quality}
                    inputEnabled={!modal}
                  />
                </Suspense>
              </SceneBoundary>
            </div>
            {mode === "inside" && (
              <>
                <div className="inside-hint">
                  <Compass size={15} />
                  <span>
                    WASD / arrows to walk · Q / E to turn · Drag to look
                    <br />
                    Stairs are along the right edge. Floor buttons can jump to a
                    level.
                  </span>
                </div>
                <div className="direction-pad">
                  <div className="turn-controls">
                    {directionButton(
                      "turnLeft",
                      <RotateCcw size={17} />,
                      "Turn left",
                    )}
                    {directionButton(
                      "turnRight",
                      <RotateCcw
                        size={17}
                        style={{ transform: "scaleX(-1)" }}
                      />,
                      "Turn right",
                    )}
                  </div>
                  <div className="dpad-up">
                    {directionButton(
                      "forward",
                      <ArrowUp size={20} />,
                      "Walk forward",
                    )}
                  </div>
                  <div className="dpad-row">
                    {directionButton(
                      "left",
                      <ArrowLeft size={20} />,
                      "Walk left",
                    )}
                    {directionButton(
                      "back",
                      <ArrowDown size={20} />,
                      "Walk backward",
                    )}
                    {directionButton(
                      "right",
                      <ArrowRight size={20} />,
                      "Walk right",
                    )}
                  </div>
                </div>
              </>
            )}
            <div className="world-footer">
              <div className="decorative-note">
                <Sparkles size={13} />
                <span>
                  Character life is decorative
                  <span className="desktop-hint">
                    {" "}
                    · Task status comes from imported data only
                  </span>
                </span>
              </div>
              <div className="camera-controls">
                {mode === "guild" && (
                  <>
                    <button
                      aria-label="Rotate left"
                      title="Rotate left"
                      onClick={() => fireCamera("left")}
                    >
                      <RotateCcw size={17} />
                    </button>
                    <button
                      aria-label="Zoom out"
                      onClick={() => fireCamera("out")}
                    >
                      <Minus size={17} />
                    </button>
                    <button
                      aria-label="Zoom in"
                      onClick={() => fireCamera("in")}
                    >
                      <Plus size={17} />
                    </button>
                    <span className="control-divider" />
                  </>
                )}
                <button
                  aria-label="Reset view"
                  title="Reset view"
                  onClick={() => fireCamera("reset")}
                >
                  <Maximize2 size={16} />
                </button>
                <button
                  title={
                    paused
                      ? "Resume decorative routines"
                      : "Pause decorative routines"
                  }
                  aria-label={paused ? "Resume party" : "Pause party"}
                  aria-pressed={paused}
                  onClick={() => setPaused(!paused)}
                >
                  {paused ? <Play size={16} /> : <Pause size={16} />}
                </button>
                <button
                  aria-label={labels ? "Hide labels" : "Show labels"}
                  title="Character and room labels"
                  aria-pressed={labels}
                  onClick={() => setLabels(!labels)}
                >
                  <span className="text-icon">Aa</span>
                </button>
                <span className="control-divider" />
                <button
                  aria-label={music ? "Mute music" : "Enable music"}
                  aria-pressed={music}
                  title={music ? "Music on" : "Music off"}
                  onClick={() => void toggleAudio("music")}
                  className={music ? "enabled" : ""}
                >
                  <Music2 size={17} />
                </button>
                <button
                  aria-label={
                    sounds ? "Mute office sounds" : "Enable office sounds"
                  }
                  aria-pressed={sounds}
                  title={sounds ? "Office sounds on" : "Office sounds off"}
                  onClick={() => void toggleAudio("sounds")}
                >
                  {sounds ? <Volume2 size={17} /> : <VolumeX size={17} />}
                </button>
              </div>
              <span className="camera-hint">
                {mode === "guild"
                  ? "Drag to rotate · Right-drag to pan · Scroll to zoom"
                  : "Drag to look · Hold arrows to walk"}
              </span>
            </div>
            <button
              className="mobile-panel-toggle"
              onClick={() => setMobilePanel(!mobilePanel)}
            >
              <Menu size={17} />
              {mobilePanel ? "Close journal" : "Open guild journal"}
              <ChevronDown size={15} />
            </button>
          </section>
          <aside
            className={`side-panel ${mobilePanel ? "mobile-open" : ""}`}
            aria-label="Guild journal"
          >
            <header className="panel-header">
              <div>
                <span className="eyebrow">MAKE YOURSELF AT HOME</span>
                <h2>
                  Guild journal<span>✦</span>
                </h2>
              </div>
              <button
                className="icon-button mobile-close"
                aria-label="Close guild journal"
                onClick={() => setMobilePanel(false)}
              >
                <X size={18} />
              </button>
            </header>
            <nav className="panel-tabs" aria-label="Journal sections">
              {(["party", "rooms", "journal"] as const).map((item) => (
                <button
                  className={tab === item ? "active" : ""}
                  key={item}
                  onClick={() => {
                    setTab(item);
                    setSelection(null);
                  }}
                >
                  {item === "party" ? (
                    <Swords size={15} />
                  ) : item === "rooms" ? (
                    <Castle size={15} />
                  ) : (
                    <BookOpen size={15} />
                  )}
                  {item === "journal"
                    ? "Knowledge"
                    : item[0].toUpperCase() + item.slice(1)}
                </button>
              ))}
            </nav>
            <div className="panel-scroll">
              {selection && (
                <button
                  className="back-link"
                  onClick={() => setSelection(null)}
                >
                  <ChevronLeft size={14} /> Back to the guild
                </button>
              )}
              {selectedAgent ? (
                <div className="agent-detail">
                  <div
                    className="hero-portrait"
                    style={{
                      background: `linear-gradient(140deg, ${ARCHETYPES.find((a) => a.id === selectedAgent.archetype)?.color}24, #f5eede)`,
                    }}
                  >
                    <span className="corner-star">✧</span>
                    <Portrait archetype={selectedAgent.archetype} />
                    <span className="appearance-badge">
                      {selectedAgent.archetype}
                    </span>
                  </div>
                  <h2>{selectedAgent.name}</h2>
                  <p className="role-line">
                    {selectedAgent.role}
                    {workspace.coordinator === selectedAgent.id && (
                      <span className="tag">Coordinator</span>
                    )}
                  </p>
                  <blockquote>“{selectedAgent.personality}”</blockquote>
                  <div className="detail-row">
                    <span>Hermes profile</span>
                    <strong>{selectedAgent.profile || "Assign later"}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Character home</span>
                    <strong>
                      {
                        roomById(
                          workspace.coordinator === selectedAgent.id
                            ? "den"
                            : selectedAgent.home,
                        )?.name
                      }
                    </strong>
                  </div>
                  <div className="status-card">
                    <span className="eyebrow">ACTUAL TASK STATUS</span>
                    <div>
                      <span className={`status-tag ${task ? "imported" : ""}`}>
                        {task ? "Imported snapshot" : "Unavailable"}
                      </span>
                    </div>
                    {task ? (
                      <>
                        <h4>
                          {task.taskStatus}
                          {task.taskTitle && ` · ${task.taskTitle}`}
                        </h4>
                        <p>{task.details}</p>
                        <small>
                          {workspace.snapshot!.source} · Recorded{" "}
                          {new Date(
                            workspace.snapshot!.recordedAt,
                          ).toLocaleString()}
                        </small>
                      </>
                    ) : (
                      <p>
                        Hermes is not connected. No live agent activity is
                        available.
                      </p>
                    )}
                  </div>
                  <div className="routine-card">
                    <Sparkles size={17} />
                    <div>
                      <strong>
                        {routines[selectedAgent.id] || "Taking a break"}
                        {paused && " · paused"}
                      </strong>
                      <span>Decorative character routine</span>
                    </div>
                  </div>
                  <button
                    className="primary-button full"
                    onClick={() => openAgent(selectedAgent.id)}
                  >
                    <Settings2 size={15} /> Customize character
                  </button>
                </div>
              ) : selectedRoom ? (
                <div className="room-detail">
                  <div
                    className="room-hero"
                    style={{
                      background: `${selectedRoom.color}30`,
                      color: selectedRoom.color,
                    }}
                  >
                    <RoomIcon roomId={selectedRoom.id} size={45} />
                    <span>
                      {FLOOR_MARKS[selectedRoom.level]} ·{" "}
                      {FLOOR_NAMES[selectedRoom.level]}
                    </span>
                  </div>
                  <span className="eyebrow">{selectedRoom.theme}</span>
                  <h2>{selectedRoom.name}</h2>
                  <p>{selectedRoom.context}</p>
                  <span className="tag">
                    {selectedRoom.kind === "project"
                      ? "Project name supplied by you"
                      : "Guild space"}
                  </span>
                  <button
                    className="secondary-button full"
                    onClick={() => {
                      setFloor(selectedRoom.level);
                      setMobilePanel(false);
                    }}
                  >
                    <Layers3 size={15} /> Focus this floor
                  </button>
                  <button
                    className="primary-button full"
                    onClick={() => {
                      setFloor(selectedRoom.level);
                      setMode("inside");
                      setMobilePanel(false);
                    }}
                  >
                    <Compass size={15} /> Step onto this floor
                  </button>
                  <div className="section-title">
                    <h3>Books & decisions</h3>
                    <button
                      className="icon-button"
                      aria-label="Add a record to this room"
                      onClick={openRecord}
                    >
                      <Plus size={17} />
                    </button>
                  </div>
                  {recordCards(
                    workspace.records.filter(
                      (record) => record.roomId === selectedRoom.id,
                    ),
                  )}
                </div>
              ) : selection === "supervisor" ? (
                <div className="agent-detail">
                  <div className="hero-portrait">
                    <Portrait archetype="swordsman" />
                  </div>
                  <h2>{workspace.supervisorName}</h2>
                  <p className="role-line">Guild supervisor</p>
                  <p>
                    Your captain’s chamber is on the ground floor. Your avatar
                    writes, welcomes the party, and checks in with the guild.
                  </p>
                  <div className="routine-card">
                    <Sparkles size={17} />
                    <div>
                      <strong>
                        {routines.supervisor || "Writing"}
                        {paused && " · paused"}
                      </strong>
                      <span>Decorative supervisor routine</span>
                    </div>
                  </div>
                  <button
                    className="secondary-button full"
                    onClick={() => setModal("settings")}
                  >
                    <Settings2 size={15} /> Change supervisor name
                  </button>
                </div>
              ) : tab === "party" ? (
                <>
                  <div className="welcome-copy">
                    <h3>
                      A little party.
                      <br />A world of possibilities.
                    </h3>
                    <p>
                      Three characters, ready for your Hermes profiles. Give
                      them a name and make the guild yours.
                    </p>
                  </div>
                  <div className="party-list">
                    {workspace.agents.map((agent) => (
                      <button
                        className="party-card"
                        key={agent.id}
                        onClick={() => onSelect(agent.id)}
                      >
                        <div className={`avatar-frame ${agent.archetype}`}>
                          <Portrait archetype={agent.archetype} small />
                        </div>
                        <div>
                          <strong>{agent.name}</strong>
                          <span>
                            {workspace.coordinator === agent.id
                              ? "Coordinator"
                              : agent.role}
                          </span>
                          <small>
                            <Sparkles size={10} />{" "}
                            {routines[agent.id] || "Taking a break"} ·
                            decorative
                          </small>
                        </div>
                        <ChevronRight size={15} />
                      </button>
                    ))}
                  </div>
                  <button
                    className="supervisor-card"
                    onClick={() => onSelect("supervisor")}
                  >
                    <div className="avatar-frame supervisor">
                      <Portrait archetype="swordsman" small />
                    </div>
                    <div>
                      <span className="eyebrow">YOUR AVATAR</span>
                      <strong>
                        {workspace.supervisorName}, the supervisor
                      </strong>
                      <span>Captain’s chamber · Ground</span>
                    </div>
                    <ChevronRight size={15} />
                  </button>
                  <div className="connection-note">
                    <PlugZap size={18} />
                    <div>
                      <strong>
                        {workspace.snapshot
                          ? "Snapshot available · gateway offline"
                          : "Waiting for your Hermes gateway"}
                      </strong>
                      <p>
                        {workspace.snapshot
                          ? "Imported status is a historical snapshot, never a live signal."
                          : "Set profiles on your VPS later. The characters can explore while task status stays unavailable."}
                      </p>
                    </div>
                  </div>
                  <button
                    className="secondary-button full"
                    onClick={() => openAgent("slot-1")}
                  >
                    <Settings2 size={15} /> Set up the party
                  </button>
                </>
              ) : tab === "rooms" ? (
                <>
                  <div className="welcome-copy">
                    <h3>
                      Every adventure
                      <br />
                      has its own room.
                    </h3>
                    <p>
                      Company work, personal projects, and a place to take a
                      break.
                    </p>
                  </div>
                  {floorLevels.map((level) => (
                    <div className="room-group" key={level}>
                      <button
                        className="group-title"
                        onClick={() => chooseFloor(level)}
                      >
                        <span>{FLOOR_MARKS[level]}</span>
                        <strong>{FLOOR_NAMES[level]}</strong>
                        <ChevronRight size={14} />
                      </button>
                      {ROOMS.filter((room) => room.level === level).map(
                        (room) => (
                          <button
                            className="room-card"
                            key={room.id}
                            onClick={() => onSelect(room.id)}
                          >
                            <span
                              className="room-icon"
                              style={{
                                background: `${room.color}22`,
                                color: room.color,
                              }}
                            >
                              <RoomIcon roomId={room.id} />
                            </span>
                            <div>
                              <strong>{room.name}</strong>
                              <span>{room.theme}</span>
                            </div>
                            <ChevronRight size={13} />
                          </button>
                        ),
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div className="welcome-copy">
                    <h3>Keep the good ideas.</h3>
                    <p>
                      Your notes, decisions, and reviewed work grow the guild’s
                      shelves and boards. Decorative props already furnish the
                      rooms.
                    </p>
                  </div>
                  <div className="journal-actions">
                    <button className="primary-button" onClick={openRecord}>
                      <Plus size={15} /> Add a record
                    </button>
                    <button
                      className="icon-button"
                      aria-label="Import snapshot or guild backup"
                      title="Import snapshot or backup"
                      onClick={() => importInput.current?.click()}
                    >
                      <Upload size={17} />
                    </button>
                  </div>
                  {recordCards(workspace.records)}
                </>
              )}
            </div>
            <footer className="panel-footer">
              <span>
                <LampDesk size={13} /> Saved in this browser
              </span>
              <button
                title="Export guild backup"
                aria-label="Export guild backup"
                onClick={exportGuild}
              >
                <Download size={15} />
              </button>
            </footer>
          </aside>
        </main>
      </div>
      <input
        type="file"
        hidden
        accept=".json,application/json"
        ref={importInput}
        aria-label="Snapshot or backup file"
        onChange={(event) => void importSnapshot(event.target.files?.[0])}
      />
      {notice && (
        <div className="toast" role="status">
          <span>{notice}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {modal === "agent" && (
        <Modal title="Meet your adventurer" onClose={closeModal}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setWorkspace((previous) => ({
                ...previous,
                agents: previous.agents.map((a) =>
                  a.id === editingAgent ? agentDraft : a,
                ),
                coordinator: coordinatorDraft
                  ? editingAgent
                  : previous.coordinator === editingAgent
                    ? null
                    : previous.coordinator,
              }));
              setModal(null);
              setNotice(
                "Character settings saved locally. No Hermes connection was started.",
              );
            }}
          >
            <p className="form-hint">
              These are character settings and profile mappings. Actual Hermes
              roles and task status are configured separately on your VPS.
            </p>
            <div className="archetype-options">
              {ARCHETYPES.map((archetype) => (
                <button
                  type="button"
                  className={
                    agentDraft.archetype === archetype.id ? "selected" : ""
                  }
                  key={archetype.id}
                  onClick={() =>
                    setAgentDraft({ ...agentDraft, archetype: archetype.id })
                  }
                >
                  <Portrait archetype={archetype.id} small />
                  <span>{archetype.name}</span>
                  {agentDraft.archetype === archetype.id && <Check size={12} />}
                </button>
              ))}
            </div>
            <div className="form-grid">
              <label>
                Character name
                <input
                  required
                  maxLength={40}
                  value={agentDraft.name}
                  onChange={(event) =>
                    setAgentDraft({ ...agentDraft, name: event.target.value })
                  }
                />
              </label>
              <label>
                Role label
                <input
                  maxLength={100}
                  value={agentDraft.role}
                  onChange={(event) =>
                    setAgentDraft({ ...agentDraft, role: event.target.value })
                  }
                />
              </label>
            </div>
            <label>
              Personality
              <textarea
                rows={2}
                maxLength={700}
                value={agentDraft.personality}
                onChange={(event) =>
                  setAgentDraft({
                    ...agentDraft,
                    personality: event.target.value,
                  })
                }
              />
            </label>
            <div className="form-grid">
              <label>
                Hermes profile name
                <input
                  placeholder="Assign later"
                  maxLength={100}
                  value={agentDraft.profile}
                  onChange={(event) =>
                    setAgentDraft({
                      ...agentDraft,
                      profile: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                Decorative home room
                <select
                  value={agentDraft.home}
                  onChange={(event) =>
                    setAgentDraft({ ...agentDraft, home: event.target.value })
                  }
                >
                  {ROOMS.filter((room) =>
                    ["project", "archive", "recreation", "den"].includes(
                      room.kind,
                    ),
                  ).map((room) => (
                    <option value={room.id} key={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="check-label">
              <input
                type="checkbox"
                checked={coordinatorDraft}
                onChange={(event) => setCoordinatorDraft(event.target.checked)}
              />
              <span>
                Use this character as the coordinator
                <span>
                  Moves into the basement den. One coordinator at a time.
                </span>
              </span>
            </label>
            <button className="primary-button full" type="submit">
              <Check size={16} /> Save adventurer
            </button>
          </form>
        </Modal>
      )}
      {modal === "record" && (
        <Modal title="Add to the guild’s knowledge" onClose={closeModal}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              try {
                const record = validateRecord(recordDraft, "manual");
                setWorkspace((previous) => ({
                  ...previous,
                  records: [...previous.records, record],
                }));
                setModal(null);
                setNotice(
                  "Record added. Its room now has a little more knowledge.",
                );
              } catch (error) {
                setNotice(String(error));
              }
            }}
          >
            <div className="form-grid">
              <label>
                Room
                <select
                  value={recordDraft.roomId}
                  onChange={(event) =>
                    setRecordDraft({
                      ...recordDraft,
                      roomId: event.target.value,
                    })
                  }
                >
                  {ROOMS.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Record type
                <select
                  value={recordDraft.kind}
                  onChange={(event) =>
                    setRecordDraft({
                      ...recordDraft,
                      kind: event.target.value as KnowledgeRecord["kind"],
                    })
                  }
                >
                  <option value="note">Note</option>
                  <option value="decision">Decision</option>
                  <option value="review">Reviewed work</option>
                </select>
              </label>
            </div>
            <label>
              Title
              <input
                required
                maxLength={120}
                value={recordDraft.title}
                onChange={(event) =>
                  setRecordDraft({ ...recordDraft, title: event.target.value })
                }
                placeholder="A useful idea to remember…"
              />
            </label>
            <label>
              Details
              <textarea
                rows={5}
                maxLength={10000}
                value={recordDraft.body}
                onChange={(event) =>
                  setRecordDraft({ ...recordDraft, body: event.target.value })
                }
              />
            </label>
            <label>
              Source link (optional)
              <input
                type="url"
                value={recordDraft.sourceUrl}
                placeholder="https://…"
                onChange={(event) =>
                  setRecordDraft({
                    ...recordDraft,
                    sourceUrl: event.target.value,
                  })
                }
              />
            </label>
            <p className="form-hint">
              Saved locally and labeled as added by you. This does not dispatch
              a task or verify agent activity.
            </p>
            <button className="primary-button full" type="submit">
              <BookOpen size={16} /> Save record
            </button>
          </form>
        </Modal>
      )}
      {modal === "settings" && (
        <Modal title="Make the guild yours" onClose={closeModal}>
          <label>
            Supervisor name
            <input
              maxLength={40}
              value={workspace.supervisorName}
              onChange={(event) =>
                setWorkspace({
                  ...workspace,
                  supervisorName: event.target.value,
                })
              }
            />
          </label>
          <div className="settings-row">
            <div>
              <strong>Rendering quality</strong>
              <p>Choose lighter rendering for smaller devices.</p>
            </div>
            <select
              aria-label="Rendering quality"
              value={quality}
              onChange={(event) =>
                setQuality(event.target.value as "balanced" | "low")
              }
            >
              <option value="balanced">Balanced</option>
              <option value="low">Lightweight</option>
            </select>
          </div>
          <div className="settings-row">
            <div>
              <strong>Lo-fi guild music</strong>
              <p>Original instrumental loop, generated in your browser.</p>
            </div>
            <button
              className="secondary-button"
              aria-pressed={music}
              onClick={() => void toggleAudio("music")}
            >
              {music ? "Mute music" : "Music off"}
            </button>
          </div>
          <div className="settings-row">
            <div>
              <strong>Office sounds</strong>
              <p>Occasional decorative taps and paper-like tones.</p>
            </div>
            <button
              className="secondary-button"
              aria-pressed={sounds}
              onClick={() => void toggleAudio("sounds")}
            >
              {sounds ? "Mute sounds" : "Sounds off"}
            </button>
          </div>
          <label>
            Volume
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(event) => {
                const next = Number(event.target.value);
                setVolume(next);
                audio.current?.setVolume(next);
              }}
            />
          </label>
          <div className="connection-note">
            <PlugZap size={20} />
            <div>
              <strong>Hermes gateway: not connected</strong>
              <p>
                This version makes no gateway requests. Configure the profiles
                here as labels, then add a gateway adapter on your VPS. No API
                keys belong in this browser app.
              </p>
            </div>
          </div>
          <p className="form-hint">
            You can import a JSON snapshot to display historical task status, or
            restore an exported guild backup. Imports never turn on a live
            connection.
          </p>
          <div className="form-grid">
            <button
              className="secondary-button"
              onClick={() => importInput.current?.click()}
            >
              <Upload size={15} /> Import JSON
            </button>
            <button className="secondary-button" onClick={exportGuild}>
              <Download size={15} /> Export backup
            </button>
          </div>
          {workspace.snapshot && (
            <div className="snapshot-summary">
              <strong>{workspace.snapshot.source}</strong>
              <span>
                Recorded{" "}
                {new Date(workspace.snapshot.recordedAt).toLocaleString()}
              </span>
              <button
                className="back-link"
                onClick={() => setWorkspace({ ...workspace, snapshot: null })}
              >
                Clear imported task status
              </button>
            </div>
          )}
        </Modal>
      )}
      {modal === "help" && (
        <Modal title="A quick tour of the guild" onClose={closeModal}>
          <div className="help-list">
            <section>
              <Layers3 />
              <div>
                <h3>Look around</h3>
                <p>
                  Drag to rotate, right-drag to pan, and scroll or pinch to
                  zoom. The level buttons focus a single floor; the stacked icon
                  shows the whole guild.
                </p>
              </div>
            </section>
            <section>
              <Compass />
              <div>
                <h3>Step inside</h3>
                <p>
                  Use WASD or arrow keys to walk, Q/E to turn, and drag to look.
                  On touchscreens, hold the directional controls. Walk up the
                  stairs on the right, or choose a floor to jump there.
                </p>
              </div>
            </section>
            <section>
              <Swords />
              <div>
                <h3>Meet the party</h3>
                <p>
                  Click a character to view its personality, decorative routine,
                  profile mapping, and available imported task status.
                  Appearance, name, role, and home are editable.
                </p>
              </div>
            </section>
            <section>
              <BookOpen />
              <div>
                <h3>Grow the archive</h3>
                <p>
                  Add notes, decisions, and reviewed work to rooms. Books and
                  board entries grow from those records. Export a backup to move
                  your local data to another browser or your VPS.
                </p>
              </div>
            </section>
            <section>
              <PlugZap />
              <div>
                <h3>Keep activity honest</h3>
                <p>
                  Reading, walking, chatting, and breaks are animations. Hermes
                  is not connected; task status is unavailable unless you import
                  a dated snapshot. No work runs in the background.
                </p>
              </div>
            </section>
            <section>
              <Music2 />
              <div>
                <h3>Set the mood</h3>
                <p>
                  Music and occasional office sounds start muted. Turn them on
                  separately with the bottom controls; adjust volume in
                  settings.
                </p>
              </div>
            </section>
          </div>
          <button className="primary-button full" onClick={closeModal}>
            Let’s explore <ArrowRight size={16} />
          </button>
        </Modal>
      )}
    </div>
  );
}
