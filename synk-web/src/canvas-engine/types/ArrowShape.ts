import { BaseShape } from "./BaseShape";

export interface ArrowShape extends BaseShape {
  type: "arrow";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  // If anchored to a shape, store the shape id + which port (N/S/E/W)
  fromShapeId?: string;
  fromPort?: "n" | "s" | "e" | "w";
  toShapeId?: string;
  toPort?: "n" | "s" | "e" | "w";
  // Computed at render time by the router — never persisted to the server
  waypoints?: { x: number; y: number }[];
}
