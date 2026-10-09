import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
export type V3 = [number, number, number];
const box = new THREE.BoxGeometry(1, 1, 1);
const rounded = new RoundedBoxGeometry(1, 1, 1, 2, 0.07);
const sphere = new THREE.SphereGeometry(0.5, 12, 10);
const cylinder = new THREE.CylinderGeometry(0.5, 0.5, 1, 12);
const cone = new THREE.ConeGeometry(0.5, 1, 16);
const mats = new Map<string, THREE.MeshStandardMaterial>();
export const WOOD = "#946849",
  DARK_WOOD = "#6f4c36",
  LIGHT_WOOD = "#c59c71",
  CREAM = "#eee0c4",
  STONE = "#a5a096";
export function mat(color: string, emissive = "") {
  const key = color + emissive;
  if (!mats.has(key))
    mats.set(
      key,
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.83,
        emissive: emissive || "#000000",
        emissiveIntensity: emissive ? 0.8 : 0,
      }),
    );
  return mats.get(key)!;
}
type ShapeProps = {
  position?: V3;
  size?: V3;
  color?: string;
  rotation?: V3;
  round?: boolean;
  emissive?: string;
  shadow?: boolean;
};
export function Block({
  position = [0, 0, 0],
  size = [1, 1, 1],
  color = WOOD,
  rotation,
  round = false,
  emissive,
  shadow = true,
}: ShapeProps) {
  return (
    <mesh
      position={position}
      scale={size}
      rotation={rotation}
      geometry={round ? rounded : box}
      material={mat(color, emissive)}
      castShadow={shadow}
      receiveShadow
    />
  );
}
export function Ball({
  position,
  size = [1, 1, 1],
  color = CREAM,
  rotation,
}: ShapeProps) {
  return (
    <mesh
      position={position}
      scale={size}
      rotation={rotation}
      geometry={sphere}
      material={mat(color)}
      castShadow
    />
  );
}
export function Cylinder({
  position,
  size = [1, 1, 1],
  color = WOOD,
  rotation,
  emissive,
}: ShapeProps) {
  return (
    <mesh
      position={position}
      scale={size}
      rotation={rotation}
      geometry={cylinder}
      material={mat(color, emissive)}
      castShadow
      receiveShadow
    />
  );
}
export function Cone({
  position,
  size = [1, 1, 1],
  color = WOOD,
  rotation,
}: ShapeProps) {
  return (
    <mesh
      position={position}
      scale={size}
      rotation={rotation}
      geometry={cone}
      material={mat(color)}
      castShadow
    />
  );
}
export function Plant({
  position,
  scale = 1,
}: {
  position: V3;
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <Cone
        position={[0, 0.2, 0]}
        size={[0.5, 0.4, 0.5]}
        color="#b48161"
        rotation={[Math.PI, 0, 0]}
      />
      <Cylinder
        position={[0, 0.4, 0]}
        size={[0.52, 0.08, 0.52]}
        color="#cd9c72"
      />
      <Cylinder
        position={[0, 0.61, 0]}
        size={[0.055, 0.5, 0.055]}
        color="#738465"
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <Ball
          key={i}
          position={[
            Math.sin(i * 2.4) * 0.19,
            0.71 + i * 0.1,
            Math.cos(i * 2.4) * 0.16,
          ]}
          size={[0.27, 0.54, 0.15]}
          rotation={[0.25, i * 2.4, Math.sin(i) * 0.6]}
          color={i % 2 ? "#7d9d68" : "#95b07a"}
        />
      ))}
    </group>
  );
}
export function Lantern({
  position,
  rotation = 0,
}: {
  position: V3;
  rotation?: number;
}) {
  const light = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (light.current)
      light.current.scale.y =
        0.95 + Math.sin(clock.elapsedTime * 2 + position[0]) * 0.045;
  });
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Block
        size={[0.1, 0.28, 0.28]}
        position={[0, 0.3, -0.13]}
        color={DARK_WOOD}
      />
      <Cylinder
        size={[0.075, 0.18, 0.075]}
        position={[0, 0.53, 0]}
        color="#746448"
      />
      <Cone size={[0.43, 0.2, 0.43]} position={[0, 0.38, 0]} color="#806646" />
      <mesh
        ref={light}
        geometry={box}
        material={mat("#ffe1a0", "#ffb957")}
        scale={[0.28, 0.35, 0.28]}
        position={[0, 0.1, 0]}
      />
      <Block size={[0.4, 0.07, 0.4]} position={[0, -0.09, 0]} color="#806646" />
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <Block
            key={`${x}${z}`}
            position={[x * 0.16, 0.12, z * 0.16]}
            size={[0.035, 0.36, 0.035]}
            color="#806646"
          />
        )),
      )}
    </group>
  );
}
export function Table({
  position,
  width = 3,
  depth = 1.5,
  rotation = 0,
  map = false,
}: {
  position: V3;
  width?: number;
  depth?: number;
  rotation?: number;
  map?: boolean;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Block
        position={[0, 0.94, 0]}
        size={[width, 0.17, depth]}
        color={LIGHT_WOOD}
        round
      />
      <Block
        position={[0, 0.8, 0]}
        size={[width - 0.12, 0.17, depth - 0.08]}
        color={WOOD}
      />
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <Block
            key={`${x}${z}`}
            position={[x * (width / 2 - 0.22), 0.42, z * (depth / 2 - 0.2)]}
            size={[0.19, 0.85, 0.19]}
            color={DARK_WOOD}
            round
          />
        )),
      )}
      {map ? (
        <>
          <Block
            position={[0, 1.035, 0]}
            size={[width * 0.7, 0.025, depth * 0.72]}
            color="#f4e7bd"
          />
          <Block
            position={[0.1, 1.06, 0]}
            size={[0.7, 0.015, 0.5]}
            color="#a2b99a"
            rotation={[0, 0.3, 0]}
          />
          <Cylinder
            position={[-0.5, 1.075, 0.2]}
            size={[0.13, 0.045, 0.13]}
            color="#aa7951"
          />
        </>
      ) : (
        <Scroll position={[0, 1.05, 0]} />
      )}
      <Mug position={[width / 2 - 0.4, 1.06, -0.25]} />
      <Cylinder
        position={[-width / 2 + 0.38, 1.1, 0]}
        size={[0.13, 0.17, 0.13]}
        color="#575367"
      />
      <Block
        position={[-width / 2 + 0.4, 1.34, 0]}
        size={[0.025, 0.44, 0.025]}
        color="#e7dfc5"
        rotation={[0, 0, -0.3]}
      />
    </group>
  );
}
export function Chair({
  position,
  rotation = 0,
  color = "#b39a75",
}: {
  position: V3;
  rotation?: number;
  color?: string;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Block
        position={[0, 0.48, 0]}
        size={[0.78, 0.14, 0.75]}
        color={LIGHT_WOOD}
        round
      />
      <Block
        position={[0, 0.58, 0]}
        size={[0.65, 0.12, 0.62]}
        color={color}
        round
      />
      <Block
        position={[0, 1, 0.32]}
        size={[0.72, 0.77, 0.1]}
        color={WOOD}
        round
      />
      <Block
        position={[0, 1.06, 0.24]}
        size={[0.57, 0.48, 0.08]}
        color={color}
        round
      />
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <Block
            key={`${x}${z}`}
            position={[x * 0.27, 0.21, z * 0.24]}
            size={[0.11, 0.42, 0.11]}
            color={DARK_WOOD}
          />
        )),
      )}
    </group>
  );
}
export function Stool({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Cylinder
        position={[0, 0.56, 0]}
        size={[0.7, 0.15, 0.7]}
        color={LIGHT_WOOD}
      />
      <Cylinder
        position={[0, 0.27, 0]}
        size={[0.22, 0.54, 0.22]}
        color={WOOD}
      />
      <Cylinder
        position={[0, 0.05, 0]}
        size={[0.54, 0.07, 0.54]}
        color={WOOD}
      />
    </group>
  );
}
export function Scroll({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Block size={[0.8, 0.025, 0.55]} color="#f3e5bd" />
      {[-1, 1].map((i) => (
        <Cylinder
          key={i}
          position={[i * 0.4, 0.035, 0]}
          size={[0.1, 0.65, 0.1]}
          rotation={[Math.PI / 2, 0, 0]}
          color="#e8d5a7"
        />
      ))}
    </group>
  );
}
export function Mug({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Cylinder
        position={[0, 0.13, 0]}
        size={[0.2, 0.25, 0.2]}
        color="#dbc69c"
      />
      <Cylinder
        position={[0, 0.26, 0]}
        size={[0.17, 0.015, 0.17]}
        color="#765642"
      />
      <mesh position={[0.13, 0.15, 0]} material={mat("#dbc69c")}>
        <torusGeometry args={[0.06, 0.022, 6, 10]} />
      </mesh>
    </group>
  );
}
export function Bookshelf({
  position,
  rotation = 0,
  width = 2.5,
  extra = 0,
}: {
  position: V3;
  rotation?: number;
  width?: number;
  extra?: number;
}) {
  const colors = ["#839583", "#b68569", "#8d8aaa", "#ccb479", "#93b1bb"];
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Block
        position={[0, 1.4, -0.22]}
        size={[width, 2.8, 0.13]}
        color={DARK_WOOD}
      />
      {[-1, 1].map((x) => (
        <Block
          key={x}
          position={[(x * width) / 2, 1.4, 0]}
          size={[0.13, 2.8, 0.65]}
          color={WOOD}
        />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Block
          key={i}
          position={[0, i * 0.87 + 0.1, 0]}
          size={[width + 0.2, 0.12, 0.7]}
          color={WOOD}
        />
      ))}
      {Array.from({ length: 12 + Math.min(extra, 15) }, (_, i) => {
        const count = 9,
          row = Math.floor(i / count),
          col = i % count;
        return (
          <Block
            key={i}
            position={[
              -width / 2 + 0.24 + (col * (width - 0.4)) / count,
              0.43 + row * 0.87,
              0.02,
            ]}
            size={[0.15, 0.45 + (i % 3) * 0.08, 0.38]}
            color={colors[i % colors.length]}
            rotation={[0, 0, i % 6 === 0 ? 0.08 : 0]}
            round
          />
        );
      })}
    </group>
  );
}
export function Barrel({
  position,
  scale = 1,
}: {
  position: V3;
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <Ball position={[0, 0.6, 0]} size={[0.96, 1.28, 0.96]} color={WOOD} />
      <Cylinder
        position={[0, 0.6, 0]}
        size={[0.87, 1.2, 0.87]}
        color={LIGHT_WOOD}
      />
      {[0.22, 0.9].map((y) => (
        <Cylinder
          key={y}
          position={[0, y, 0]}
          size={[0.96, 0.09, 0.96]}
          color="#766b57"
        />
      ))}
      <Cylinder
        position={[0, 1.23, 0]}
        size={[0.87, 0.04, 0.87]}
        color={WOOD}
      />
    </group>
  );
}
export function Crate({
  position,
  size = 0.9,
}: {
  position: V3;
  size?: number;
}) {
  return (
    <group position={position}>
      <Block
        position={[0, size / 2, 0]}
        size={[size, size, size]}
        color={LIGHT_WOOD}
        round
      />
      <Block
        position={[0, size / 2, size / 2 + 0.01]}
        size={[size * 0.9, 0.1, 0.045]}
        color={WOOD}
        rotation={[0, 0, 0.7]}
      />
      <Block
        position={[0, size / 2, size / 2 + 0.01]}
        size={[0.1, size * 0.9, 0.045]}
        color={WOOD}
        rotation={[0, 0, 0.7]}
      />
    </group>
  );
}
export function Banner({
  position,
  color,
  symbol = "✦",
}: {
  position: V3;
  color: string;
  symbol?: string;
}) {
  return (
    <group position={position}>
      <Block position={[0, 0, 0]} size={[1.2, 1.9, 0.035]} color={color} />
      <Block position={[0, 1, 0]} size={[1.52, 0.1, 0.13]} color={WOOD} round />
      <Sign
        position={[0, 0.1, 0.035]}
        text={symbol}
        width={1}
        height={0.9}
        transparent
      />
    </group>
  );
}
function textTexture(text: string, transparent: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 256;
  const context = canvas.getContext("2d")!;
  if (!transparent) {
    context.fillStyle = "#f9efd6";
    context.fillRect(0, 0, 768, 256);
    context.strokeStyle = "#b99368";
    context.lineWidth = 9;
    context.strokeRect(6, 6, 756, 244);
  }
  context.fillStyle = transparent ? "#f5e7bc" : "#443b31";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `600 ${transparent ? 125 : 48}px Georgia`;
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (context.measureText(next).width > 700 && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  lines.push(line);
  lines.forEach((l, i) =>
    context.fillText(l, 384, 128 + (i - (lines.length - 1) / 2) * 58),
  );
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
export function Sign({
  position,
  text,
  width = 3.5,
  height = 0.8,
  rotation = 0,
  transparent = false,
}: {
  position: V3;
  text: string;
  width?: number;
  height?: number;
  rotation?: number;
  transparent?: boolean;
}) {
  const texture = useMemo(
    () => textTexture(text, transparent),
    [text, transparent],
  );
  return (
    <mesh position={position} rotation={[0, rotation, 0]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent={transparent}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}
export function Noticeboard({
  position,
  rotation = 0,
  count = 0,
}: {
  position: V3;
  rotation?: number;
  count?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Block size={[2.5, 1.7, 0.13]} color={DARK_WOOD} round />
      <Block
        position={[0, 0, 0.08]}
        size={[2.24, 1.46, 0.04]}
        color="#bb996c"
      />
      {Array.from({ length: Math.min(8, count) }, (_, i) => (
        <Block
          key={i}
          position={[
            -0.75 + (i % 4) * 0.5,
            0.28 - Math.floor(i / 4) * 0.6,
            0.12,
          ]}
          size={[0.4, 0.48, 0.025]}
          color={i % 2 ? "#dfcea6" : "#f5e8c5"}
          rotation={[0, 0, i % 2 ? 0.04 : -0.08]}
        />
      ))}
      <Block position={[-1, -1.35, 0]} size={[0.13, 1.2, 0.13]} color={WOOD} />
      <Block position={[1, -1.35, 0]} size={[0.13, 1.2, 0.13]} color={WOOD} />
    </group>
  );
}
export function Water({
  position,
  width,
  depth,
  pond = false,
}: {
  position: V3;
  width: number;
  depth: number;
  pond?: boolean;
}) {
  const bob = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (bob.current) {
      bob.current.position.y = Math.sin(clock.elapsedTime * 1.2) * 0.025;
      bob.current.rotation.y = Math.sin(clock.elapsedTime * 0.4) * 0.04;
    }
  });
  return (
    <group position={position}>
      <Block
        position={[0, 0.1, 0]}
        size={[width + 0.5, 0.2, depth + 0.5]}
        color={pond ? "#a3ab8f" : "#d5cab4"}
        round
      />
      <Block
        position={[0, 0.21, 0]}
        size={[width, 0.09, depth]}
        color={pond ? "#81b2ac" : "#83becb"}
        round
      />
      {[-1, 1].map((i) => (
        <Block
          key={i}
          position={[i * (width / 2 + 0.12), 0.32, 0]}
          size={[0.25, 0.22, depth + 0.5]}
          color={pond ? "#acb295" : "#ded5bc"}
          round
        />
      ))}
      <group ref={bob}>
        {Array.from({ length: 7 }, (_, i) => (
          <Block
            key={i}
            position={[
              -width * 0.38 + (i % 4) * width * 0.21,
              0.269,
              -depth * 0.32 + Math.floor(i / 4) * depth * 0.4,
            ]}
            size={[0.35, 0.015, 0.03]}
            color="#c0dedb"
            rotation={[0, 0.15, 0]}
            shadow={false}
          />
        ))}
        {pond ? (
          <>
            {[-1, 0, 1].map((i) => (
              <Cylinder
                key={i}
                position={[i * 0.6, 0.27, 0.5]}
                size={[0.42, 0.015, 0.42]}
                color="#8da774"
              />
            ))}
            <Block
              position={[0, 0.4, -depth / 2]}
              size={[1, 0.16, 1.5]}
              color={LIGHT_WOOD}
            />
            <Block
              position={[0.5, 1.02, -depth / 2]}
              size={[0.04, 1.6, 0.04]}
              color={DARK_WOOD}
              rotation={[0, 0, -0.6]}
            />
          </>
        ) : (
          <group position={[0.6, 0.35, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} material={mat("#eac563")}>
              <torusGeometry args={[0.4, 0.14, 8, 20]} />
            </mesh>
            <Ball
              position={[0, 0.18, 0.2]}
              size={[0.32, 0.32, 0.32]}
              color="#f1d076"
            />
            <Cone
              position={[0, 0.14, 0.42]}
              size={[0.12, 0.22, 0.12]}
              color="#d79757"
              rotation={[Math.PI / 2, 0, 0]}
            />
          </group>
        )}
      </group>
    </group>
  );
}
