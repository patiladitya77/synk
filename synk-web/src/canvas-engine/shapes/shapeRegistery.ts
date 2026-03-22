import { ShapeRenderer } from "../shapeRenderer";
import { ovalRenderer } from "./OvalRenderer";
import { rectRenderer } from "./rectangleRenderer";

export const shapeRegistry: Record<string, ShapeRenderer> = {
  rect: rectRenderer,
  oval: ovalRenderer,
};
