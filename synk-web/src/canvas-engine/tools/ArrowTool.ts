import { findNearestPort } from "../Router";
import { Shape } from "../types";
import { ArrowShape } from "../types/ArrowShape";

let _startX = 0;
let _startY = 0;
let _fromShapeId: string | undefined;
let _fromPort: "n" | "s" | "e" | "w" | undefined;

/**
 * Call this on mousedown to begin drawing an arrow.
 * Returns the start anchor info (may be snapped to a shape port).
 */
export function arrowToolMouseDown(
  x: number,
  y: number,
  shapes: Shape[],
): void {
  const snap = findNearestPort(x, y, shapes);
  if (snap) {
    _startX = snap.point.x;
    _startY = snap.point.y;
    _fromShapeId = snap.shapeId;
    _fromPort = snap.port;
  } else {
    _startX = x;
    _startY = y;
    _fromShapeId = undefined;
    _fromPort = undefined;
  }
}

/**
 * Call this on mousemove to get a live preview arrow (not yet committed).
 * Pass the current cursor world position.
 */
export function arrowToolGetPreview(
  x: number,
  y: number,
  shapes: Shape[],
): ArrowShape {
  // Snap end to port if close enough
  const snap = findNearestPort(
    x,
    y,
    shapes,
    30,
    _fromShapeId ? [_fromShapeId] : [],
  );

  const preview: ArrowShape = {
    id: "__preview__",
    type: "arrow",
    x1: _startX,
    y1: _startY,
    x2: snap ? snap.point.x : x,
    y2: snap ? snap.point.y : y,
    fromShapeId: _fromShapeId,
    fromPort: _fromPort,
    toShapeId: snap?.shapeId,
    toPort: snap?.port,
  };

  return preview;
}

/**
 * Call this on mouseup to finalise the arrow shape.
 * Returns the committed ArrowShape ready to pass to AddShapeCommand.
 */
export function arrowToolMouseUp(
  x: number,
  y: number,
  shapes: Shape[],
  generateId: () => string,
): ArrowShape | null {
  // Don't create a zero-length arrow
  if (Math.hypot(x - _startX, y - _startY) < 5) return null;

  const snap = findNearestPort(
    x,
    y,
    shapes,
    30,
    _fromShapeId ? [_fromShapeId] : [],
  );

  const arrow: ArrowShape = {
    id: generateId(),
    type: "arrow",
    x1: _startX,
    y1: _startY,
    x2: snap ? snap.point.x : x,
    y2: snap ? snap.point.y : y,
    fromShapeId: _fromShapeId,
    fromPort: _fromPort,
    toShapeId: snap?.shapeId,
    toPort: snap?.port,
  };

  // Reset state
  _fromShapeId = undefined;
  _fromPort = undefined;

  return arrow;
}
