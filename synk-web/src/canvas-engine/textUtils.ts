export const LINE_HEIGHT_MULTIPLIER = 1.2;
export const TEXT_PADDING_X = 10;
export const TEXT_PADDING_Y = 10;

let measurementCtx: CanvasRenderingContext2D | null = null;

/**
 * Calculates auto-sized width and height for a text shape using Canvas measureText().
 */
export function calculateTextDimensions(
  text: string,
  fontSize: number,
  fontFamily: string,
  minWidth = 20,
  minHeight = 40,
): { width: number; height: number } {
  if (typeof window === "undefined") {
    return { width: minWidth, height: minHeight };
  }

  if (!measurementCtx) {
    const canvas = document.createElement("canvas");
    measurementCtx = canvas.getContext("2d");
  }

  if (!measurementCtx) {
    return { width: minWidth, height: minHeight };
  }

  measurementCtx.font = `${fontSize}px ${fontFamily}`;
  const lines = text.split("\n");
  let maxLineWidth = 0;
  for (const line of lines) {
    const width = measurementCtx.measureText(line).width;
    if (width > maxLineWidth) {
      maxLineWidth = width;
    }
  }

  const lineHeight = fontSize * LINE_HEIGHT_MULTIPLIER;
  const width = Math.max(minWidth, Math.ceil(maxLineWidth + TEXT_PADDING_X));
  const height = Math.max(
    minHeight,
    Math.ceil(lines.length * lineHeight + TEXT_PADDING_Y),
  );

  return { width, height };
}
