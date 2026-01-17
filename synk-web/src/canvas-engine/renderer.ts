import { Shape } from "./types";
import { drawBackground, drawShape } from "./draw";
import { drawGrid } from "./grid";

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

  shapes.forEach((s) => drawShape(ctx, s));

  if (preview) {
    ctx.globalAlpha = 0.4;
    drawShape(ctx, preview);
    ctx.globalAlpha = 1;
  }

  if (selectedShape) {
    ctx.save();
    ctx.strokeStyle = "#60a5fa";
    ctx.lineWidth = 1 / camera.zoom;
    ctx.setLineDash([6 / camera.zoom]);

    if (selectedShape.type === "rect") {
      const { x, y, width, height } = selectedShape;

      ctx.strokeRect(x, y, width, height);

      const HANDLE_SIZE = 8 / camera.zoom;
      ctx.fillStyle = "#60a5fa";

      const drawHandle = (hx: number, hy: number) => {
        ctx.fillRect(
          hx - HANDLE_SIZE / 2,
          hy - HANDLE_SIZE / 2,
          HANDLE_SIZE,
          HANDLE_SIZE
        );
      };

      drawHandle(x, y);
      drawHandle(x + width, y);
      drawHandle(x, y + height);
      drawHandle(x + width, y + height);
    }
    if (selectedShape.type === "circle") {
      ctx.beginPath();
      ctx.arc(
        selectedShape.cx,
        selectedShape.cy,
        selectedShape.r,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    ctx.restore();
  }

  ctx.restore();
}
