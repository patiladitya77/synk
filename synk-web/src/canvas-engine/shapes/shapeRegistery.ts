import { ShapeRenderer } from "../shapeRenderer";
import { arrowRenderer } from "./ArrowRenderer";
import { ovalRenderer } from "./OvalRenderer";
import { rectRenderer } from "./rectangleRenderer";

export const shapeRegistry: Record<string, ShapeRenderer> = {
  rect: rectRenderer,
  oval: ovalRenderer,
  arrow: arrowRenderer,
};
