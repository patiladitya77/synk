import { ShapeRenderer } from "../shapeRenderer";
import { RectShape } from "../types/ReactangleShape";

export const rectRenderer: ShapeRenderer<RectShape> = {
  draw(ctx, shape) {
    ctx.fillStyle = shape.fill || "#ffffff";
    ctx.fillRect(shape.x, shape.y, shape.width, shape.height);

    ctx.strokeStyle = shape.stroke || "#0f172a";
    ctx.lineWidth = shape.strokeWidth || 2;
    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
  },

  drawSelection(ctx, shape, zoom) {
    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);

    const HANDLE_SIZE = 8 / zoom;
    const drawHandle = (hx: number, hy: number) => {
      ctx.fillRect(
        hx - HANDLE_SIZE / 2,
        hy - HANDLE_SIZE / 2,
        HANDLE_SIZE,
        HANDLE_SIZE,
      );
    };

    drawHandle(shape.x, shape.y);
    drawHandle(shape.x + shape.width, shape.y);
    drawHandle(shape.x, shape.y + shape.height);
    drawHandle(shape.x + shape.width, shape.y + shape.height);
  },
};
