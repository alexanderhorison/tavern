import { useEffect, useMemo, useRef } from "react";
import SceneLabel from "./SceneLabel";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import {
  GAP,
  roomById,
  type Agent,
  type Archetype,
  type Floor,
  type Level,
} from "../lib/workspace";
import { Block, Ball, Cylinder, Cone, mat, type V3 } from "./Objects";

export type Routine =
  | "Walking"
  | "Reading"
  | "Writing"
  | "Chatting"
  | "Taking a break"
  | "Practicing archery"
  | "Fishing"
  | "Welcoming the party";
type Stop = {
  position: V3;
  level: Level;
  routine: Routine;
  hold: number;
  facing: number;
};
const stop = (
  x: number,
  level: Level,
  z: number,
  routine: Routine = "Walking",
  hold = 0,
  facing = Math.PI,
): Stop => ({ position: [x, level * GAP, z], level, routine, hold, facing });
function routeFor(agent: Agent, coordinator: boolean): Stop[] {
  const home = roomById(coordinator ? "den" : agent.home)!;
  if (home.level === 0) {
    const homeStops: Record<string, Stop> = {
      training: stop(8, 0, -3, "Practicing archery", 10, Math.PI),
      fishing: stop(8.8, 0, -2.2, "Fishing", 12, 0),
      pool: stop(5.7, 0, 4.2, "Taking a break", 10, Math.PI / 2),
      tavern: stop(1.8, 0, -1.7, "Taking a break", 10, Math.PI),
      games: stop(-3.2, 0, 2.1, "Chatting", 10, -Math.PI / 2),
      entrance: stop(-9, 0, 3.8, "Welcoming the party", 10, 0),
      supervisor: stop(-9, 0, -2.75, "Writing", 12, Math.PI),
    };
    const first = homeStops[home.id] || homeStops.training;
    const approach =
      home.id === "training" || home.id === "fishing"
        ? [stop(5.7, 0, -2.3), stop(5.7, 0, 1.9)]
        : [stop(first.position[0], 0, 1.9)];
    return [
      first,
      ...approach,
      stop(-3.4, 0, 1.9, "Chatting", 7, Math.PI),
      stop(5.7, 0, 1.9),
      stop(5.7, 0, -2.3),
      stop(8.8, 0, -2.2, "Fishing", 12, 0),
      stop(5.7, 0, -2.3),
      stop(5.7, 0, 1.9),
      ...[...approach].reverse(),
    ];
  }
  const workX =
    home.id === "bithealth" ? 7.5 : home.id === "den" ? 5.5 : home.x;
  const workZ =
    home.id === "den"
      ? -1.8
      : home.id === "bithealth"
        ? -3.2
        : home.id === "archive"
          ? 1.4
          : -2.7;
  const stops = [
    stop(
      workX,
      home.level,
      workZ,
      agent.archetype === "mage" || agent.archetype === "healer"
        ? "Reading"
        : "Writing",
      12,
      home.id === "archive" ? 0 : Math.PI,
    ),
    stop(workX, home.level, 1.7),
    stop(5.5, home.level, 1.7, "Taking a break", 5, 0.4),
  ];
  if (home.level > 0) {
    for (let l = home.level; l > 0; l--)
      stops.push(
        stop(11.4, l as Level, 1.7),
        stop(14.9, l as Level, 1.7),
        stop(14.9, l as Level, -5.7),
        stop(13.4, l as Level, -5),
        stop(13.4, (l - 1) as Level, 5),
        stop(14.9, (l - 1) as Level, 5.7),
      );
    stops.push(
      stop(14.9, 0, 1.9),
      stop(5.7, 0, 1.9),
      stop(-3.4, 0, 1.9, "Chatting", 8, Math.PI),
    );
    for (let l = 0; l < home.level; l++)
      stops.push(
        stop(5.7, l as Level, 1.9),
        stop(14.9, l as Level, 1.9),
        stop(14.9, l as Level, 5.7),
        stop(13.4, l as Level, 5),
        stop(13.4, (l + 1) as Level, -5),
        stop(14.9, (l + 1) as Level, -5.7),
        stop(14.9, (l + 1) as Level, 1.9),
      );
  }
  stops.push(stop(workX, home.level, 1.7));
  return stops;
}
const supervisorRoute: Stop[] = [
  stop(-9, 0, -2.75, "Writing", 16),
  stop(-9, 0, 1.6),
  stop(-4.8, 0, 1.6, "Chatting", 7, Math.PI / 2),
  stop(-9, 0, 1.6),
  stop(-9, 0, 3.8, "Welcoming the party", 9, 0),
  stop(-9, 0, 1.6),
];

