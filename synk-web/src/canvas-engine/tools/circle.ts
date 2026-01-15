import { ToolHandler } from "./toolhandler";

export const CircleTool: ToolHandler = {
  onPointerDown(pos) {
    return {
      type: "circle",
      cx: pos.x,
      cy: pos.y,
      r: 40,
    };
  },

  getPreview(pos) {
    return {
      type: "circle",
      cx: pos.x,
      cy: pos.y,
      r: 40,
    };
  },
};
