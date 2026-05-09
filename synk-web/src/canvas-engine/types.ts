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
    }
  | {
      type: "arrow";
      id: string;
      x1: number; // start point X
      y1: number; // start point Y
      x2: number; // end point X
      y2: number; // end point Y
      fromShapeId?: string; // optional — anchored to a shape
      fromPort?: "n" | "s" | "e" | "w";
      toShapeId?: string;
      toPort?: "n" | "s" | "e" | "w";
      stroke?: string;
      strokeWidth?: number;
      // Computed at render time by the router — never persisted to the server
      waypoints?: { x: number; y: number }[];
    };

export type Camera = {
  x: number;
  y: number;
  zoom: number;
};
