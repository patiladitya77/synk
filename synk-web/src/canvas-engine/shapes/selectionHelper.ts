/**
 * Draws the dashed bounding box and 8 square resize handles for bounded shapes (rect, oval, diamond).
 */
export function drawBoundingBoxSelection(
  ctx: CanvasRenderingContext2D,
  shape: { x: number; y: number; width: number; height: number },
  zoom: number,
): void {
  const HANDLE_SIZE = 8 / zoom;

  const bx = shape.x;
  const by = shape.y;
  const bw = shape.width;
  const bh = shape.height;

  // Dashed selection boundary
  ctx.save();
  ctx.strokeStyle = "#60a5fa";
  ctx.lineWidth = 1 / zoom;
  ctx.setLineDash([6 / zoom, 3 / zoom]);
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
    ctx.lineWidth = 1.5 / zoom;
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
