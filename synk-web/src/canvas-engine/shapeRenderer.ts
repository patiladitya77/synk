import { Shape } from "./types";

export interface ShapeRenderer<T extends Shape = Shape> {
  draw(ctx: CanvasRenderingContext2D, shape: T): void;
  drawSelection?(ctx: CanvasRenderingContext2D, shape: T, zoom: number): void;
}
