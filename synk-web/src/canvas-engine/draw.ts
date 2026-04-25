import { Shape } from "./types";

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
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

  if (shape.type === "oval") {
    const cx = shape.x + shape.width / 2;
    const cy = shape.y + shape.height / 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, shape.width / 2, shape.height / 2, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  camera: { x: number; y: number; zoom: number },
) {
  const { x, y, zoom } = camera;
  const gridSize = 50;

  const width = canvas.width / window.devicePixelRatio;
  const height = canvas.height / window.devicePixelRatio;

  const left = -x / zoom;
  const right = left + width / zoom;
  const top = -y / zoom;
  const bottom = top + height / zoom;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(zoom, zoom);

  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1 / zoom;

  for (
    let gx = Math.floor(left / gridSize) * gridSize;
    gx <= right;
    gx += gridSize
  ) {
    ctx.beginPath();
    ctx.moveTo(gx, top);
    ctx.lineTo(gx, bottom);
    ctx.stroke();
  }

  for (
    let gy = Math.floor(top / gridSize) * gridSize;
    gy <= bottom;
    gy += gridSize
  ) {
    ctx.beginPath();
    ctx.moveTo(left, gy);
    ctx.lineTo(right, gy);
    ctx.stroke();
  }

  ctx.restore();
}
