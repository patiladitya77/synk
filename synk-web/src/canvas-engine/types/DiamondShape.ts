import { BaseShape } from "./BaseShape";

export interface DiamondShape extends BaseShape {
  type: "diamond";
  x: number;
  y: number;
  width: number;
  height: number;
}
