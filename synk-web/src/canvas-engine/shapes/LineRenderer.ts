import { ShapeRenderer } from "../shapeRenderer";
import { LineShape } from "../types/LineShape";
import { Shape } from "../types";

const LINE_COLOR = "#334155";
const LINE_WIDTH = 2;
const TOLERANCE = 8;

/** Returns the center of a bounded shape, or the midpoint of a line. */
function getShapeCenter(shape: Shape): { x: number; y: number } | null {
  if (
    shape.type === "rect" ||
    shape.type === "oval" ||
    shape.type === "diamond"
  ) {
    return { x: shape.x + shape.width / 2, y: shape.y + shape.height / 2 };
  }
  if (shape.type === "arrow" || shape.type === "line") {
    return { x: (shape.x1 + shape.x2) / 2, y: (shape.y1 + shape.y2) / 2 };
  }
  return null;
}

/** Resolve the actual start/end points of a line, following shape anchors. */
export function resolveLineEndpoints(
  shape: LineShape,
  allShapes: Shape[],
): { x1: number; y1: number; x2: number; y2: number } {
  let x1 = shape.x1;
  let y1 = shape.y1;
  let x2 = shape.x2;
  let y2 = shape.y2;

  if (shape.fromShapeId) {
    const from = allShapes.find((s) => s.id === shape.fromShapeId);
    if (from) {
      const c = getShapeCenter(from);
      if (c) {
        x1 = c.x;
        y1 = c.y;
      }
    }
  }
  if (shape.toShapeId) {
    const to = allShapes.find((s) => s.id === shape.toShapeId);
    if (to) {
      const c = getShapeCenter(to);
      if (c) {
        x2 = c.x;
        y2 = c.y;
      }
    }
  }

  return { x1, y1, x2, y2 };
}

/** Point-to-segment distance for hit testing. */
function distToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

export function hitTestLine(
  shape: LineShape,
  x: number,
  y: number,
  allShapes: Shape[],
): boolean {
  const { x1, y1, x2, y2 } = resolveLineEndpoints(shape, allShapes);
  return distToSegment(x, y, x1, y1, x2, y2) <= TOLERANCE;
}

export const lineRenderer: ShapeRenderer<LineShape> = {
  draw(ctx, shape, allShapes = []) {
    const { x1, y1, x2, y2 } = resolveLineEndpoints(shape, allShapes);

    ctx.save();
    ctx.strokeStyle = shape.stroke ?? LINE_COLOR;
    ctx.lineWidth = shape.strokeWidth ?? LINE_WIDTH;
    ctx.lineCap = "round";
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.restore();
  },
};
