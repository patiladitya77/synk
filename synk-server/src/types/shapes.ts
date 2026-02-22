export type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      id: number;
    }
  | {
      type: "circle";
      cx: number;
      cy: number;
      r: number;
      id: number;
    };
