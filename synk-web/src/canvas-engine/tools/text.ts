import { ToolHandler } from "./toolhandler";

export const TextTool: ToolHandler = {
  onPointerDown({ x, y }) {
    return {
      type: "text",
      id: "", // Will be set by server
      x,
      y,
      width: 200,
      height: 40,
      text: "",
      fontSize: 16,
      fontFamily: "Arial",
    };
  },

  getPreview({ x, y }) {
    return {
      type: "text",
      id: "preview",
      x,
      y,
      width: 200,
      height: 40,
      text: "",
      fontSize: 16,
      fontFamily: "Arial",
    };
  },
};
