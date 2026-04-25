import { Shape } from "../types";
import { ToolHandler } from "./toolhandler";

export const RectTool: ToolHandler = {
  onPointerDown({ x, y }) {
    return {
      type: "rect",
      id: "", // Will be set by the server
      x: x - 50,
      y: y - 30,
      width: 100,
      height: 60,
    };
  },

  getPreview({ x, y }) {
    return {
      type: "rect",
      id: "preview",
      x: x - 50,
      y: y - 30,
      width: 100,
      height: 60,
    };
  },
};
