import { ToolHandler } from "./toolhandler";

export const OvalTool: ToolHandler = {
  onPointerDown(pos) {
    return {
      type: "oval",
      id: "",
      x: pos.x - 40,
      y: pos.y - 40,
      width: 80,
      height: 80,
    };
  },

  getPreview(pos) {
    return {
      type: "oval",
      id: "preview",
      x: pos.x - 40,
      y: pos.y - 40,
      width: 80,
      height: 80,
    };
  },
};
