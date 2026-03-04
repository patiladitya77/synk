import { ShapeRenderer } from "../shapeRenderer";
import { CircleShape } from "../types/CircleShape";

export const circleRenderer: ShapeRenderer<CircleShape> = {
  draw(ctx, shape) {
    ctx.beginPath();
    ctx.arc(shape.cx, shape.cy, shape.r, 0, Math.PI * 2);
    ctx.fillStyle = shape.fill || "#ffffff";
    ctx.fill();

    ctx.strokeStyle = shape.stroke || "#0f172a";
    ctx.lineWidth = shape.strokeWidth || 2;
    ctx.stroke();
  },

  drawSelection(ctx, shape) {
    ctx.beginPath();
    ctx.arc(shape.cx, shape.cy, shape.r, 0, Math.PI * 2);
    ctx.stroke();
  },
};
