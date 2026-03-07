export type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      id: string;
    }
  | {
      type: "circle";
      cx: number;
      cy: number;
      r: number;
      id: string;
    };

export type Camera = {
  x: number;
  y: number;
  zoom: number;
};
