export type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      cx: number;
      cy: number;
      r: number;
    };

export type Camera = {
  x: number;
  y: number;
  zoom: number;
};
