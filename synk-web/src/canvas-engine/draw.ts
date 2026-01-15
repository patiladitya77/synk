import { Shape } from "./types";

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
) {
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function drawShape(ctx: CanvasRenderingContext2D, shape: Shape) {
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (shape.type === "rect") {
    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
  }

  if (shape.type === "circle") {
    ctx.beginPath();
    ctx.arc(shape.cx, shape.cy, shape.r, 0, Math.PI * 2);
    ctx.stroke();
  }
}
