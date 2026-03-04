import { Shape } from "./types";
import { drawBackground } from "./draw";
import { drawGrid } from "./grid";
import { shapeRegistry } from "./shapes/shapeRegistery";

export function render({
  ctx,
  canvas,
  camera,
  shapes,
  preview,
  selectedShape,
}: {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  camera: { x: number; y: number; zoom: number };
  shapes: Shape[];
  preview?: Shape;
  selectedShape?: Shape | null;
}) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground(ctx, canvas);
  drawGrid(ctx, canvas, camera);

  ctx.save();
  ctx.translate(camera.x, camera.y);
  ctx.scale(camera.zoom, camera.zoom);

  shapes.forEach((shape) => {
    const renderer = shapeRegistry[shape.type];
    renderer?.draw(ctx, shape);
  });

  if (preview) {
    ctx.globalAlpha = 0.4;
    shapeRegistry[preview.type]?.draw(ctx, preview);
    ctx.globalAlpha = 1;
  }

  if (selectedShape) {
    const renderer = shapeRegistry[selectedShape.type];
    ctx.save();
    ctx.strokeStyle = "#60a5fa";
    ctx.lineWidth = 1 / camera.zoom;
    ctx.setLineDash([6 / camera.zoom]);

    renderer?.drawSelection?.(ctx, selectedShape, camera.zoom);

    ctx.restore();
  }

  ctx.restore();
}
