import { drawArrow } from "../Arrow";
import { ShapeRenderer } from "../shapeRenderer";
import { ArrowShape } from "../types/ArrowShape";

export const arrowRenderer: ShapeRenderer<ArrowShape> = {
  draw(ctx, shape, allShapes) {
    if (shape.type !== "arrow") return;
    drawArrow(ctx, shape, allShapes ?? []);
  },
};
