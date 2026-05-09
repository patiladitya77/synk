import { Point, routeArrow } from "./Router";
import { Shape } from "./types";
import { ArrowShape } from "./types/ArrowShape";

const ARROW_COLOR = "#334155";
const ARROW_WIDTH = 2;
const BEND_RADIUS = 8; // px — corner rounding radius (Eraser.io style)
const ARROWHEAD_LEN = 14; // px — length of the arrowhead
const ARROWHEAD_ANGLE = 0.42; // radians — half-angle of arrowhead wings

// ─── Hit test ────────────────────────────────────────────────────────────────

/**
 * Point-to-segment distance, used for click detection on arrows.
 */
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

export function hitTestArrow(
  shape: ArrowShape,
  x: number,
  y: number,
  shapes: Shape[],
): boolean {
  const waypoints = routeArrow(shape, shapes);
  const TOLERANCE = 8;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    if (distToSegment(x, y, a.x, a.y, b.x, b.y) <= TOLERANCE) return true;
  }
  return false;
}

// ─── Arrowhead ────────────────────────────────────────────────────────────────

function drawArrowhead(ctx: CanvasRenderingContext2D, tip: Point, from: Point) {
  const angle = Math.atan2(tip.y - from.y, tip.x - from.x);

  ctx.save();
  ctx.fillStyle = ARROW_COLOR;
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(
    tip.x - ARROWHEAD_LEN * Math.cos(angle - ARROWHEAD_ANGLE),
    tip.y - ARROWHEAD_LEN * Math.sin(angle - ARROWHEAD_ANGLE),
  );
  ctx.lineTo(
    tip.x - ARROWHEAD_LEN * Math.cos(angle + ARROWHEAD_ANGLE),
    tip.y - ARROWHEAD_LEN * Math.sin(angle + ARROWHEAD_ANGLE),
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ─── Rounded orthogonal path ──────────────────────────────────────────────────

/**
 * Draw a polyline with rounded corners using arcTo.
 * Works correctly for both horizontal and vertical segments.
 */
function drawRoundedPath(
  ctx: CanvasRenderingContext2D,
  pts: Point[],
  radius: number,
) {
  if (pts.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);

  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const next = pts[i + 1];

    // Segment lengths — clamp radius so it never exceeds half the shorter segment
    const d1 = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    const d2 = Math.hypot(next.x - curr.x, next.y - curr.y);
    const r = Math.min(radius, d1 / 2, d2 / 2);

    ctx.arcTo(curr.x, curr.y, next.x, next.y, r);
  }

  const last = pts[pts.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
}

// ─── Main draw ────────────────────────────────────────────────────────────────

export function drawArrow(
  ctx: CanvasRenderingContext2D,
  shape: ArrowShape,
  allShapes: Shape[],
) {
  const waypoints = routeArrow(shape, allShapes);
  if (waypoints.length < 2) return;

  ctx.save();
  ctx.strokeStyle = ARROW_COLOR;
  ctx.lineWidth = ARROW_WIDTH;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash([]);

  drawRoundedPath(ctx, waypoints, BEND_RADIUS);

  // Arrowhead at the final endpoint
  const tip = waypoints[waypoints.length - 1];
  const preTip = waypoints[waypoints.length - 2];
  drawArrowhead(ctx, tip, preTip);

  ctx.restore();
}
