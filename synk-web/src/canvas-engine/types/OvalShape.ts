import { BaseShape } from "./BaseShape";

export interface OvalShape extends BaseShape {
  type: "oval";
  x: number;
  y: number;
  width: number;
  height: number;
}
