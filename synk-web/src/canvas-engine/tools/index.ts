import { OvalTool } from "./oval";
import { RectTool } from "./rect";
import { ToolHandler } from "./toolhandler";
export const ARROW_TOOL_ID = "arrow" as const;
export const TOOLS: Record<string, ToolHandler> = {
  rect: RectTool,
  oval: OvalTool,
};
