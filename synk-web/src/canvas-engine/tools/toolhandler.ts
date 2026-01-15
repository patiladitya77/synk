import { Shape } from "../types";

export type Point = {
  x: number;
  y: number;
};

export interface ToolHandler {
  onPointerDown?(pos: Point): Shape | void;
  onPointerMove?(pos: Point): Shape | void;
  onPointerUp?(pos: Point): Shape | void;
  getPreview?(pos: Point): Shape | null;
}
