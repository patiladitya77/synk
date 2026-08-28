import { Shape } from "./types";

export type Point = { x: number; y: number };

/**
 * Returns the world-space position of a port on a shape.
 * Ports are the 4 edge midpoints: n, s, e, w.
 */
export function getPortPosition(
  shape: Shape,
  port: "n" | "s" | "e" | "w",
): Point {
  if (
    shape.type === "rect" ||
    shape.type === "oval" ||
    shape.type === "diamond"
  ) {
    const cx = shape.x + shape.width / 2;
    const cy = shape.y + shape.height / 2;
    switch (port) {
      case "n":
        return { x: cx, y: shape.y };
      case "s":
        return { x: cx, y: shape.y + shape.height };
      case "e":
        return { x: shape.x + shape.width, y: cy };
      case "w":
        return { x: shape.x, y: cy };
    }
  }
  // Fallback — shouldn't happen
  return { x: 0, y: 0 };
}

/**
 * Given a free-floating point and all shapes, find the nearest port
 * within snapRadius (world px). Returns null if nothing is close enough.
 */
export function findNearestPort(
  x: number,
  y: number,
  shapes: Shape[],
  snapRadius = 30,
  excludeIds: string[] = [],
): { shapeId: string; port: "n" | "s" | "e" | "w"; point: Point } | null {
  let best: {
    shapeId: string;
    port: "n" | "s" | "e" | "w";
    point: Point;
  } | null = null;
  let bestDist = snapRadius;

  for (const shape of shapes) {
    if (excludeIds.includes(shape.id)) continue;
    if (
      shape.type !== "rect" &&
      shape.type !== "oval" &&
      shape.type !== "diamond"
    )
      continue;

    for (const port of ["n", "s", "e", "w"] as const) {
      const p = getPortPosition(shape, port);
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bestDist) {
        bestDist = d;
        best = { shapeId: shape.id, port, point: p };
      }
    }
  }

  return best;
}

/**
 * Resolve an arrow endpoint to a world-space point,
 * taking anchored shape+port into account.
 */
export function resolveEndpoint(
  shapeId: string | undefined,
  port: "n" | "s" | "e" | "w" | undefined,
  fallback: Point,
  shapes: Shape[],
): Point {
  if (!shapeId || !port) return fallback;
  const shape = shapes.find((s) => s.id === shapeId);
  if (!shape) return fallback;
  return getPortPosition(shape, port);
}
