import { ShapeRenderer } from "../shapeRenderer";
import { circleRenderer } from "./CircleRenderer";
import { rectRenderer } from "./rectangleRenderer";

export const shapeRegistry: Record<string, ShapeRenderer> = {
  rect: rectRenderer,
  circle: circleRenderer,
};