export function CharacterModel({
  archetype,
  animation = "Taking a break",
  moving = false,
  paused = false,
  timeOffset = 0,
}: {
  archetype: Archetype;
  animation?: Routine;
  moving?: boolean;
  paused?: boolean;
  timeOffset?: number;
}) {
  const model = useRef<THREE.Group>(null),
    leftLeg = useRef<THREE.Group>(null),
    rightLeg = useRef<THREE.Group>(null),
    leftArm = useRef<THREE.Group>(null),
    rightArm = useRef<THREE.Group>(null),
    head = useRef<THREE.Group>(null);
  const outfit = {
    warrior: "#b78858",
    mage: "#9f87ba",
    archer: "#8caa7c",
    swordsman: "#c6a478",
    healer: "#e2d5b3",
  }[archetype];
  const hair =
    archetype === "swordsman"
      ? "#d2bc92"
      : archetype === "warrior"
        ? "#7f5135"
        : archetype === "mage"
          ? "#746193"
          : "#785540";
  const animationTime = useRef(0);
  useFrame((_, delta) => {
    if (!paused) animationTime.current += Math.min(delta, 0.06);
    const t = animationTime.current + timeOffset,
      phase = t * 8;
    if (model.current)
      model.current.position.y = moving
        ? Math.abs(Math.sin(phase)) * 0.045
        : Math.sin(t * 1.6) * 0.012;
    if (leftLeg.current)
      leftLeg.current.rotation.x = moving ? Math.sin(phase) * 0.42 : 0;
    if (rightLeg.current)
      rightLeg.current.rotation.x = moving ? -Math.sin(phase) * 0.42 : 0;
    if (leftArm.current)
      leftArm.current.rotation.x = moving
        ? -Math.sin(phase) * 0.32
        : animation === "Reading"
          ? -0.7
          : -0.1;
    if (rightArm.current)
      rightArm.current.rotation.x = moving
        ? Math.sin(phase) * 0.32
        : animation === "Writing"
          ? -0.6 + Math.sin(t * 5) * 0.09
          : animation === "Practicing archery"
            ? -1.2
            : animation === "Chatting" || animation === "Welcoming the party"
              ? -0.4 + Math.sin(t * 3) * 0.15
              : -0.1;
    if (head.current) {
      head.current.rotation.x =
        animation === "Reading" || animation === "Writing"
          ? 0.17
          : Math.sin(t * 0.7) * 0.035;
      head.current.rotation.y = moving ? 0 : Math.sin(t * 0.6) * 0.055;
    }
  });
  return (
    <group ref={model}>
      {[-1, 1].map((i) => (
        <group
          key={i}
          ref={i === -1 ? leftLeg : rightLeg}
          position={[i * 0.17, 0.5, 0]}
        >
          <Block
            position={[0, -0.2, 0]}
            size={[0.23, 0.43, 0.25]}
            color={archetype === "mage" ? "#877096" : "#765f4b"}
            round
          />
          <Block
            position={[0, -0.43, 0.065]}
            size={[0.26, 0.16, 0.4]}
            color="#685447"
            round
          />
        </group>
      ))}
      <Block
        position={[0, 0.76, 0]}
        size={[0.61, 0.56, 0.38]}
        color={outfit}
        round
      />
      {(archetype === "mage" || archetype === "healer") && (
        <Cone position={[0, 0.61, 0]} size={[0.85, 0.67, 0.6]} color={outfit} />
      )}
      <Block
        position={[0, 0.52, 0]}
        size={[0.64, 0.1, 0.4]}
        color="#826244"
        round
      />
      <Block
        position={[0, 0.52, 0.215]}
        size={[0.13, 0.11, 0.04]}
        color="#dfbb74"
      />
      {[-1, 1].map((i) => (
        <group
          key={i}
          position={[i * 0.39, 0.94, 0]}
          ref={i === -1 ? leftArm : rightArm}
        >
          <Ball
            position={[0, -0.14, 0]}
            size={[0.29, 0.44, 0.32]}
            color={outfit}
          />
          <Ball
            position={[0, -0.38, 0.015]}
            size={[0.19, 0.21, 0.2]}
            color="#eac3a1"
          />
          {archetype === "warrior" && (
            <Ball
              position={[0, 0.02, 0]}
              size={[0.41, 0.24, 0.42]}
              color="#bfa078"
            />
          )}
          {i === 1 && animation === "Writing" && (
            <Block
              position={[0, -0.44, 0.16]}
              size={[0.025, 0.3, 0.025]}
              color="#f0e5cd"
              rotation={[0.4, 0, 0]}
            />
          )}
          {i === -1 && animation === "Reading" && (
            <Block
              position={[0.2, -0.44, 0.09]}
              size={[0.5, 0.32, 0.075]}
              color="#93755b"
              rotation={[0.3, 0, 0]}
            />
          )}
        </group>
      ))}
      <group ref={head} position={[0, 1.27, 0]}>
        <Ball size={[0.91, 0.88, 0.79]} color="#ebc6a6" />
        <Ball
          position={[0, 0.18, -0.075]}
          size={[0.95, 0.73, 0.75]}
          color={hair}
        />
        <Ball
          position={[0, -0.035, 0.125]}
          size={[0.8, 0.64, 0.67]}
          color="#edc9a9"
        />
        {[
          [-0.21, 0.15],
          [0.18, 0.17],
          [-0.02, 0.25],
        ].map(([x, y], i) => (
          <Ball
            key={i}
            position={[x, y, 0.29]}
            size={[0.35, 0.26, 0.3]}
            rotation={[0, 0, 0.2 - i * 0.25]}
            color={hair}
          />
        ))}
        {[-1, 1].map((i) => (
          <group key={i}>
            <Ball
              position={[i * 0.43, -0.01, 0]}
              size={[0.13, 0.2, 0.16]}
              color="#e6bc9c"
            />
            <Ball
              position={[i * 0.15, -0.06, 0.431]}
              size={[0.067, 0.091, 0.025]}
              color="#3f3933"
            />
            <Ball
              position={[i * 0.24, -0.16, 0.39]}
              size={[0.11, 0.048, 0.017]}
              color="#d99f8b"
            />
          </group>
        ))}
        <Ball
          position={[0, -0.13, 0.47]}
          size={[0.075, 0.072, 0.055]}
          color="#dfb597"
        />
        <Block
          position={[0, -0.25, 0.425]}
          size={[0.09, 0.015, 0.015]}
          color="#ae7c67"
          round
        />
        {archetype === "mage" && (
          <>
            <Cylinder
              position={[0, 0.39, 0]}
              size={[1.26, 0.085, 1.15]}
              color="#9275b2"
            />
            <Cone
              position={[-0.05, 0.8, 0]}
              size={[0.85, 0.96, 0.85]}
              color="#a18abc"
              rotation={[0, 0, 0.15]}
            />
            <Block
              position={[-0.06, 0.52, 0.38]}
              size={[0.13, 0.14, 0.025]}
              color="#e3c780"
              rotation={[0, 0, 0.7]}
            />
          </>
        )}
        {archetype === "archer" && (
          <>
            <Ball
              position={[0, 0.2, -0.13]}
              size={[1.03, 0.88, 0.83]}
              color="#7e9d70"
            />
            <Ball
              position={[0, -0.02, 0.15]}
              size={[0.82, 0.63, 0.7]}
              color="#ebc6a6"
            />
            {[-1, 1].map((i) => (
              <Ball
                key={i}
                position={[i * 0.15, -0.06, 0.497]}
                size={[0.067, 0.091, 0.025]}
                color="#3f3933"
              />
            ))}
          </>
        )}
        {archetype === "healer" && (
          <>
            <Block
              position={[0, 0.21, 0.38]}
              size={[0.9, 0.18, 0.08]}
              color="#eae2cd"
              round
            />
            <Block
              position={[0, 0.21, 0.44]}
              size={[0.06, 0.12, 0.02]}
              color="#99b7a8"
            />
            <Block
              position={[0, 0.21, 0.445]}
              size={[0.12, 0.06, 0.02]}
              color="#99b7a8"
            />
          </>
        )}
      </group>
      {(archetype === "warrior" ||
        archetype === "swordsman" ||
        archetype === "archer") && (
        <Block
          position={[0, 0.71, -0.29]}
          size={[0.66, 0.9, 0.06]}
          rotation={[-0.2, 0, 0]}
          color={
            archetype === "warrior"
              ? "#a95645"
              : archetype === "swordsman"
                ? "#d2b183"
                : "#6e8b61"
          }
          round
        />
      )}
      {(archetype === "warrior" || archetype === "swordsman") && (
        <group position={[-0.42, 0.55, -0.12]} rotation={[0, 0, -0.22]}>
          <Block size={[0.1, 0.75, 0.08]} color="#797b7a" round />
          <Block
            position={[0, 0.42, 0]}
            size={[0.3, 0.05, 0.09]}
            color="#c8a666"
          />
          <Block
            position={[0, 0.55, 0]}
            size={[0.08, 0.24, 0.08]}
            color="#775741"
          />
        </group>
      )}
      {archetype === "archer" && (
        <group position={[0.48, 0.65, -0.23]} rotation={[0, 0.35, -0.2]}>
          <mesh material={mat("#8f633e")} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.43, 0.04, 6, 16, Math.PI]} />
          </mesh>
          <Block
            position={[0, 0, 0]}
            size={[0.025, 0.85, 0.025]}
            color="#d5c49e"
          />
        </group>
      )}
      {(archetype === "mage" || archetype === "healer") && (
        <group position={[0.48, 0.6, -0.1]}>
          <Cylinder size={[0.06, 1.2, 0.06]} color="#8a6d50" />
          <Ball
            position={[0, 0.7, 0]}
            size={[0.22, 0.3, 0.22]}
            color={archetype === "mage" ? "#bda5d9" : "#a4cabc"}
          />
        </group>
      )}
    </group>
  );
}
export default function Character({
  agent,
  supervisor = false,
  coordinator = false,
  floor,
  inside,
  selected,
  paused,
  labels,
  onSelect,
  onRoutine,
}: {
  agent: Agent;
  supervisor?: boolean;
  coordinator?: boolean;
  floor: Floor;
  inside: boolean;
  selected: boolean;
  paused: boolean;
  labels: boolean;
  onSelect: (id: string) => void;
  onRoutine: (id: string, routine: Routine) => void;
}) {
  const route = useMemo(
    () => (supervisor ? supervisorRoute : routeFor(agent, coordinator)),
    [agent.home, agent.archetype, coordinator, supervisor],
  );
  const group = useRef<THREE.Group>(null);
  const progress = useRef({
    index: 0,
    hold: 0,
    moving: false,
    level: route[0].level,
    routine: route[0].routine,
  });
  // Routine state changes only at waypoint transitions, never on every frame.
  const stateKey = useRef("");
  const initial = route[0].position;
  useEffect(() => {
    progress.current = {
      index: 1,
      hold: route[0].hold,
      moving: false,
      level: route[0].level,
      routine: route[0].routine,
    };
    if (group.current) group.current.position.set(...route[0].position);
    onRoutine(agent.id, route[0].routine);
  }, [route, agent.id, onRoutine]);
  useFrame((_, rawDelta) => {
    if (!group.current) return;
    const p = progress.current,
      delta = Math.min(rawDelta, 0.06),
      target = route[p.index];
    if (!paused) {
      if (p.hold > 0) {
        p.hold -= delta;
        p.moving = false;
      } else {
        const destination = new THREE.Vector3(...target.position),
          difference = destination.sub(group.current.position),
          distance = difference.length();
        if (distance < 0.07) {
          group.current.position.set(...target.position);
          p.level = target.level;
          p.hold = target.hold;
          p.routine = target.routine;
          p.index = (p.index + 1) % route.length;
          p.moving = false;
        } else {
          group.current.position.add(
            difference
              .normalize()
              .multiplyScalar(
                Math.min(distance, delta * (supervisor ? 1.25 : 1.7)),
              ),
          );
          p.moving = true;
          p.routine = "Walking";
          const yaw = Math.atan2(difference.x, difference.z);
          group.current.rotation.y +=
            THREE.MathUtils.euclideanModulo(
              yaw - group.current.rotation.y + Math.PI,
              Math.PI * 2,
            ) *
              0.13 -
            Math.PI * 0.13;
        }
      }
      if (!p.moving) {
        const yaw = route[(p.index - 1 + route.length) % route.length].facing;
        group.current.rotation.y +=
          (THREE.MathUtils.euclideanModulo(
            yaw - group.current.rotation.y + Math.PI,
            Math.PI * 2,
          ) -
            Math.PI) *
          0.06;
      }
    }
    const actualFloor = Math.round(group.current.position.y / GAP);
    group.current.visible =
      inside ||
      floor === "all" ||
      (actualFloor === floor &&
        Math.abs(group.current.position.y - floor * GAP) < 0.4);
    const key = `${p.routine}:${p.moving}:${paused}`;
    if (stateKey.current !== key) {
      stateKey.current = key;
      onRoutine(agent.id, p.routine);
    }
  });
  // Parent receives routine changes and re-renders this model when an activity changes.
  return (
    <group
      ref={group}
      position={initial}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onSelect(agent.id);
      }}
    >
      <CharacterModel
        archetype={agent.archetype}
        animation={progress.current.routine}
        moving={progress.current.moving && !paused}
        paused={paused}
        timeOffset={agent.id.length * 0.9}
      />
      {selected && (
        <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.57, 0.66, 32]} />
          <meshBasicMaterial color="#e6c477" transparent opacity={0.9} />
        </mesh>
      )}
      {!inside && labels && (
        <SceneLabel
          position={[0, 2.9, 0]}
          text={`◆ ${agent.name}`}
          className={`character-label ${selected ? "chosen" : ""}`}
          onSelect={() => onSelect(agent.id)}
        />
      )}
    </group>
  );
}
