import { ShapeRenderer } from "../shapeRenderer";
import { TextShape } from "../types/TextShape";
import { drawBoundingBoxSelection } from "./selectionHelper";
import { LINE_HEIGHT_MULTIPLIER } from "../textUtils";

export const textRenderer: ShapeRenderer<TextShape> = {
  draw(ctx, shape) {
    if (!shape.text) return;

    ctx.fillStyle = shape.fill || "#0f172a";
    ctx.font = `${shape.fontSize}px ${shape.fontFamily}`;

    const lines = shape.text.split("\n");
    const lineHeight = shape.fontSize * LINE_HEIGHT_MULTIPLIER;

    lines.forEach((line, index) => {
      ctx.fillText(line, shape.x, shape.y + shape.fontSize + index * lineHeight);
    });
  },

  drawSelection(ctx, shape, zoom = 1) {
    drawBoundingBoxSelection(ctx, shape, zoom);
  },
};
