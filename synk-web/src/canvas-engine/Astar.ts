import { Grid, isBlocked } from "./grid";

type Node = {
  col: number;
  row: number;
  g: number; // cost from start
  h: number; // heuristic to end
  f: number; // g + h
  parent: Node | null;
};

// Manhattan distance — correct heuristic for orthogonal-only movement
function heuristic(ac: number, ar: number, bc: number, br: number): number {
  return Math.abs(ac - bc) + Math.abs(ar - br);
}

// Four orthogonal neighbours only (no diagonals — keeps path rectilinear)
const DIRS = [
  { dc: 0, dr: -1 }, // up
  { dc: 0, dr: 1 }, // down
  { dc: -1, dr: 0 }, // left
  { dc: 1, dr: 0 }, // right
];

/**
 * Returns an ordered list of { col, row } cells from start to end,
 * or null if no path exists.
 *
 * Uses a simple binary-heap-less A* (good enough for ~5000-cell grids).
 */
export function astar(
  grid: Grid,
  startCol: number,
  startRow: number,
  endCol: number,
  endRow: number,
): { col: number; row: number }[] | null {
  const key = (c: number, r: number) => r * grid.cols + c;

  const open = new Map<number, Node>();
  const closed = new Set<number>();

  const startNode: Node = {
    col: startCol,
    row: startRow,
    g: 0,
    h: heuristic(startCol, startRow, endCol, endRow),
    f: 0,
    parent: null,
  };
  startNode.f = startNode.g + startNode.h;
  open.set(key(startCol, startRow), startNode);

  let iterations = 0;
  const MAX_ITER = 10_000; // safety valve

  while (open.size > 0 && iterations++ < MAX_ITER) {
    // Pick the open node with lowest f
    let current: Node | null = null;
    for (const node of open.values()) {
      if (!current || node.f < current.f) current = node;
    }
    if (!current) break;

    if (current.col === endCol && current.row === endRow) {
      // Reconstruct path
      const path: { col: number; row: number }[] = [];
      let n: Node | null = current;
      while (n) {
        path.unshift({ col: n.col, row: n.row });
        n = n.parent;
      }
      return path;
    }

    open.delete(key(current.col, current.row));
    closed.add(key(current.col, current.row));

    for (const { dc, dr } of DIRS) {
      const nc = current.col + dc;
      const nr = current.row + dr;
      const nk = key(nc, nr);

      if (closed.has(nk)) continue;
      if (isBlocked(grid, nc, nr)) continue;

      const g = current.g + 1;
      const existing = open.get(nk);

      if (!existing || g < existing.g) {
        const h = heuristic(nc, nr, endCol, endRow);
        const node: Node = {
          col: nc,
          row: nr,
          g,
          h,
          f: g + h,
          parent: current,
        };
        open.set(nk, node);
      }
    }
  }

  return null; // no path found
}
