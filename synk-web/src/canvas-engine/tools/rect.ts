import { Shape } from "../types";
import { ToolHandler } from "./toolhandler";

export const RectTool: ToolHandler = {
  onPointerDown(pos) {
    return {
      type: "rect",
      id: "", // Will be set by the server
      x: pos.x - 50,
      y: pos.y - 30,
      width: 100,
      height: 60,
    };
  },

  getPreview(pos) {
    return {
      type: "rect",
      id: "preview",
      x: pos.x - 50,
      y: pos.y - 30,
      width: 100,
      height: 60,
    };
  },
};
