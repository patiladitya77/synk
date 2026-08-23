import { BaseShape } from "./BaseShape";

export interface LineShape extends BaseShape {
  type: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  // If anchored to a shape, store the shape id (connects to center)
  fromShapeId?: string;
  toShapeId?: string;
}
