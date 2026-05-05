import * as fc from "fast-check";
import { Shape } from "../types";

// Generate valid coordinates (positive, within canvas bounds)
export const arbCoordinate = fc.integer({ min: 0, max: 5000 });

// Generate valid dimensions (positive, reasonable size)
export const arbDimension = fc.integer({ min: 10, max: 500 });

// Generate shape IDs
export const arbShapeId = fc.uuid();

// Generate port directions
export const arbPort = fc.constantFrom("n", "s", "e", "w");

// Generate rectangle shapes
export const arbRectangle = fc.record({
  id: arbShapeId,
  type: fc.constant("rect" as const),
  x: arbCoordinate,
  y: arbCoordinate,
  width: arbDimension,
  height: arbDimension,
  fill: fc.option(fc.constantFrom("#FF0000", "#00FF00", "#0000FF", "#FFFF00"), {
    nil: undefined,
  }),
  stroke: fc.option(
    fc.constantFrom("#000000", "#FFFFFF", "#FF0000", "#0000FF"),
    {
      nil: undefined,
    },
  ),
  strokeWidth: fc.option(fc.integer({ min: 1, max: 10 }), { nil: undefined }),
});

// Generate oval shapes
export const arbOval = fc.record({
  id: arbShapeId,
  type: fc.constant("oval" as const),
  x: arbCoordinate,
  y: arbCoordinate,
  width: arbDimension,
  height: arbDimension,
  fill: fc.option(fc.constantFrom("#FF0000", "#00FF00", "#0000FF", "#FFFF00"), {
    nil: undefined,
  }),
  stroke: fc.option(
    fc.constantFrom("#000000", "#FFFFFF", "#FF0000", "#0000FF"),
    {
      nil: undefined,
    },
  ),
  strokeWidth: fc.option(fc.integer({ min: 1, max: 10 }), { nil: undefined }),
});

// Generate arrow shapes
export const arbArrow = fc.record({
  id: arbShapeId,
  type: fc.constant("arrow" as const),
  x1: arbCoordinate,
  y1: arbCoordinate,
  x2: arbCoordinate,
  y2: arbCoordinate,
  fromShapeId: fc.option(arbShapeId, { nil: undefined }),
  toShapeId: fc.option(arbShapeId, { nil: undefined }),
  fromPort: fc.option(arbPort, { nil: undefined }),
  toPort: fc.option(arbPort, { nil: undefined }),
  waypoints: fc.option(
    fc.array(fc.record({ x: arbCoordinate, y: arbCoordinate })),
    { nil: undefined },
  ),
});

// Generate any shape
export const arbShape: fc.Arbitrary<Shape> = fc.oneof(
  arbRectangle,
  arbOval,
  arbArrow,
);

// Generate arrays of shapes (for testing routing with obstacles)
export const arbShapeArray = fc.array(arbShape, {
  minLength: 0,
  maxLength: 20,
});
