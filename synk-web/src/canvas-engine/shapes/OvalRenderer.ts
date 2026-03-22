import { ShapeRenderer } from "../shapeRenderer";
import { OvalShape } from "../types/OvalShape";

export const ovalRenderer: ShapeRenderer<OvalShape> = {
  draw(ctx, shape) {
    const cx = shape.x + shape.width / 2;
    const cy = shape.y + shape.height / 2;
    const rx = shape.width / 2;
    const ry = shape.height / 2;

    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
    ctx.fillStyle = shape.fill || "#ffffff";
    ctx.fill();
    ctx.strokeStyle = shape.stroke || "#0f172a";
    ctx.lineWidth = shape.strokeWidth || 2;
    ctx.stroke();
  },

  drawSelection(ctx, shape) {
    const cx = shape.x + shape.width / 2;
    const cy = shape.y + shape.height / 2;
    const rx = shape.width / 2;
    const ry = shape.height / 2;

    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
    ctx.stroke();
  },
};
