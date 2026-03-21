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
    const HANDLE_SIZE = 8 / camera.zoom;

    // Get bounding box for both rect and circle
    let bx: number, by: number, bw: number, bh: number;
    if (selectedShape.type === "rect") {
      bx = selectedShape.x;
      by = selectedShape.y;
      bw = selectedShape.width;
      bh = selectedShape.height;
    } else {
      // circle
      bx = selectedShape.cx - selectedShape.r;
      by = selectedShape.cy - selectedShape.r;
      bw = selectedShape.r * 2;
      bh = selectedShape.r * 2;
    }

    // Dashed selection boundary
    ctx.save();
    ctx.strokeStyle = "#60a5fa";
    ctx.lineWidth = 1 / camera.zoom;
    ctx.setLineDash([6 / camera.zoom, 3 / camera.zoom]);
    ctx.strokeRect(bx, by, bw, bh);
    ctx.restore();

    // Square corner + edge handles
    const handles = [
      { x: bx, y: by }, // tl
      { x: bx + bw / 2, y: by }, // tm
      { x: bx + bw, y: by }, // tr
      { x: bx + bw, y: by + bh / 2 }, // mr
      { x: bx + bw, y: by + bh }, // br
      { x: bx + bw / 2, y: by + bh }, // bm
      { x: bx, y: by + bh }, // bl
      { x: bx, y: by + bh / 2 }, // ml
    ];

    handles.forEach(({ x, y }) => {
      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 1.5 / camera.zoom;
      ctx.setLineDash([]);
      ctx.fillRect(
        x - HANDLE_SIZE / 2,
        y - HANDLE_SIZE / 2,
        HANDLE_SIZE,
        HANDLE_SIZE,
      );
      ctx.strokeRect(
        x - HANDLE_SIZE / 2,
        y - HANDLE_SIZE / 2,
        HANDLE_SIZE,
        HANDLE_SIZE,
      );
      ctx.restore();
    });
  }

  ctx.restore();
}
