import { ShapeRenderer } from "../shapeRenderer";
import { RectShape } from "../types/ReactangleShape";
import { drawBoundingBoxSelection } from "./selectionHelper";

export const rectRenderer: ShapeRenderer<RectShape> = {
  draw(ctx, shape) {
    ctx.fillStyle = shape.fill || "#ffffff";
    ctx.fillRect(shape.x, shape.y, shape.width, shape.height);

    ctx.strokeStyle = shape.stroke || "#0f172a";
    ctx.lineWidth = shape.strokeWidth || 2;
    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
  },

  drawSelection(ctx, shape, zoom = 1) {
    drawBoundingBoxSelection(ctx, shape, zoom);
  },
};
