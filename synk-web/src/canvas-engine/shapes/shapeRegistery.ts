import { ShapeRenderer } from "../shapeRenderer";
import { arrowRenderer } from "./ArrowRenderer";
import { diamondRenderer } from "./DiamondRenderer";
import { ovalRenderer } from "./OvalRenderer";
import { rectRenderer } from "./rectangleRenderer";
import { textRenderer } from "./TextRenderer";

export const shapeRegistry: Record<string, ShapeRenderer> = {
  rect: rectRenderer,
  oval: ovalRenderer,
  diamond: diamondRenderer,
  arrow: arrowRenderer,
  text: textRenderer,
};

