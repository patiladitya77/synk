import { Shape } from "./types";

export const CELL = 20; // px per grid cell — coarse enough to be fast
const PADDING = 16; // extra clearance around each shape's bounding box

export type Grid = {
  blocked: Uint8Array; // 1 = blocked, 0 = free
  cols: number;
  rows: number;
  originX: number; // world-space left edge of the grid
  originY: number; // world-space top edge of the grid
};

/**
 * Build a navigable grid from the current set of shapes.
 *
 * The grid is sized to tightly wrap all shape bounding boxes
 * plus a margin so arrows have room to route around edges.
 */
export function buildGrid(
  shapes: Shape[],
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  excludeIds: string[] = [], // shapes to ignore (the arrow's own from/to shapes)
): Grid {
  const MARGIN = CELL * 4; // world-space margin around the full bounding rect

  // Compute the world-space bounding rect that must be covered
  const allX = [startX, endX];
  const allY = [startY, endY];

  for (const s of shapes) {
    if (excludeIds.includes(s.id)) continue;
    if (s.type === "rect" || s.type === "oval") {
      allX.push(s.x, s.x + s.width);
      allY.push(s.y, s.y + s.height);
    }
  }

  const minX = Math.min(...allX) - MARGIN;
  const minY = Math.min(...allY) - MARGIN;
  const maxX = Math.max(...allX) + MARGIN;
  const maxY = Math.max(...allY) + MARGIN;

  const cols = Math.ceil((maxX - minX) / CELL);
  const rows = Math.ceil((maxY - minY) / CELL);

  const blocked = new Uint8Array(cols * rows); // all 0 = free

  for (const s of shapes) {
    if (excludeIds.includes(s.id)) continue;
    if (s.type !== "rect" && s.type !== "oval") continue;

    // Expand the shape bbox by PADDING before marking cells
    const bx = s.x - PADDING;
    const by = s.y - PADDING;
    const bw = s.width + PADDING * 2;
    const bh = s.height + PADDING * 2;

    const cellX0 = Math.floor((bx - minX) / CELL);
    const cellY0 = Math.floor((by - minY) / CELL);
    const cellX1 = Math.ceil((bx + bw - minX) / CELL);
    const cellY1 = Math.ceil((by + bh - minY) / CELL);

    for (let cy = Math.max(0, cellY0); cy < Math.min(rows, cellY1); cy++) {
      for (let cx = Math.max(0, cellX0); cx < Math.min(cols, cellX1); cx++) {
        blocked[cy * cols + cx] = 1;
      }
    }
  }

  return { blocked, cols, rows, originX: minX, originY: minY };
}

/** Convert world-space (x, y) to grid cell (col, row) */
export function worldToCell(
  grid: Grid,
  x: number,
  y: number,
): { col: number; row: number } {
  return {
    col: Math.round((x - grid.originX) / CELL),
    row: Math.round((y - grid.originY) / CELL),
  };
}

/** Convert grid cell (col, row) back to world-space centre of that cell */
export function cellToWorld(
  grid: Grid,
  col: number,
  row: number,
): { x: number; y: number } {
  return {
    x: grid.originX + col * CELL,
    y: grid.originY + row * CELL,
  };
}

export function isBlocked(grid: Grid, col: number, row: number): boolean {
  if (col < 0 || row < 0 || col >= grid.cols || row >= grid.rows) return true;
  return grid.blocked[row * grid.cols + col] === 1;
}
