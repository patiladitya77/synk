import { ToolHandler } from "./toolhandler";

export const DiamondTool: ToolHandler = {
  onPointerDown({ x, y }) {
    return {
      type: "diamond",
      id: "",
      x: x - 50,
      y: y - 50,
      width: 100,
      height: 100,
    };
  },

  getPreview({ x, y }) {
    return {
      type: "diamond",
      id: "preview",
      x: x - 50,
      y: y - 50,
      width: 100,
      height: 100,
    };
  },
};
