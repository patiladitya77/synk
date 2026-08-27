import { Camera } from "./types";
import { Point } from "./arrowPorts";
import { ResizeHandle } from "./geometry";

export const RESIZE_CURSORS: Record<ResizeHandle, string> = {
  tl: "nwse-resize",
  tm: "ns-resize",
  tr: "nesw-resize",
  mr: "ew-resize",
  br: "nwse-resize",
  bm: "ns-resize",
  bl: "nesw-resize",
  ml: "ew-resize",
};

/**
 * Converts a mouse event screen coordinate into world-space canvas position.
 */
export function screenToWorld(
  e: MouseEvent,
  canvas: HTMLCanvasElement,
  camera: Camera,
): Point {
  const rect = canvas.getBoundingClientRect();
  const screenX = e.clientX - rect.left;
  const screenY = e.clientY - rect.top;

  return {
    x: (screenX - camera.x) / camera.zoom,
    y: (screenY - camera.y) / camera.zoom,
  };
}
