import SceneLabel from "./SceneLabel";
import type { ThreeEvent } from "@react-three/fiber";
import {
  GAP,
  ROOMS,
  FLOOR_MARKS,
  FLOOR_NAMES,
  type Floor,
  type Level,
  type KnowledgeRecord,
  type Room,
} from "../lib/workspace";
import {
  Block,
  Ball,
  Cylinder,
  Cone,
  Plant,
  Lantern,
  Table,
  Chair,
  Stool,
  Bookshelf,
  Barrel,
  Crate,
  Banner,
  Sign,
  Noticeboard,
  Water,
  Scroll,
  Mug,
  WOOD,
  LIGHT_WOOD,
  DARK_WOOD,
  CREAM,
  STONE,
  type V3,
} from "./Objects";

export interface BuildingProps {
  floor: Floor;
  inside: boolean;
  selected: string | null;
  onSelect: (id: string) => void;
  records: KnowledgeRecord[];
  labels: boolean;
}
function Frame({
  x,
  width,
  depth,
  front = false,
}: {
  x: number;
  width: number;
  depth: number;
  front?: boolean;
}) {
  return (
    <group position={[x, 0, 0]}>
      {[-1, 1].map((i) => (
        <group key={i} position={[(i * width) / 2, 0, 0]}>
          <Block
            position={[0, 0.88, -3.3]}
            size={[0.2, 1.7, depth]}
            color={CREAM}
          />
          <Block
            position={[0, 1.82, -3.3]}
            size={[0.25, 0.18, depth]}
            color={WOOD}
            round
          />
          {[-0.2, -6.3].map((z) => (
            <group key={z}>
              <Block
                position={[0, 0.24, z]}
                size={[0.43, 0.48, 0.43]}
                color={STONE}
                round
              />
              <Block
                position={[0, 1.5, z]}
                size={[0.26, 2.6, 0.26]}
                color={WOOD}
                round
              />
            </group>
          ))}
        </group>
      ))}
      {front && (
        <>
          {[-1, 1].map((i) => (
            <group key={i}>
              <Block
                position={[i * (width / 4 + 0.45), 0.75, -0.15]}
                size={[width / 2 - 1, 1.45, 0.2]}
                color={CREAM}
              />
              <Block
                position={[i, 1.35, -0.15]}
                size={[0.24, 2.7, 0.28]}
                color={WOOD}
                round
              />
            </group>
          ))}
          <Block
            position={[0, 2.65, -0.15]}
            size={[2.23, 0.26, 0.3]}
            color={WOOD}
            round
          />
          <Lantern position={[1.5, 1.9, 0.03]} />
        </>
      )}
    </group>
  );
}
function ProjectRoom({ room, count }: { room: Room; count: number }) {
  return (
    <group position={[room.x, 0, 0]}>
      <Block
        position={[0, 0.06, -3.4]}
        size={[5.1, 0.035, 5.3]}
        color={room.color}
        round
      />
      <Block
        position={[0, 0.085, -3.4]}
        size={[4.65, 0.017, 4.88]}
        color="#d8c3a2"
      />
      <Block
        position={[0, 0.099, -3.4]}
        size={[4.42, 0.015, 4.63]}
        color={room.color}
      />
      <Banner
        position={[0, 1.86, -6.22]}
        color={room.color}
        symbol={
          room.id === "kaffee"
            ? "☕"
            : room.id === "engage"
              ? "♫"
              : room.id === "power"
                ? "◈"
                : "⚔"
        }
      />
      <Table position={[0, 0, -4.2]} map={room.id === "tba"} />
      <Chair
        position={[-0.7, 0, -5.35]}
        rotation={Math.PI}
        color={room.color}
      />
      <Bookshelf position={[-2.15, 0, -5.45]} width={1.15} extra={count} />
      <Plant position={[2.13, 0, -5.4]} scale={1.25} />
      <Lantern position={[-1.65, 1.88, -6.2]} />
      <Lantern position={[1.65, 1.88, -6.2]} />
      {room.id === "power" && (
        <>
          <Crate position={[1.8, 0, -2]} />
          <Crate position={[2.1, 0, -3.1]} size={0.65} />
          <Cylinder
            position={[-0.3, 1.47, -4.2]}
            size={[0.065, 0.9, 0.065]}
            color="#c8a66b"
          />
          <Block
            position={[-0.3, 1.7, -4.2]}
            size={[1.1, 0.05, 0.05]}
            color="#c8a66b"
          />
        </>
      )}
      {room.id === "tba" && (
        <>
          <Crate position={[1.8, 0, -2.9]} />
          <Crate position={[2, 0.9, -3]} size={0.65} />
          <Noticeboard
            position={[-2.1, 1.8, -2.1]}
            rotation={Math.PI / 2}
            count={count}
          />
        </>
      )}
      {room.id === "kaffee" && (
        <>
          <Ball
            position={[0.5, 1.24, -4.15]}
            size={[0.44, 0.46, 0.44]}
            color="#b2aba0"
          />
          <Cylinder
            position={[0.5, 1.5, -4.15]}
            size={[0.28, 0.065, 0.28]}
            color="#9c947f"
          />
          <Mug position={[-0.6, 1.04, -4.1]} />
          <Barrel position={[2.1, 0, -2]} scale={0.85} />
        </>
      )}
      {room.id === "engage" && (
        <>
          <Block
            position={[1.7, 0.7, -2.4]}
            size={[0.07, 1.4, 0.07]}
            color={WOOD}
            rotation={[0, 0, -0.2]}
          />
          <Block
            position={[2.1, 0.7, -2.4]}
            size={[0.07, 1.4, 0.07]}
            color={WOOD}
            rotation={[0, 0, 0.2]}
          />
          <Block
            position={[1.9, 1.3, -2.4]}
            size={[1.1, 1.2, 0.08]}
            color="#ead7aa"
            round
          />
          <Ball
            position={[-1.8, 0.65, -2]}
            size={[0.6, 0.8, 0.2]}
            color={WOOD}
          />
          <Block
            position={[-1.8, 1.38, -2]}
            size={[0.12, 1.15, 0.08]}
            color={DARK_WOOD}
          />
        </>
      )}
      <Sign
        position={[0, 3.04, -5.97]}
        text={room.name}
        width={4.5}
        height={0.94}
      />
    </group>
  );
}
function FloorBase({ level, selected }: { level: Level; selected: boolean }) {
  const w = level === -1 ? 18.5 : 24.5,
    d = level === -1 ? 11.2 : 14;
  return (
    <>
      <Block
        position={[0, -0.3, 0]}
        size={[w, 0.55, d]}
        color={level === -1 ? "#7b7587" : "#b39671"}
        round
      />
      {Array.from({ length: level === -1 ? 11 : 14 }, (_, i) => (
        <Block
          key={i}
          position={[0, 0, -d / 2 + 0.5 + i]}
          size={[w - 0.24, 0.1, 0.97]}
          color={
            level === -1
              ? i % 2
                ? "#8e8597"
                : "#99909f"
              : i % 3 === 0
                ? "#d4ba91"
                : "#ddc59f"
          }
        />
      ))}
      <Block
        position={[0, -0.12, d / 2]}
        size={[w + 0.05, 0.3, 0.2]}
        color={selected ? "#d4b278" : LIGHT_WOOD}
        round
      />
      <Block
        position={[0, 1.29, -d / 2 + 0.3]}
        size={[w - 0.3, 2.5, 0.2]}
        color={level === -1 ? "#5e586d" : CREAM}
      />
      <Block
        position={[0, 2.61, -d / 2 + 0.25]}
        size={[w, 0.22, 0.29]}
        color={level === -1 ? "#695676" : WOOD}
        round
      />
      {[-1, 1].map((i) => (
        <group key={i}>
          <Block
            position={[i * (w / 2 - 0.24), 1.3, -d / 2 + 0.4]}
            size={[0.27, 2.75, 0.3]}
            color={WOOD}
            round
          />
          <Plant position={[i * (w / 2 - 0.7), 0.1, d / 2 - 0.6]} scale={1.5} />
        </group>
      ))}
      <Sign
        position={[-w / 2 + 3.4, -0.17, d / 2 + 0.12]}
        text={`${FLOOR_MARKS[level]} · ${FLOOR_NAMES[level]}`}
        width={5.8}
        height={0.62}
      />
    </>
  );
}
function Bithealth({ count }: { count: number }) {
  return (
    <>
      <Block
        position={[0, 0.065, 0]}
        size={[8.5, 0.04, 3.4]}
        color="#a1bbc6"
        round
      />
      <Block position={[0, 0.09, 0]} size={[7.9, 0.02, 2.95]} color="#c9d4d0" />
      <Table position={[0, 0, 0]} width={7} depth={2} map />
      {[-2.4, 0, 2.4].flatMap((x) =>
        [-1, 1].map((z) => (
          <Stool key={`${x}${z}`} position={[x, 0, z * 1.7]} />
        )),
      )}
      {[-7.5, 0, 7.5].map((x) => (
        <group key={x}>
          <Banner position={[x, 1.6, -6.55]} color="#91b5c3" symbol="❧" />
          <Table position={[x, 0, -4.6]} width={3.2} />
          <Chair
            position={[x - 0.55, 0, -5.6]}
            rotation={Math.PI}
            color="#92b3bd"
          />
          <Lantern position={[x + 1.8, 1.9, -6.55]} />
          <Plant position={[x + 2, 0, -4.9]} />
        </group>
      ))}
      <Bookshelf
        position={[-11.1, 0, -4.4]}
        rotation={Math.PI / 2}
        width={3.7}
        extra={count}
      />
      <Bookshelf position={[4, 0, -6.2]} width={2.4} extra={count} />
      <Noticeboard position={[-4, 1.6, -6.2]} count={count} />
      <Sign
        position={[0, 3, -6.3]}
        text="Bithealth · Company workspace"
        width={6}
      />
      <Sign
        position={[-10.5, 2.7, -4.4]}
        rotation={Math.PI / 2}
        text="Company records"
        width={2.9}
        height={0.6}
      />
      <Plant position={[10.6, 0, 2.5]} scale={1.5} />
    </>
  );
}
function Ground() {
  return (
    <>
      <Frame x={-8.9} width={6} depth={6.2} front />
      <Block
        position={[-8.9, 0.065, -3.4]}
        size={[5.1, 0.03, 5.5]}
        color="#c5aa88"
      />
      <Table position={[-9, 0, -4.2]} width={3.1} depth={1.6} map />
      <Chair position={[-9, 0, -5.45]} rotation={Math.PI} color="#cda66f" />
      <Banner position={[-9, 1.6, -6.3]} color="#b19377" symbol="⚔" />
      <Bookshelf position={[-11.25, 0, -5.4]} width={1.1} />
      <Plant position={[-6.7, 0, -5.6]} scale={1.25} />
      <Sign position={[-8.9, 3, -6.2]} text="Captain’s chamber" width={4.3} />
      <Noticeboard position={[-3.8, 1.62, -4.9]} />
      <Plant position={[-4.7, 0, -3.9]} />
      <Block
        position={[1.2, 0.57, -3.7]}
        size={[7, 1.1, 1.2]}
        color={WOOD}
        round
      />
      <Block
        position={[1.2, 1.17, -3.7]}
        size={[7.35, 0.17, 1.45]}
        color={LIGHT_WOOD}
        round
      />
      <Bookshelf position={[1.2, 0.1, -6.3]} width={5.6} />
      <Barrel position={[-2.8, 0, -5.3]} />
      <Barrel position={[5.1, 0, -5.4]} />
      {[0, 1.8, 3.6].map((x) => (
        <group key={x}>
          <Stool position={[x, 0, -2.25]} />
          <Mug position={[x, 1.26, -3.5]} />
        </group>
      ))}
      <Sign position={[1.2, 3, -6.2]} text="The Copper Kettle" width={4.8} />
      {[-3, 5.3].map((x) => (
        <Lantern key={x} position={[x, 2.1, -6.2]} />
      ))}
      <group position={[0, 0, 3.4]}>
        <Table position={[0, 0, 0]} width={4.2} depth={2.2} />
        <Block
          position={[0, 1.04, 0]}
          size={[3.95, 0.12, 1.96]}
          color="#648b72"
          round
        />
        {[-1, 1].flatMap((x) =>
          [-1, 1].map((z) => (
            <Cylinder
              key={`${x}${z}`}
              position={[x * 1.75, 1.112, z * 0.8]}
              size={[0.19, 0.02, 0.19]}
              color={DARK_WOOD}
            />
          )),
        )}
        {[
          [-0.5, 0.2, "#e5bd65"],
          [-0.28, 0.05, "#c4817b"],
          [-0.08, 0.24, "#8187aa"],
          [1, -0.45, "#f5f0d9"],
        ].map(([x, z, color], i) => (
          <Ball
            key={i}
            position={[Number(x), 1.17, Number(z)]}
            size={[0.12, 0.12, 0.12]}
            color={String(color)}
          />
        ))}
        <Block
          position={[0.3, 1.16, 0.5]}
          size={[3, 0.025, 0.025]}
          color="#e3c8a0"
          rotation={[0, -0.4, 0]}
        />
      </group>
      <Table position={[-4.3, 0, 3.8]} width={2.2} depth={2.2} />
      <Block
        position={[-4.3, 1.05, 3.8]}
        size={[1.1, 0.02, 1.1]}
        color="#ddceb2"
      />
      {Array.from({ length: 16 }, (_, i) =>
        i % 2 === Math.floor(i / 4) % 2 ? (
          <Block
            key={i}
            position={[
              -4.7 + (i % 4) * 0.27,
              1.07,
              3.4 + Math.floor(i / 4) * 0.27,
            ]}
            size={[0.26, 0.015, 0.26]}
            color="#83644b"
          />
        ) : null,
      )}
      {[-1, 1].map((i) => (
        <Stool key={i} position={[-4.3 + i * 1.55, 0, 3.8]} />
      ))}
      <Water position={[8.8, 0, -0.1]} width={4.2} depth={3.1} pond />
      <Water position={[8.7, 0, 4.1]} width={4.4} depth={3.1} />
      <Plant position={[6.5, 0, 0]} scale={1.2} />
      <Plant position={[11.2, 0, 0]} scale={1.2} />
      <group position={[8, 0, -5.4]}>
        <Block
          position={[-0.25, 0.55, 0]}
          size={[0.09, 1.2, 0.09]}
          rotation={[0, 0, -0.2]}
        />
        <Block
          position={[0.25, 0.55, 0]}
          size={[0.09, 1.2, 0.09]}
          rotation={[0, 0, 0.2]}
        />
        {[1.1, 0.82, 0.54, 0.25].map((s, i) => (
          <Cylinder
            key={s}
            position={[0, 1.35, 0.015 * i]}
            size={[s, 0.04, s]}
            rotation={[Math.PI / 2, 0, 0]}
            color={i % 2 ? "#c98779" : "#f1dec2"}
          />
        ))}
      </group>
      <group position={[10.2, 0, -4.8]}>
        <Cylinder position={[0, 0.45, 0]} size={[0.15, 0.9, 0.15]} />
        <Cylinder
          position={[0, 1.1, 0]}
          size={[0.65, 0.8, 0.65]}
          color="#b29264"
        />
        <Ball
          position={[0, 1.65, 0]}
          size={[0.38, 0.42, 0.38]}
          color="#bb9d75"
        />
        <Block position={[0, 1.3, 0]} size={[1.3, 0.12, 0.12]} color={WOOD} />
        <Block position={[0, 0.15, 0]} size={[0.85, 0.12, 0.65]} />
      </group>
      <group position={[-9, 0, 5.4]}>
        <Block position={[0, 0.07, 0]} size={[4, 0.05, 2.6]} color="#bb7e6c" />
        <Block
          position={[0, 0.09, 0]}
          size={[3.7, 0.015, 2.3]}
          color="#d2a080"
        />
        {[-1, 1].map((i) => (
          <group key={i}>
            <Block
              position={[i * 2.1, 1.4, 0]}
              size={[0.4, 2.8, 0.45]}
              color={STONE}
              round
            />
            <Lantern position={[i * 2.1, 2, 0.28]} />
          </group>
        ))}
        <Block
          position={[0, 2.84, 0]}
          size={[4.6, 0.26, 0.4]}
          color={WOOD}
          round
        />
        <Sign
          position={[0, 2.85, 0.23]}
          text="Welcome to the guild"
          width={3.4}
          height={0.5}
        />
      </group>
    </>
  );
}
function Den({ selected, count }: { selected: boolean; count: number }) {
  return (
    <>
      <Block
        position={[-2, 0.07, 0]}
        size={[7, 0.05, 4]}
        color="#8c7c9e"
        round
      />
      <Table position={[-2, 0, 0]} width={5} depth={2.4} map />
      {[-3.5, 0].flatMap((x) =>
        [-1, 1].map((z) => (
          <Stool key={`${x}${z}`} position={[x, 0, z * 1.8]} />
        )),
      )}
      <Table position={[5.5, 0, -3]} map />
      <Chair position={[5.5, 0, -4.2]} rotation={Math.PI} color="#9b8aac" />
      <Bookshelf position={[-7.5, 0, -4]} width={2.4} extra={count} />
      <Bookshelf position={[0, 0, -5.1]} width={4} extra={count} />
      <Banner position={[5.5, 1.8, -5.3]} color="#847296" symbol="✧" />
      <Barrel position={[-7.5, 0, 3.5]} />
      <Plant position={[7.5, 0, 3.8]} />
      <Lantern position={[4, 2, -5.3]} />
      <Lantern position={[-4, 2, -5.3]} />
      <pointLight
        position={[5, 2.6, -2.7]}
        intensity={selected ? 22 : 3.5}
        distance={12}
        color="#ffd398"
        decay={2}
      />
      <pointLight
        position={[-4, 2.5, 0]}
        intensity={selected ? 12 : 1.5}
        distance={10}
        color="#dbbae5"
        decay={2}
      />
      <Noticeboard position={[-5, 1.6, -5.1]} count={count} />
    </>
  );
}
export function Stairs() {
  return (
    <group>
      {([-1, 0, 1] as Level[]).map((level) => (
        <group key={level} position={[13.4, level * GAP, 0]}>
          {Array.from({ length: 24 }, (_, i) => (
            <Block
              key={i}
              position={[0, ((i + 0.5) * GAP) / 24, 5 - ((i + 0.5) * 10) / 24]}
              size={[1.6, 0.25, 10 / 24 + 0.03]}
              color={i % 2 ? LIGHT_WOOD : "#b68b63"}
              round
            />
          ))}
          <Block
            position={[0, GAP - 0.1, -5.7]}
            size={[2.4, 0.2, 1.4]}
            color={LIGHT_WOOD}
          />
          <Block
            position={[0, -0.1, 5.7]}
            size={[2.4, 0.2, 1.4]}
            color={LIGHT_WOOD}
          />
          <Block
            position={[1.4, GAP - 0.1, 0]}
            size={[1.1, 0.2, 11.9]}
            color={LIGHT_WOOD}
          />
          {Array.from({ length: 6 }, (_, i) => (
            <Block
              key={i}
              position={[0.95, (i * GAP) / 5 + 0.5, 5 - i * 2]}
              size={[0.09, 1.05, 0.09]}
              color={WOOD}
            />
          ))}
          <Block
            position={[0.95, GAP / 2 + 0.9, 0]}
            size={[0.1, 0.12, Math.hypot(10, GAP)]}
            color={WOOD}
            rotation={[Math.atan(GAP / 10), 0, 0]}
            round
          />
          <Block
            position={[-1.25, 0.5, 5.8]}
            size={[3.3, 0.16, 0.08]}
            color={WOOD}
          />
        </group>
      ))}
      <Block
        position={[10.6, -GAP - 0.05, 5]}
        size={[3.1, 0.25, 1.1]}
        color={LIGHT_WOOD}
      />
    </group>
  );
}
export default function Building({
  floor,
  inside,
  selected,
  onSelect,
  records,
  labels,
}: BuildingProps) {
  const click = (event: ThreeEvent<MouseEvent>, id: string) => {
    event.stopPropagation();
    onSelect(id);
  };
  return (
    <group>
      {([-1, 0, 1, 2] as Level[]).map((level) => (
        <group
          key={level}
          position={[0, level * GAP, 0]}
          visible={inside || floor === "all" || floor === level}
        >
          <FloorBase
            level={level}
            selected={ROOMS.some(
              (room) => room.level === level && room.id === selected,
            )}
          />
          {level === 2 && (
            <>
              {ROOMS.filter(
                (room) => room.level === 2 && room.kind === "project",
              ).map((room) => (
                <group key={room.id}>
                  <Frame x={room.x} width={6} depth={6.2} front />
                  <ProjectRoom
                    room={room}
                    count={records.filter((r) => r.roomId === room.id).length}
                  />
                </group>
              ))}
              <Bookshelf
                position={[-9, 0, 4.7]}
                width={5}
                extra={records.filter((r) => r.roomId === "archive").length}
              />
              <Table position={[-9, 0, 2.6]} width={2.3} />
              <Chair
                position={[-9, 0, 1.5]}
                rotation={Math.PI}
                color="#c3ae87"
              />
              <Sign
                position={[-9, 2.9, 4.8]}
                text="Personal archive"
                width={4}
              />
              <Table position={[0, 0, 3.8]} width={2.7} depth={1.7} map />
              <Plant position={[10.8, 0, 4.8]} scale={1.4} />
              <Noticeboard
                position={[6, 1.5, 4.8]}
                count={records.filter((r) => roomLevel(r.roomId) === 2).length}
              />
            </>
          )}
          {level === 1 && (
            <Bithealth
              count={records.filter((r) => r.roomId === "bithealth").length}
            />
          )}
          {level === 0 && <Ground />}
          {level === -1 && (
            <Den
              selected={selected === "den" || floor === -1}
              count={records.filter((r) => r.roomId === "den").length}
            />
          )}
          {ROOMS.filter((room) => room.level === level).map((room) => (
            <group key={room.id} onClick={(event) => click(event, room.id)}>
              <mesh
                position={[room.x, 0.12, room.z]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[room.width, room.depth]} />
                <meshBasicMaterial
                  color={room.color}
                  transparent
                  opacity={selected === room.id ? 0.2 : 0}
                  depthWrite={false}
                />
              </mesh>
              {!inside &&
                labels &&
                (floor === "all" || floor === level) &&
                (floor !== "all" || room.kind === "project") && (
                  <SceneLabel
                    position={[room.x, 2.8, room.z + room.depth / 2 - 0.1]}
                    text={room.kind === "project" ? room.theme : room.name}
                    className={`room-label ${selected === room.id ? "chosen" : ""}`}
                    onSelect={() => onSelect(room.id)}
                  />
                )}
            </group>
          ))}
        </group>
      ))}
      <group visible={inside || floor === "all"}>
        <Stairs />
      </group>
    </group>
  );
}
function roomLevel(id: string) {
  return ROOMS.find((room) => room.id === id)?.level;
}
