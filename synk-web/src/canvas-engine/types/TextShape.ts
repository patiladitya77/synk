import { BaseShape } from "./BaseShape";

export interface TextShape extends BaseShape {
  type: "text";
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontFamily: string;
}
