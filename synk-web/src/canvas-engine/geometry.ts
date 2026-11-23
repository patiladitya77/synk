import { hitTestArrow } from "./Arrow";
import { Shape } from "./types";
import { TextShape } from "./types/TextShape";

export type ResizeHandle =
  | "tl"
  | "tm"
  | "tr"
  | "mr"
  | "br"
  | "bm"
  | "bl"
  | "ml";

/**
 * Checks if a world-space point (x, y) hits a shape.
 */
export function hitTestShape(
  shape: Shape,
  x: number,
  y: number,
  allShapes: Shape[],
): boolean {
  if (shape.type === "rect" || shape.type === "text") {
    return (
      x >= shape.x &&
      x <= shape.x + shape.width &&
      y >= shape.y &&
      y <= shape.y + shape.height
    );
  }
  if (shape.type === "oval") {
    const cx = shape.x + shape.width / 2;
    const cy = shape.y + shape.height / 2;
    const rx = shape.width / 2;
    const ry = shape.height / 2;
    const dx = (x - cx) / rx;
    const dy = (y - cy) / ry;
    return dx * dx + dy * dy <= 1;
  }
  if (shape.type === "diamond") {
    const cx = shape.x + shape.width / 2;
    const cy = shape.y + shape.height / 2;
    const rx = shape.width / 2;
    const ry = shape.height / 2;
    if (rx === 0 || ry === 0) return false;
    return Math.abs(x - cx) / rx + Math.abs(y - cy) / ry <= 1;
  }
  if (shape.type === "arrow") {
    return hitTestArrow(shape, x, y, allShapes);
  }
  return false;
}

/**
 * Returns the top-most shape under the specified world-space position.
 */
export function findShapeAt(
  shapes: Shape[],
  x: number,
  y: number,
): Shape | null {
  for (let i = shapes.length - 1; i >= 0; i--) {
    if (hitTestShape(shapes[i], x, y, shapes)) {
      return shapes[i];
    }
  }
  return null;
}

/**
 * Returns the resize handle under the cursor for a selected shape, or null.
 */
export function getResizeHandle(
  shape: Shape,
  x: number,
  y: number,
  zoom: number,
): ResizeHandle | null {
  if (shape.type === "arrow" || shape.type === "line") return null;

  const HANDLE_SIZE = 8 / zoom;
  const H = HANDLE_SIZE / 2;

  const bx = shape.x;
  const by = shape.y;
  const bw = shape.width;
  const bh = shape.height;

  const handles = [
    { id: "tl", x: bx, y: by },
    { id: "tm", x: bx + bw / 2, y: by },
    { id: "tr", x: bx + bw, y: by },
    { id: "mr", x: bx + bw, y: by + bh / 2 },
    { id: "br", x: bx + bw, y: by + bh },
    { id: "bm", x: bx + bw / 2, y: by + bh },
    { id: "bl", x: bx, y: by + bh },
    { id: "ml", x: bx, y: by + bh / 2 },
  ] as const;

  for (const h of handles) {
    if (x >= h.x - H && x <= h.x + H && y >= h.y - H && y <= h.y + H) {
      return h.id;
    }
  }
  return null;
}

/**
 * Resizes a shape based on mouse delta and active resize handle.
 */
export function resizeShape(
  shape: Shape,
  handle: ResizeHandle,
  dx: number,
  dy: number,
): void {
  if (
    shape.type === "rect" ||
    shape.type === "oval" ||
    shape.type === "diamond" ||
    shape.type === "text"
  ) {
    if (handle === "tl") {
      shape.x += dx;
      shape.y += dy;
      shape.width -= dx;
      shape.height -= dy;
    }
    if (handle === "tm") {
      shape.y += dy;
      shape.height -= dy;
    }
    if (handle === "tr") {
      shape.y += dy;
      shape.width += dx;
      shape.height -= dy;
    }
    if (handle === "mr") {
      shape.width += dx;
    }
    if (handle === "br") {
      shape.width += dx;
      shape.height += dy;
    }
    if (handle === "bm") {
      shape.height += dy;
    }
    if (handle === "bl") {
      shape.x += dx;
      shape.width -= dx;
      shape.height += dy;
    }
    if (handle === "ml") {
      shape.x += dx;
      shape.width -= dx;
    }

    shape.width = Math.max(10, shape.width);
    shape.height = Math.max(10, shape.height);
  }
}

/**
 * Resizes a TextShape proportionally from a corner handle based on initial snapshot and mouse delta.
 */
export function resizeTextShapeProportional(
  shape: TextShape,
  snapshot: TextShape,
  handle: ResizeHandle,
  totalDx: number,
  totalDy: number,
): void {
  const isCorner =
    handle === "tl" || handle === "tr" || handle === "br" || handle === "bl";

  if (!isCorner) return;

  const origW = snapshot.width;
  const origH = snapshot.height;
  const origX = snapshot.x;
  const origY = snapshot.y;
  const origFS = snapshot.fontSize;

  let scale = 1;
  if (handle === "br") {
    scale = (origW + totalDx) / origW;
  } else if (handle === "tl") {
    scale = (origW - totalDx) / origW;
  } else if (handle === "tr") {
    scale = (origW + totalDx) / origW;
  } else if (handle === "bl") {
    scale = (origW - totalDx) / origW;
  }

  // Enforce minimum dimensions (width >= 10px, height >= 10px, fontSize >= 1px)
  const minScale = Math.max(10 / origW, 10 / origH, 1 / origFS);
  scale = Math.max(minScale, scale);

  const newW = Math.max(10, origW * scale);
  const newH = Math.max(10, origH * scale);
  const newFS = Math.max(1, Math.round(origFS * scale));

  shape.width = newW;
  shape.height = newH;
  shape.fontSize = newFS;

  // Fixed opposite corners
  if (handle === "br") {
    shape.x = origX;
    shape.y = origY;
  } else if (handle === "tl") {
    shape.x = origX + origW - newW;
    shape.y = origY + origH - newH;
  } else if (handle === "tr") {
    shape.x = origX;
    shape.y = origY + origH - newH;
  } else if (handle === "bl") {
    shape.x = origX + origW - newW;
    shape.y = origY;
  }
}

