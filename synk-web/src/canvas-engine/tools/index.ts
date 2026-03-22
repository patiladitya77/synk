import { OvalTool } from "./oval";
import { RectTool } from "./rect";
import { ToolHandler } from "./toolhandler";

export const TOOLS: Record<string, ToolHandler> = {
  rect: RectTool,
  oval: OvalTool,
};
