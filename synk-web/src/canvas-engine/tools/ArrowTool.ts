import { findNearestPort, Point } from "../arrowPorts";
import { Shape } from "../types";
import { ArrowShape } from "../types/ArrowShape";

export type ArrowDraft = {
  start: Point;
  fromShapeId?: string;
  fromPort?: "n" | "s" | "e" | "w";
};


// Creates an arrow draft on mousedown.
export function createArrowDraft(
  x: number,
  y: number,
  shapes: Shape[],
): ArrowDraft {
  const snap = findNearestPort(x, y, shapes);
  if (snap) {
    return {
      start: snap.point,
      fromShapeId: snap.shapeId,
      fromPort: snap.port,
    };
  }
  return {
    start: { x, y },
  };
}


//Returns a live preview arrow from an active draft and current cursor position.

export function getArrowPreview(
  draft: ArrowDraft,
  x: number,
  y: number,
  shapes: Shape[],
): ArrowShape {
  const snap = findNearestPort(
    x,
    y,
    shapes,
    30,
    draft.fromShapeId ? [draft.fromShapeId] : [],
  );

  return {
    id: "__preview__",
    type: "arrow",
    x1: draft.start.x,
    y1: draft.start.y,
    x2: snap ? snap.point.x : x,
    y2: snap ? snap.point.y : y,
    fromShapeId: draft.fromShapeId,
    fromPort: draft.fromPort,
    toShapeId: snap?.shapeId,
    toPort: snap?.port,
  };
}


//Finalises and returns the created ArrowShape on mouseup.

export function createArrow(
  draft: ArrowDraft,
  x: number,
  y: number,
  shapes: Shape[],
  generateId: () => string,
): ArrowShape | null {
  if (Math.hypot(x - draft.start.x, y - draft.start.y) < 5) return null;

  const snap = findNearestPort(
    x,
    y,
    shapes,
    30,
    draft.fromShapeId ? [draft.fromShapeId] : [],
  );

  return {
    id: generateId(),
    type: "arrow",
    x1: draft.start.x,
    y1: draft.start.y,
    x2: snap ? snap.point.x : x,
    y2: snap ? snap.point.y : y,
    fromShapeId: draft.fromShapeId,
    fromPort: draft.fromPort,
    toShapeId: snap?.shapeId,
    toPort: snap?.port,
  };
}
