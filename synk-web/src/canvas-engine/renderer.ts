import { Shape } from "./types";
import { drawBackground, drawShape } from "./draw";
import { drawGrid } from "./grid";

export function render({
  ctx,
  canvas,
  camera,
  shapes,
  preview,
}: {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  camera: { x: number; y: number; zoom: number };
  shapes: Shape[];
  preview?: Shape;
}) {
  drawBackground(ctx, canvas);
  drawGrid(ctx, canvas, camera);

  ctx.save();
  ctx.translate(camera.x, camera.y);
  ctx.scale(camera.zoom, camera.zoom);

  shapes.forEach((s) => drawShape(ctx, s));

  if (preview) {
    ctx.globalAlpha = 0.4;
    drawShape(ctx, preview);
  }

  ctx.restore();
}
