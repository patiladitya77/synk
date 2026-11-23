import { Shape } from "./types";
import { drawBackground, drawGrid } from "./draw";
import { shapeRegistry } from "./shapes/shapeRegistery";
import { routeArrow } from "./arrowRouter";

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

  // Render all shapes
  shapes.forEach((shape) => {
    const renderer = shapeRegistry[shape.type];
    renderer?.draw(ctx, shape, shapes);
  });

  // Render live preview shape
  if (preview) {
    ctx.globalAlpha = 0.4;
    shapeRegistry[preview.type]?.draw(ctx, preview, shapes);
    ctx.globalAlpha = 1;
  }

  // Render selection overlay
  if (selectedShape) {
    // ── Arrow selection: special routed path + 2 endpoint handles ───────────
    if (selectedShape.type === "arrow") {
      const waypoints = routeArrow(selectedShape, shapes);
      if (waypoints.length >= 2) {
        const start = waypoints[0];
        const end = waypoints[waypoints.length - 1];
        const HANDLE_R = 5 / camera.zoom;

        // Draw the path highlighted
        ctx.save();
        ctx.strokeStyle = "#60a5fa";
        ctx.lineWidth = 2 / camera.zoom;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        for (let i = 1; i < waypoints.length; i++) {
          ctx.lineTo(waypoints[i].x, waypoints[i].y);
        }
        ctx.stroke();
        ctx.restore();

        // Draw endpoint handles
        for (const pt of [start, end]) {
          ctx.save();
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#60a5fa";
          ctx.lineWidth = 1.5 / camera.zoom;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, HANDLE_R, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      }
      ctx.restore(); // matched to ctx.save() before shapes loop
      return;
    }

    // ── Delegate regular shape selection to shape renderer ─────────────────
    const renderer = shapeRegistry[selectedShape.type];
    renderer?.drawSelection?.(ctx, selectedShape, camera.zoom);
  }

  ctx.restore();
}
