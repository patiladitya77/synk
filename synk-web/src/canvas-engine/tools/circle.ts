import { ToolHandler } from "./toolhandler";

export const CircleTool: ToolHandler = {
  onPointerDown(pos) {
    return {
      type: "circle",
      id: "", // Will be set by the server
      cx: pos.x,
      cy: pos.y,
      r: 40,
    };
  },

  getPreview(pos) {
    return {
      type: "circle",
      id: "preview",
      cx: pos.x,
      cy: pos.y,
      r: 40,
    };
  },
};
