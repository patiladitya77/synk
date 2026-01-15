export function drawGrid(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  camera: { x: number; y: number; zoom: number }
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
