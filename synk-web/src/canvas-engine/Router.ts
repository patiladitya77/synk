// import { Shape, ArrowShape } from "../types";
import { astar } from "./Astar";
import { buildGrid, worldToCell, cellToWorld, CELL } from "./grid";
import { Shape } from "./types";
import { ArrowShape } from "./types/ArrowShape";
// import { astar } from "./astar";

export type Point = { x: number; y: number };

// ─── Port resolution ─────────────────────────────────────────────────────────

/**
 * Returns the world-space position of a port on a shape.
 * Ports are the 4 edge midpoints: n, s, e, w.
 */
export function getPortPosition(
  shape: Shape,
  port: "n" | "s" | "e" | "w",
): Point {
  if (shape.type === "rect" || shape.type === "oval") {
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
    if (shape.type !== "rect" && shape.type !== "oval") continue;

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

// ─── Endpoint resolution ─────────────────────────────────────────────────────

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

// ─── Waypoint smoothing ───────────────────────────────────────────────────────

/**
 * Reduce an A* cell-path to only the corners (direction changes).
 * This turns a staircase of 80 cells into 4–6 clean waypoints.
 */
function smoothPath(
  cells: { col: number; row: number }[],
  grid: { originX: number; originY: number },
): Point[] {
  if (cells.length === 0) return [];

  const pts: Point[] = cells.map((c) => ({
    x: grid.originX + c.col * CELL,
    y: grid.originY + c.row * CELL,
  }));

  if (pts.length <= 2) return pts;

  const waypoints: Point[] = [pts[0]];

  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const next = pts[i + 1];

    const dirInX = curr.x - prev.x;
    const dirInY = curr.y - prev.y;
    const dirOutX = next.x - curr.x;
    const dirOutY = next.y - curr.y;

    // Only keep the point if direction changes (it's a corner)
    if (dirInX !== dirOutX || dirInY !== dirOutY) {
      waypoints.push(curr);
    }
  }

  waypoints.push(pts[pts.length - 1]);
  return waypoints;
}

// ─── Main router ─────────────────────────────────────────────────────────────

/**
 * Given an arrow and all current shapes, compute the routed waypoints.
 * Returns a straight fallback [start, end] if A* finds no path.
 *
 * This is called every render frame — it's fast because the grid is coarse.
 */
export function routeArrow(arrow: ArrowShape, shapes: Shape[]): Point[] {
  const excludeIds: string[] = [];
  if (arrow.fromShapeId) excludeIds.push(arrow.fromShapeId);
  if (arrow.toShapeId) excludeIds.push(arrow.toShapeId);

  // Resolve actual start/end world positions
  const start = resolveEndpoint(
    arrow.fromShapeId,
    arrow.fromPort,
    { x: arrow.x1, y: arrow.y1 },
    shapes,
  );
  const end = resolveEndpoint(
    arrow.toShapeId,
    arrow.toPort,
    { x: arrow.x2, y: arrow.y2 },
    shapes,
  );

  // If start === end (degenerate), bail
  if (Math.hypot(start.x - end.x, start.y - end.y) < 2) return [start, end];

  // Build grid, run A*
  const grid = buildGrid(shapes, start.x, start.y, end.x, end.y, excludeIds);

  const startCell = worldToCell(grid, start.x, start.y);
  const endCell = worldToCell(grid, end.x, end.y);

  // Clamp cells to grid bounds
  startCell.col = Math.max(0, Math.min(grid.cols - 1, startCell.col));
  startCell.row = Math.max(0, Math.min(grid.rows - 1, startCell.row));
  endCell.col = Math.max(0, Math.min(grid.cols - 1, endCell.col));
  endCell.row = Math.max(0, Math.min(grid.rows - 1, endCell.row));

  const cells = astar(
    grid,
    startCell.col,
    startCell.row,
    endCell.col,
    endCell.row,
  );

  if (!cells || cells.length === 0) {
    // No path — fall back to straight line
    return [start, end];
  }

  const raw = smoothPath(cells, grid);

  // Always use the exact world start/end (not snapped cell centres)
  // so the line meets the shape port precisely
  if (raw.length >= 2) {
    raw[0] = start;
    raw[raw.length - 1] = end;
  }

  return raw;
}
