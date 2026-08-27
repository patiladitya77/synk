import { ShapeRenderer } from "../shapeRenderer";
import { DiamondShape } from "../types/DiamondShape";
import { drawBoundingBoxSelection } from "./selectionHelper";

export const diamondRenderer: ShapeRenderer<DiamondShape> = {
  draw(ctx, shape) {
    const cx = shape.x + shape.width / 2;
    const cy = shape.y + shape.height / 2;

    ctx.beginPath();
    ctx.moveTo(cx, shape.y); // top
    ctx.lineTo(shape.x + shape.width, cy); // right
    ctx.lineTo(cx, shape.y + shape.height); // bottom
    ctx.lineTo(shape.x, cy); // left
    ctx.closePath();

    ctx.fillStyle = shape.fill || "#ffffff";
    ctx.fill();
    ctx.strokeStyle = shape.stroke || "#0f172a";
    ctx.lineWidth = shape.strokeWidth || 2;
    ctx.stroke();
  },

  drawSelection(ctx, shape, zoom = 1) {
    drawBoundingBoxSelection(ctx, shape, zoom);
  },
};
