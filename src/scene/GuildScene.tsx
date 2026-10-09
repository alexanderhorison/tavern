import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";
import Building from "./Building";
import Character, { type Routine } from "./Characters";
import { Block } from "./Objects";
import {
  GAP,
  type Agent,
  type Floor,
  type Level,
  type Workspace,
} from "../lib/workspace";
import { insideSpawn, moveWithCollision, stairHeight } from "../lib/navigation";

export type Direction =
  | "forward"
  | "back"
  | "left"
  | "right"
  | "turnLeft"
  | "turnRight";
export type CameraCommand = {
  type: "in" | "out" | "left" | "right" | "reset";
  nonce: number;
};
export interface SceneProps {
  floor: Floor;
  setFloor: (floor: Floor) => void;
  mode: "guild" | "inside";
  workspace: Workspace;
  selection: string | null;
  onSelect: (id: string) => void;
  paused: boolean;
  labels: boolean;
  onRoutine: (id: string, routine: Routine) => void;
  held: Set<Direction>;
  command: CameraCommand | null;
  quality: "balanced" | "low";
  inputEnabled: boolean;
}
function ExteriorCamera({
  floor,
  command,
}: Pick<SceneProps, "floor" | "command">) {
  const { camera, size } = useThree();
  const controls = useRef<{ target: THREE.Vector3; update: () => void } | null>(
    null,
  );
  const transition = useRef<{
    target: THREE.Vector3;
    position: THREE.Vector3;
    zoom: number;
  } | null>(null);
  const makeDestination = () => {
    const y = floor === "all" ? 5.9 : floor * GAP + 0.9;
    return {
      target: new THREE.Vector3(1.3, y, 0),
      position: new THREE.Vector3(
        floor === "all" ? 18 : 27,
        y + (floor === "all" ? 13.5 : 24),
        44,
      ),
      zoom: Math.min(
        size.width / (floor === "all" ? 35 : 36),
        size.height / (floor === "all" ? 38 : 24),
      ),
    };
  };
  useEffect(() => {
    transition.current = makeDestination();
  }, [floor, size.width, size.height, camera]);
  useEffect(() => {
    if (!command || !(camera instanceof THREE.OrthographicCamera)) return;
    if (command.type === "reset") {
      transition.current = makeDestination();
      return;
    }
    transition.current = null;
    if (command.type === "in" || command.type === "out") {
      camera.zoom = THREE.MathUtils.clamp(
        camera.zoom * (command.type === "in" ? 1.2 : 1 / 1.2),
        7,
        100,
      );
      camera.updateProjectionMatrix();
    }
    if (
      (command.type === "left" || command.type === "right") &&
      controls.current
    ) {
      const offset = camera.position.clone().sub(controls.current.target);
      offset.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        command.type === "left" ? -Math.PI / 8 : Math.PI / 8,
      );
      camera.position.copy(controls.current.target).add(offset);
      controls.current.update();
    }
  }, [command, camera]);
  useFrame((_, delta) => {
    if (
      !transition.current ||
      !controls.current ||
      !(camera instanceof THREE.OrthographicCamera)
    )
      return;
    const alpha = 1 - Math.exp(-delta * 6),
      destination = transition.current;
    camera.position.lerp(destination.position, alpha);
    controls.current.target.lerp(destination.target, alpha);
    camera.zoom = THREE.MathUtils.lerp(camera.zoom, destination.zoom, alpha);
    camera.updateProjectionMatrix();
    controls.current.update();
    if (camera.position.distanceTo(destination.position) < 0.015)
      transition.current = null;
  });
  return (
    <OrbitControls
      ref={(ref) => {
        controls.current = ref;
      }}
      makeDefault
      enableDamping
      dampingFactor={0.07}
      minPolarAngle={0.25}
      maxPolarAngle={Math.PI / 2.05}
      minZoom={7}
      maxZoom={100}
      onStart={() => {
        transition.current = null;
      }}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
    />
  );
}
function InsideCamera({
  floor,
  setFloor,
  held,
  inputEnabled,
  command,
}: Pick<
  SceneProps,
  "floor" | "setFloor" | "held" | "inputEnabled" | "command"
>) {
  const { camera, gl } = useThree();
  const keys = useRef(new Set<string>()),
    heading = useRef({ yaw: 0, pitch: -0.08 });
  const position = useRef(insideSpawn(floor === "all" ? 0 : floor));
  const level = useRef<Level>(floor === "all" ? 0 : floor),
    ramp = useRef<Level | null>(null),
    physicalFloorChange = useRef(false);
  useEffect(() => {
    if (physicalFloorChange.current) {
      physicalFloorChange.current = false;
      return;
    }
    level.current = floor === "all" ? 0 : floor;
    position.current = insideSpawn(level.current);
    ramp.current = null;
    heading.current = { yaw: 0, pitch: -0.08 };
  }, [floor]);
  useEffect(() => {
    if (command?.type === "reset") {
      position.current = insideSpawn(level.current);
      heading.current = { yaw: 0, pitch: -0.08 };
      ramp.current = null;
    }
  }, [command]);
  useEffect(() => {
    keys.current.clear();
    const down = (event: KeyboardEvent) => {
      if (
        !inputEnabled ||
        (event.target as HTMLElement)?.closest(
          "input, textarea, select, [contenteditable]",
        )
      )
        return;
      if (
        [
          "w",
          "a",
          "s",
          "d",
          "q",
          "e",
          "arrowup",
          "arrowdown",
          "arrowleft",
          "arrowright",
        ].includes(event.key.toLowerCase())
      ) {
        event.preventDefault();
        keys.current.add(event.key.toLowerCase());
      }
    };
    const up = (event: KeyboardEvent) => {
      keys.current.delete(event.key.toLowerCase());
    };
    const blur = () => keys.current.clear();
    let dragging = false;
    const pointerDown = (event: PointerEvent) => {
      if (inputEnabled && event.button === 0) {
        dragging = true;
        gl.domElement.setPointerCapture(event.pointerId);
      }
    };
    const pointerMove = (event: PointerEvent) => {
      if (dragging) {
        heading.current.yaw -= event.movementX * 0.004;
        heading.current.pitch = THREE.MathUtils.clamp(
          heading.current.pitch - event.movementY * 0.003,
          -0.6,
          0.6,
        );
      }
    };
    const pointerUp = () => {
      dragging = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    gl.domElement.addEventListener("pointerdown", pointerDown);
    gl.domElement.addEventListener("pointermove", pointerMove);
    gl.domElement.addEventListener("pointerup", pointerUp);
    gl.domElement.addEventListener("pointercancel", pointerUp);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      gl.domElement.removeEventListener("pointerdown", pointerDown);
      gl.domElement.removeEventListener("pointermove", pointerMove);
      gl.domElement.removeEventListener("pointerup", pointerUp);
      gl.domElement.removeEventListener("pointercancel", pointerUp);
    };
  }, [gl, inputEnabled]);
  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.06),
      k = keys.current,
      h = inputEnabled ? held : new Set<Direction>(),
      yaw = heading.current.yaw;
    const forward =
      Number(k.has("w") || k.has("arrowup") || h.has("forward")) -
      Number(k.has("s") || k.has("arrowdown") || h.has("back"));
    const side =
      Number(k.has("d") || k.has("arrowright") || h.has("right")) -
      Number(k.has("a") || k.has("arrowleft") || h.has("left"));
    const turn =
      Number(k.has("q") || h.has("turnLeft")) -
      Number(k.has("e") || h.has("turnRight"));
    heading.current.yaw += turn * delta * 1.5;
    const normalization = forward && side ? 0.707 : 1;
    const dx =
      (-Math.sin(yaw) * forward + Math.cos(yaw) * side) *
      delta *
      3.7 *
      normalization;
    const dz =
      (-Math.cos(yaw) * forward - Math.sin(yaw) * side) *
      delta *
      3.7 *
      normalization;
    if (ramp.current !== null) {
      position.current.x = THREE.MathUtils.clamp(
        position.current.x + dx,
        12.75,
        14.05,
      );
      position.current.z = THREE.MathUtils.clamp(
        position.current.z + dz,
        -5.05,
        5.05,
      );
      if (
        (position.current.z < -5 && dz < 0) ||
        (position.current.z > 5 && dz > 0)
      ) {
        const next = (
          position.current.z < 0 ? ramp.current + 1 : ramp.current
        ) as Level;
        level.current = next;
        ramp.current = null;
        physicalFloorChange.current = true;
        setFloor(next);
      }
    } else if (inputEnabled) {
      position.current = moveWithCollision(
        position.current,
        dx,
        dz,
        level.current,
      );
      if (position.current.x > 12.65 && position.current.x < 14.1) {
        if (position.current.z > 4.65 && dz < 0 && level.current < 2)
          ramp.current = level.current;
        else if (position.current.z < -4.65 && dz > 0 && level.current > -1)
          ramp.current = (level.current - 1) as Level;
      }
    }
    const y =
      ramp.current === null
        ? level.current * GAP
        : stairHeight(position.current.z, ramp.current);
    camera.position.set(position.current.x, y + 1.72, position.current.z);
    camera.rotation.set(heading.current.pitch, heading.current.yaw, 0, "YXZ");
  });
  return null;
}
function SceneContents(props: SceneProps) {
  const supervisor: Agent = useMemo(
    () => ({
      id: "supervisor",
      name: props.workspace.supervisorName,
      archetype: "swordsman",
      role: "Guild supervisor",
      personality: "Keeps the whole guild in view.",
      profile: "",
      home: "supervisor",
    }),
    [props.workspace.supervisorName],
  );
  return (
    <>
      <color attach="background" args={["#f3efe6"]} />
      <ambientLight intensity={0.4} color="#fff4dc" />
      <hemisphereLight args={["#fcf4e6", "#bcac94", 0.9]} />
      <directionalLight
        position={[-12, 27, 18]}
        intensity={3.1}
        color="#fff0d2"
        castShadow={props.quality === "balanced"}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-camera-near={1}
        shadow-camera-far={75}
        shadow-bias={-0.0002}
        shadow-normalBias={0.05}
      />
      <directionalLight
        position={[15, 12, -10]}
        intensity={1}
        color="#e2e4f2"
      />
      {props.mode === "guild" ? (
        <>
          <OrthographicCamera
            makeDefault
            position={[30, 25, 34]}
            zoom={20}
            near={0.1}
            far={150}
          />
          <ExteriorCamera floor={props.floor} command={props.command} />
        </>
      ) : (
        <>
          <PerspectiveCamera makeDefault fov={62} near={0.08} far={100} />
          <InsideCamera {...props} />
        </>
      )}
      <Building
        {...props}
        inside={props.mode === "inside"}
        selected={props.selection}
        records={props.workspace.records}
      />
      {props.workspace.agents.map((agent) => (
        <Character
          key={agent.id}
          agent={agent}
          coordinator={props.workspace.coordinator === agent.id}
          inside={props.mode === "inside"}
          floor={props.floor}
          selected={props.selection === agent.id}
          paused={props.paused}
          labels={props.labels}
          onSelect={props.onSelect}
          onRoutine={props.onRoutine}
        />
      ))}
      <Character
        agent={supervisor}
        supervisor
        inside={props.mode === "inside"}
        floor={props.floor}
        selected={props.selection === "supervisor"}
        paused={props.paused}
        labels={props.labels}
        onSelect={props.onSelect}
        onRoutine={props.onRoutine}
      />
      <Block
        position={[0, -GAP - 0.65, 0]}
        size={[100, 0.15, 100]}
        color="#e4dfd4"
        shadow={false}
      />
      {props.quality === "balanced" && props.mode === "guild" && (
        <ContactShadows
          position={[0, -GAP - 0.53, 0]}
          opacity={0.28}
          scale={60}
          blur={2.5}
          far={28}
          resolution={512}
          frames={1}
          color="#675843"
        />
      )}
    </>
  );
}
export default function GuildScene(props: SceneProps) {
  return (
    <Canvas
      shadows={props.quality === "balanced"}
      dpr={props.quality === "low" ? 1 : [1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
      }}
      onPointerMissed={() => props.onSelect("")}
    >
      <Suspense fallback={null}>
        <SceneContents {...props} />
      </Suspense>
    </Canvas>
  );
}
