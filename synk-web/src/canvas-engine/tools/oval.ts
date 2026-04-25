import { ToolHandler } from "./toolhandler";

export const OvalTool: ToolHandler = {
  onPointerDown({ x, y }) {
    return {
      type: "oval",
      id: "",
      x: x - 40,
      y: y - 40,
      width: 80,
      height: 80,
    };
  },

  getPreview({ x, y }) {
    return {
      type: "oval",
      id: "preview",
      x: x - 40,
      y: y - 40,
      width: 80,
      height: 80,
    };
  },
};
