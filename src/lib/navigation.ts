import { GAP, type Level } from "./workspace";
export type Point = { x: number; z: number };
export type Solid = { x: number; z: number; w: number; d: number };
const projectWalls: Solid[] = [-6, 0, 6].map((x) => ({
  x,
  z: -3.2,
  w: 0.3,
  d: 6.3,
}));
const projectDoorWalls = [-9, -3, 3, 9].flatMap((x) => [
  { x: x - 1.9, z: -0.15, w: 2, d: 0.3 },
  { x: x + 1.9, z: -0.15, w: 2, d: 0.3 },
]);
const tables = [-9, -3, 3, 9].map((x) => ({ x, z: -4.2, w: 2.9, d: 1.5 }));
export const SOLIDS: Record<Level, Solid[]> = {
  2: [
    ...projectWalls,
    ...projectDoorWalls,
    ...tables,
    { x: -9, z: 4.7, w: 5, d: 0.9 },
    { x: 0, z: 3.8, w: 2.7, d: 1.7 },
  ],
  1: [
    { x: 0, z: 0, w: 7, d: 2 },
    ...[-7.5, 0, 7.5].map((x) => ({ x, z: -4.6, w: 3.2, d: 1.5 })),
    { x: -11, z: -3.5, w: 0.8, d: 4 },
  ],
  0: [
    { x: -5.8, z: -3.4, w: 0.3, d: 6 },
    { x: -9, z: -4.2, w: 3.1, d: 1.6 },
    { x: 1.2, z: -3.7, w: 7, d: 1.2 },
    { x: 0, z: 3.4, w: 4.2, d: 2.2 },
    { x: -4.3, z: 3.8, w: 2.2, d: 2.2 },
    { x: 8.7, z: 4.1, w: 5.2, d: 4 },
    { x: 8.8, z: -0.1, w: 4.8, d: 3.6 },
    { x: 9.3, z: -5.5, w: 3, d: 0.8 },
  ],
  [-1]: [
    { x: -2, z: 0, w: 5, d: 2.4 },
    { x: 5.5, z: -3, w: 3, d: 1.4 },
    { x: -7.5, z: -4, w: 1, d: 2.5 },
  ],
};
export function canStand(point: Point, floor: Level) {
  const minX = floor === -1 ? -9 : -11.7;
  const maxZ = floor === -1 ? 5.2 : 6.7;
  if (point.x < minX || point.x > 15.6 || point.z < -6.2 || point.z > maxZ)
    return false;
  if (floor === -1 && point.x > 9 && point.x < 12.5 && Math.abs(point.z) < 4.3)
    return false;
  const radius = 0.22;
  return !SOLIDS[floor].some(
    (solid) =>
      Math.abs(point.x - solid.x) < solid.w / 2 + radius &&
      Math.abs(point.z - solid.z) < solid.d / 2 + radius,
  );
}
export function moveWithCollision(
  position: Point,
  dx: number,
  dz: number,
  floor: Level,
): Point {
  const x = canStand({ x: position.x + dx, z: position.z }, floor)
    ? position.x + dx
    : position.x;
  const z = canStand({ x, z: position.z + dz }, floor)
    ? position.z + dz
    : position.z;
  return { x, z };
}
export function stairHeight(z: number, lowerFloor: Level) {
  return lowerFloor * GAP + Math.max(0, Math.min(1, (5 - z) / 10)) * GAP;
}
export const insideSpawn = (floor: Level): Point => ({
  x: floor === -1 ? 5 : -3.8,
  z: floor === -1 ? 3.5 : 1.8,
});
