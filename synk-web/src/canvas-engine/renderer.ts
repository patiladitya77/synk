import { Shape } from "./types";
import { drawBackground, drawGrid } from "./draw";
import { shapeRegistry } from "./shapes/shapeRegistery";
import { routeArrow } from "./Router";

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

  // Pass allShapes so arrow renderer can route
  shapes.forEach((shape) => {
    const renderer = shapeRegistry[shape.type];
    renderer?.draw(ctx, shape, shapes);
  });

  if (preview) {
    ctx.globalAlpha = 0.4;
    shapeRegistry[preview.type]?.draw(ctx, preview, shapes);
    ctx.globalAlpha = 1;
  }

  if (selectedShape) {
    // ── Arrow selection: two endpoint handles only ──────────────────────────
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

    // ── Rect / Oval selection: bounding box + 8 handles ─────────────────────
    const HANDLE_SIZE = 8 / camera.zoom;

    const bx = selectedShape.x;
    const by = selectedShape.y;
    const bw = selectedShape.width;
    const bh = selectedShape.height;

    // Dashed selection boundary
    ctx.save();
    ctx.strokeStyle = "#60a5fa";
    ctx.lineWidth = 1 / camera.zoom;
    ctx.setLineDash([6 / camera.zoom, 3 / camera.zoom]);
    ctx.strokeRect(bx, by, bw, bh);
    ctx.restore();

    // 8 square handles
    const handles = [
      { x: bx, y: by },
      { x: bx + bw / 2, y: by },
      { x: bx + bw, y: by },
      { x: bx + bw, y: by + bh / 2 },
      { x: bx + bw, y: by + bh },
      { x: bx + bw / 2, y: by + bh },
      { x: bx, y: by + bh },
      { x: bx, y: by + bh / 2 },
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
