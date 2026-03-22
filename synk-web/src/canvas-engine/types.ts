export type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
      id: string;
    }
  | {
      type: "oval";
      x: number;
      y: number;
      width: number;
      height: number;
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
      id: string;
    };

export type Camera = {
  x: number;
  y: number;
  zoom: number;
};
