import { RectTool } from "./rect";
import { CircleTool } from "./circle";
import { ToolHandler } from "./toolhandler";

export const TOOLS: Record<string, ToolHandler> = {
  rect: RectTool,
  circle: CircleTool,
};
