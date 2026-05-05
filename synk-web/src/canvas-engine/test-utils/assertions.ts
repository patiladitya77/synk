import { Shape } from "../types";

// Assert shape properties are preserved
export function assertShapePropertiesEqual(
  actual: Shape,
  expected: Shape,
  excludeKeys: string[] = [],
): void {
  const actualCopy = { ...actual } as any;
  const expectedCopy = { ...expected } as any;

  excludeKeys.forEach((key) => {
    delete actualCopy[key];
    delete expectedCopy[key];
  });

  expect(actualCopy).toEqual(expectedCopy);
}

// Assert port position is at correct edge midpoint
export function assertPortAtEdgeMidpoint(
  shape: Extract<Shape, { type: "rect" | "oval" }>,
  port: "n" | "s" | "e" | "w",
  position: { x: number; y: number },
): void {
  const cx = shape.x + shape.width / 2;
  const cy = shape.y + shape.height / 2;

  switch (port) {
    case "n":
      expect(position).toEqual({ x: cx, y: shape.y });
      break;
    case "s":
      expect(position).toEqual({ x: cx, y: shape.y + shape.height });
      break;
    case "e":
      expect(position).toEqual({ x: shape.x + shape.width, y: cy });
      break;
    case "w":
      expect(position).toEqual({ x: shape.x, y: cy });
      break;
  }
}

// Assert path is orthogonal (no diagonal segments)
export function assertPathIsOrthogonal(
  waypoints: { x: number; y: number }[],
): void {
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    // Allow for grid cell rounding (CELL = 20px, so tolerance of 1px is reasonable)
    const isHorizontal = Math.abs(a.y - b.y) < 1;
    const isVertical = Math.abs(a.x - b.x) < 1;
    expect(isHorizontal || isVertical).toBe(true);
  }
}

// Assert waypoints only include direction changes (smoothed path)
export function assertPathIsSmoothed(
  waypoints: { x: number; y: number }[],
): void {
  if (waypoints.length <= 2) return;

  for (let i = 1; i < waypoints.length - 1; i++) {
    const prev = waypoints[i - 1];
    const curr = waypoints[i];
    const next = waypoints[i + 1];

    const dirInX = curr.x - prev.x;
    const dirInY = curr.y - prev.y;
    const dirOutX = next.x - curr.x;
    const dirOutY = next.y - curr.y;

    // Current point should be a corner (direction change)
    expect(dirInX !== dirOutX || dirInY !== dirOutY).toBe(true);
  }
}
