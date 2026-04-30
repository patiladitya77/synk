# Design Document: Canvas Engine Testing

## Overview

This design document specifies a comprehensive test suite for the canvas engine's core functionality. The canvas engine is a collaborative drawing application built with Next.js, React, and Socket.IO that supports shape creation (rectangles, ovals, arrows), intelligent arrow routing with A\* pathfinding, and undo/redo operations through the command pattern.

The test suite will validate:

- **Shape Creation**: Correct instantiation of rectangles, ovals, and arrows with proper property preservation
- **Arrow Port Snapping**: Connection logic that snaps arrow endpoints to shape edge midpoints within a configurable radius
- **Arrow Routing**: A\* pathfinding algorithm that routes arrows around obstacles using orthogonal paths
- **Command Pattern Operations**: Execution and reversal of AddShapeCommand, DeleteShapeCommand, MoveShapeCommand, and ResizeShapeCommand
- **Command History Management**: Undo/redo stack management with proper pointer tracking and history clearing

The testing approach combines traditional unit tests for specific examples and edge cases with property-based testing for universal correctness guarantees. Property-based tests will use fast-check to generate randomized inputs and verify that invariants hold across all valid scenarios.

## Architecture

### Test Organization Structure

```
synk-web/src/canvas-engine/
├── commands/
│   ├── __tests__/
│   │   ├── AddShapeCommand.test.ts
│   │   ├── DeleteShapeCommand.test.ts
│   │   ├── MoveShapeCommand.test.ts
│   │   ├── ResizeShapeCommand.test.ts
│   │   └── CommandManager.test.ts
├── __tests__/
│   ├── Router.test.ts
│   ├── Arrow.test.ts
│   ├── grid.test.ts
│   └── Astar.test.ts
└── test-utils/
    ├── generators.ts       # fast-check arbitraries for shapes
    ├── mocks.ts           # Socket.IO mock utilities
    └── assertions.ts      # Custom test assertions
```

### Testing Framework Stack

- **Test Runner**: Jest (already configured via next/jest)
- **Assertion Library**: @testing-library/jest-dom (already installed)
- **Property-Based Testing**: fast-check (already installed)
- **Mocking**: Jest's built-in mocking capabilities
- **Test Environment**: jsdom (configured in jest.config.js)

### Key Design Decisions

1. **Separate test directories**: Commands tests live in `commands/__tests__/` while routing/pathfinding tests live in the root `__tests__/` directory to mirror the source structure

2. **Shared test utilities**: Centralized generators, mocks, and assertions in `test-utils/` to promote reusability and consistency

3. **Property-based testing for algorithms**: A\* pathfinding, port snapping, and routing logic are validated with property-based tests to ensure correctness across infinite input spaces

4. **Mock socket strategy**: Socket.IO client is mocked to verify event emissions without requiring a real server connection

5. **Snapshot-based command testing**: Commands capture before/after state snapshots to enable precise undo/redo validation

## Components and Interfaces

### Test Utilities Module

#### generators.ts

Provides fast-check arbitraries for generating random valid shapes:

```typescript
import * as fc from "fast-check";
import { Shape, RectangleShape, OvalShape, ArrowShape } from "../types";

// Generate valid coordinates (positive, within canvas bounds)
export const arbCoordinate = fc.integer({ min: 0, max: 5000 });

// Generate valid dimensions (positive, reasonable size)
export const arbDimension = fc.integer({ min: 10, max: 500 });

// Generate shape IDs
export const arbShapeId = fc.uuid();

// Generate port directions
export const arbPort = fc.constantFrom("n", "s", "e", "w");

// Generate rectangle shapes
export const arbRectangle: fc.Arbitrary<RectangleShape> = fc.record({
  id: arbShapeId,
  type: fc.constant("rect" as const),
  x: arbCoordinate,
  y: arbCoordinate,
  width: arbDimension,
  height: arbDimension,
  fill: fc.option(fc.hexaString({ minLength: 6, maxLength: 6 }), {
    nil: undefined,
  }),
  stroke: fc.option(fc.hexaString({ minLength: 6, maxLength: 6 }), {
    nil: undefined,
  }),
  strokeWidth: fc.option(fc.integer({ min: 1, max: 10 }), { nil: undefined }),
});

// Generate oval shapes
export const arbOval: fc.Arbitrary<OvalShape> = fc.record({
  id: arbShapeId,
  type: fc.constant("oval" as const),
  x: arbCoordinate,
  y: arbCoordinate,
  width: arbDimension,
  height: arbDimension,
  fill: fc.option(fc.hexaString({ minLength: 6, maxLength: 6 }), {
    nil: undefined,
  }),
  stroke: fc.option(fc.hexaString({ minLength: 6, maxLength: 6 }), {
    nil: undefined,
  }),
  strokeWidth: fc.option(fc.integer({ min: 1, max: 10 }), { nil: undefined }),
});

// Generate arrow shapes
export const arbArrow: fc.Arbitrary<ArrowShape> = fc.record({
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
```

#### mocks.ts

Provides Socket.IO mock utilities:

```typescript
import { Socket } from "socket.io-client";

export interface MockSocket {
  emit: jest.Mock;
  on: jest.Mock;
  once: jest.Mock;
  off: jest.Mock;
}

export function createMockSocket(): MockSocket {
  return {
    emit: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    off: jest.fn(),
  };
}

export function createMockShapesRef<T>(
  initialShapes: T[],
): React.RefObject<T[]> {
  return {
    current: [...initialShapes],
  };
}

// Helper to verify socket event emissions
export function expectSocketEmit(
  socket: MockSocket,
  eventName: string,
  payload?: any,
): void {
  expect(socket.emit).toHaveBeenCalledWith(
    eventName,
    payload ? expect.objectContaining(payload) : expect.anything(),
  );
}
```

#### assertions.ts

Custom assertions for shape and command testing:

```typescript
import { Shape, RectangleShape, OvalShape, ArrowShape } from "../types";

// Assert shape properties are preserved
export function assertShapePropertiesEqual(
  actual: Shape,
  expected: Shape,
  excludeKeys: string[] = [],
): void {
  const actualCopy = { ...actual };
  const expectedCopy = { ...expected };

  excludeKeys.forEach((key) => {
    delete actualCopy[key];
    delete expectedCopy[key];
  });

  expect(actualCopy).toEqual(expectedCopy);
}

// Assert port position is at correct edge midpoint
export function assertPortAtEdgeMidpoint(
  shape: RectangleShape | OvalShape,
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
    const isHorizontal = a.y === b.y;
    const isVertical = a.x === b.x;
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
```

### Command Test Structure

Each command test file follows this pattern:

1. **Setup**: Create mock socket, shapes ref, and test data
2. **Execution Tests**: Verify execute() updates state and emits socket events
3. **Undo Tests**: Verify undo() reverses state and emits socket events
4. **Property Tests**: Verify invariants hold across random inputs

Example structure for AddShapeCommand.test.ts:

```typescript
describe("AddShapeCommand", () => {
  let mockSocket: MockSocket;
  let shapesRef: React.RefObject<Shape[]>;
  let boardId: string;
  let userId: string;

  beforeEach(() => {
    mockSocket = createMockSocket();
    shapesRef = createMockShapesRef([]);
    boardId = "test-board-id";
    userId = "test-user-id";
  });

  describe("execute", () => {
    // Unit tests for specific examples
  });

  describe("undo", () => {
    // Unit tests for specific examples
  });

  describe("properties", () => {
    // Property-based tests
  });
});
```

### Router and Pathfinding Test Structure

Router tests validate:

- Port position calculation
- Port snapping logic
- Arrow routing with A\* pathfinding
- Waypoint smoothing

Grid and A\* tests validate:

- Grid construction from shapes
- Cell blocking logic
- A\* pathfinding correctness
- Orthogonal path constraints

## Data Models

### Test Data Generation Strategy

Property-based tests require generators that produce valid, diverse inputs. The generators follow these constraints:

1. **Coordinates**: Non-negative integers within canvas bounds (0-5000)
2. **Dimensions**: Positive integers representing reasonable shape sizes (10-500)
3. **Shape IDs**: UUIDs to ensure uniqueness
4. **Ports**: One of 'n', 's', 'e', 'w'
5. **Optional Properties**: Generated with fc.option to test both presence and absence

### Shape Invariants

All shapes must satisfy these invariants:

- `id` is a non-empty string
- `type` is one of 'rect', 'oval', 'arrow'
- Rectangles and ovals have `x, y, width, height` where width > 0 and height > 0
- Arrows have `x1, y1, x2, y2` coordinates
- If an arrow has `fromShapeId`, it must also have `fromPort`
- If an arrow has `toShapeId`, it must also have `toPort`

### Command State Snapshots

Commands capture state snapshots for undo/redo:

- **AddShapeCommand**: Stores the shape to be added
- **DeleteShapeCommand**: Stores the deleted shape and connected arrow waypoints
- **MoveShapeCommand**: Stores old and new shape positions
- **ResizeShapeCommand**: Stores old and new shape dimensions

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Shape Creation Preserves Properties

_For any_ valid shape creation inputs (coordinates, dimensions, styling), creating a shape should produce an object with all input properties preserved exactly, a unique non-empty ID, and the correct type field.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3**

### Property 2: Unanchored Arrows Have No Shape References

_For any_ arrow created without anchoring to shapes, the fromShapeId, toShapeId, fromPort, and toPort fields should all be undefined.

**Validates: Requirements 3.4**

### Property 3: Port Positions Are Edge Midpoints

_For any_ rectangle or oval shape and any port direction (n, s, e, w), the calculated port position should be at the exact midpoint of the corresponding edge: north at (x + width/2, y), south at (x + width/2, y + height), east at (x + width, y + height/2), west at (x, y + height/2).

**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

### Property 4: Port Snapping Within Radius

_For any_ point within snap radius of a shape port, the findNearestPort function should return that port's information including the correct shapeId and port direction.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 5: No Snapping Outside Radius

_For any_ point outside snap radius of all shape ports, the findNearestPort function should return null, leaving the arrow unanchored.

**Validates: Requirements 4.4**

### Property 6: Nearest Port Selection

_For any_ point with multiple ports within snap radius, the findNearestPort function should return the port with the minimum Euclidean distance to the point.

**Validates: Requirements 4.5**

### Property 7: Obstacle-Free Routing Is Direct

_For any_ two points with no obstacles between them, the routeArrow function should return a path with exactly 2 waypoints (start and end), forming a straight line.

**Validates: Requirements 6.1**

### Property 8: Routed Paths Avoid Obstacles

_For any_ arrow routing scenario with obstacles, no waypoint in the returned path should fall within a blocked grid cell.

**Validates: Requirements 6.2**

### Property 9: Routed Paths Are Orthogonal

_For any_ routed arrow path, all consecutive waypoint pairs should be either horizontally aligned (same y coordinate) or vertically aligned (same x coordinate), with no diagonal segments.

**Validates: Requirements 6.3**

### Property 10: Anchored Arrows Start and End at Ports

_For any_ arrow anchored to shape ports, the first waypoint should exactly match the fromPort position and the last waypoint should exactly match the toPort position.

**Validates: Requirements 6.4**

### Property 11: Fallback Path When No Route Exists

_For any_ routing scenario where A\* returns null (no valid path), the routeArrow function should return a fallback array containing exactly [start, end].

**Validates: Requirements 6.5**

### Property 12: Waypoints Represent Direction Changes

_For any_ routed arrow path with more than 2 waypoints, each interior waypoint should represent a direction change (corner) where the incoming direction differs from the outgoing direction.

**Validates: Requirements 6.6**

### Property 13: AddShapeCommand Execution Adds Shape

_For any_ shape, executing an AddShapeCommand should result in the shape being present in the shapes array and a "drawShape" socket event being emitted with the correct payload.

**Validates: Requirements 7.1, 7.2**

### Property 14: AddShapeCommand Undo Removes Shape

_For any_ executed AddShapeCommand, calling undo should remove the shape from the shapes array and emit a "deleteShape" socket event with the correct shape ID.

**Validates: Requirements 8.1, 8.2, 8.3**

### Property 15: DeleteShapeCommand Execution Removes Shape

_For any_ shape, executing a DeleteShapeCommand should remove only that shape from the shapes array and emit a "deleteShape" socket event.

**Validates: Requirements 9.1, 9.2, 9.4**

### Property 16: DeleteShapeCommand Captures Arrow Waypoints

_For any_ shape with connected arrows, executing a DeleteShapeCommand should capture and store the waypoints of all connected arrows for later restoration.

**Validates: Requirements 9.3**

### Property 17: DeleteShapeCommand Undo Restores Shape

_For any_ shape, executing DeleteShapeCommand followed by undo should restore the shape to the shapes array with the exact same ID and all properties unchanged, and emit a "restoreShape" socket event.

**Validates: Requirements 10.1, 10.2, 10.3, 10.5**

### Property 18: DeleteShapeCommand Undo Restores Arrow Waypoints

_For any_ shape with connected arrows, executing DeleteShapeCommand followed by undo should restore the waypoints of all connected arrows to their original values.

**Validates: Requirements 10.4**

### Property 19: MoveShapeCommand Execution Updates Position

_For any_ shape and new position, executing a MoveShapeCommand should update the shape's x and y coordinates to the new values while leaving all other properties (width, height, type, id, styling) unchanged, and emit an "updateShape" socket event.

**Validates: Requirements 11.1, 11.2, 11.3, 11.4**

### Property 20: MoveShapeCommand Round-Trip

_For any_ shape and position change, executing MoveShapeCommand followed by undo should restore the shape to its exact original position with all properties unchanged.

**Validates: Requirements 12.1, 12.2, 12.4**

### Property 21: ResizeShapeCommand Execution Updates Dimensions

_For any_ shape and new dimensions, executing a ResizeShapeCommand should update the shape's width and height to the new values while leaving the position (x, y) and all other properties unchanged, and emit an "updateShape" socket event.

**Validates: Requirements 13.1, 13.2, 13.3, 13.4**

### Property 22: ResizeShapeCommand Round-Trip

_For any_ shape and dimension change, executing ResizeShapeCommand followed by undo should restore the shape to its exact original dimensions with all properties unchanged.

**Validates: Requirements 14.1, 14.2, 14.4**

### Property 23: CommandManager Undo Invokes Command Undo

_For any_ executed command, calling CommandManager.undo() should invoke that command's undo method and decrement the history pointer.

**Validates: Requirements 15.1, 15.4**

### Property 24: CommandManager Undo Order Is LIFO

_For any_ sequence of executed commands, calling undo multiple times should invoke the commands' undo methods in reverse order (last executed is first undone).

**Validates: Requirements 15.3**

### Property 25: CommandManager Redo Invokes Command Execute

_For any_ undone command, calling CommandManager.redo() should invoke that command's execute method and increment the history pointer.

**Validates: Requirements 16.1, 16.4**

### Property 26: CommandManager Redo Order Is FIFO

_For any_ sequence of undone commands, calling redo multiple times should invoke the commands' execute methods in forward order (first undone is first redone).

**Validates: Requirements 16.3**

### Property 27: New Command Clears Redo History

_For any_ command sequence with undo operations, executing a new command should truncate the history at the current pointer, clearing all redo-able commands.

**Validates: Requirements 17.1**

### Property 28: Commands Are Added to History in Order

_For any_ sequence of command executions, the CommandManager history array should contain the commands in the exact order they were executed.

**Validates: Requirements 17.2**

### Property 29: History Pointer Remains in Valid Range

_For any_ sequence of execute, undo, and redo operations, the CommandManager history pointer should always be in the range [-1, history.length - 1].

**Validates: Requirements 17.5**

### Property 30: Command Execute-Undo-Redo Round-Trip

_For any_ command, executing it, then calling undo, then calling redo should result in the same final state as just executing it once.

**Validates: Requirements 18.1**

### Property 31: Full Undo Sequence Restores Original State

_For any_ sequence of commands starting from an initial state, executing all commands then undoing all commands should restore the exact original state.

**Validates: Requirements 18.2**

### Property 32: Arrow References Valid Shapes

_For any_ arrow with a fromShapeId or toShapeId, the referenced shape ID should exist in the shapes array.

**Validates: Requirements 19.1**

### Property 33: Arrow Endpoints Follow Connected Shapes

_For any_ arrow connected to a shape, when the shape is moved, the arrow's endpoint should update to follow the new port position on the moved shape.

**Validates: Requirements 19.3**

### Property 34: Invalid Shape References Fall Back to Coordinates

_For any_ arrow with a fromShapeId or toShapeId that doesn't exist in the shapes array, the resolveEndpoint function should fall back to using the arrow's x1, y1, x2, y2 coordinates.

**Validates: Requirements 19.4**

### Property 35: Shape ID Invariant

_For any_ shape operation (move, resize, delete-undo), the shape's ID should remain unchanged.

**Validates: Requirements 20.1**

### Property 36: Shape Type Invariant

_For any_ shape operation (move, resize, delete-undo), the shape's type should remain unchanged.

**Validates: Requirements 20.2**

## Error Handling

### Test Failure Reporting

All tests should provide clear, actionable error messages:

1. **Property test failures**: fast-check will automatically provide the failing input that violated the property. Tests should include descriptive labels using fc.pre() for preconditions and meaningful property names.

2. **Assertion failures**: Custom assertions in assertions.ts should include context about what was expected vs. actual, including shape IDs and relevant property values.

3. **Socket mock verification failures**: When socket events don't match expectations, error messages should include the expected event name, actual calls made, and the payload differences.

### Edge Cases and Boundary Conditions

The test suite explicitly handles these edge cases:

1. **Empty history**: Undo/redo operations on CommandManager with no history should be no-ops
2. **Degenerate arrows**: Arrows with start === end (zero length) should handle gracefully
3. **Grid boundary conditions**: Routing near grid edges should clamp cells to valid ranges
4. **No valid path**: A\* returning null should trigger fallback straight-line routing
5. **Snap radius boundary**: Points exactly at snap radius distance should be tested
6. **Zero-dimension shapes**: Shapes with width or height of 0 should be handled (though generators avoid this)
7. **Negative coordinates**: While generators produce positive coordinates, tests should verify behavior with negative values
8. **Very large shapes**: Shapes that exceed grid bounds should be handled correctly

### Socket Event Failure Handling

Tests mock socket events but don't test actual network failures. The test suite assumes:

- Socket.emit() always succeeds synchronously
- Socket events are delivered in order
- No network latency or disconnections

Real-world socket failures are outside the scope of unit tests and should be covered by integration tests.

## Testing Strategy

### Dual Testing Approach

The test suite uses both unit tests and property-based tests:

**Unit Tests** focus on:

- Specific examples that demonstrate correct behavior (e.g., creating a rectangle with specific coordinates)
- Edge cases (empty history, degenerate arrows, boundary conditions)
- Integration points between components (command execution triggering socket events)
- Error conditions (invalid inputs, missing references)

**Property-Based Tests** focus on:

- Universal properties that hold for all inputs (e.g., port positions are always edge midpoints)
- Comprehensive input coverage through randomization (testing thousands of shape combinations)
- Invariants that must be preserved (e.g., shape IDs never change)
- Round-trip properties (execute-undo, serialize-deserialize patterns)

Together, unit tests catch concrete bugs in specific scenarios while property tests verify general correctness across the entire input space.

### Property-Based Testing Configuration

**Library**: fast-check (version 4.7.0, already installed)

**Test Configuration**:

- Minimum 100 iterations per property test (configured via fc.assert with numRuns: 100)
- Each property test references its design document property via comment tag
- Tag format: `// Feature: canvas-engine-testing, Property {number}: {property_text}`

**Example Property Test Structure**:

```typescript
describe("Property 3: Port Positions Are Edge Midpoints", () => {
  // Feature: canvas-engine-testing, Property 3: Port positions are edge midpoints
  it("should calculate port positions at exact edge midpoints for all shapes", () => {
    fc.assert(
      fc.property(arbRectangle, arbPort, (shape, port) => {
        const position = getPortPosition(shape, port);
        assertPortAtEdgeMidpoint(shape, port, position);
      }),
      { numRuns: 100 },
    );
  });
});
```

### Test File Organization

Each command gets its own test file in `commands/__tests__/`:

- `AddShapeCommand.test.ts`: Tests for shape addition and undo
- `DeleteShapeCommand.test.ts`: Tests for shape deletion, waypoint capture, and restoration
- `MoveShapeCommand.test.ts`: Tests for position updates and undo
- `ResizeShapeCommand.test.ts`: Tests for dimension updates and undo
- `CommandManager.test.ts`: Tests for history management, undo/redo, and pointer tracking

Routing and pathfinding tests live in the root `__tests__/` directory:

- `Router.test.ts`: Tests for port snapping, endpoint resolution, and arrow routing
- `Arrow.test.ts`: Tests for arrow rendering and hit detection
- `grid.test.ts`: Tests for grid construction and cell blocking
- `Astar.test.ts`: Tests for A\* pathfinding algorithm

### Mock Strategy

**Socket.IO Mocking**:

- Use Jest mocks for socket.emit(), socket.on(), socket.once()
- Verify event names and payloads using expectSocketEmit helper
- Don't test actual network communication (that's integration testing)

**Shapes Ref Mocking**:

- Use createMockShapesRef to create a mutable ref with initial shapes
- Tests can directly inspect and modify ref.current to verify state changes
- This simulates React's useRef behavior without requiring React components

**Command Mocking**:

- Commands are tested directly, not mocked
- Mock only their dependencies (socket, shapesRef)
- This ensures we test the actual command implementation

### Test Data Generation

**Generators** (in test-utils/generators.ts):

- Use fast-check arbitraries to generate random valid shapes
- Constrain coordinates to 0-5000 (reasonable canvas bounds)
- Constrain dimensions to 10-500 (reasonable shape sizes)
- Generate optional properties with fc.option
- Provide composed generators (arbShape, arbShapeArray) for complex scenarios

**Deterministic Tests**:

- Unit tests use hardcoded values for reproducibility
- Property tests use fast-check's built-in seeding for reproducible failures
- When a property test fails, fast-check provides the seed to reproduce the exact failure

### Coverage Goals

The test suite aims for:

- 100% line coverage of command classes (execute and undo methods)
- 100% line coverage of Router.ts (port snapping and routing logic)
- 100% line coverage of Astar.ts (pathfinding algorithm)
- 100% line coverage of grid.ts (grid construction and queries)
- High branch coverage for edge cases (empty history, no path, boundary conditions)

Coverage is measured with Jest's built-in coverage reporter (--coverage flag).

### Test Execution

**Running Tests**:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test Router.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="Property"
```

**CI Integration**:
Tests should run on every commit and pull request. The CI pipeline should:

1. Install dependencies
2. Run `npm test -- --coverage`
3. Fail the build if any test fails
4. Report coverage metrics
5. Fail if coverage drops below thresholds (e.g., 90% line coverage)

### Performance Considerations

**Property Test Performance**:

- 100 iterations per property test is a balance between coverage and speed
- Total test suite should complete in under 30 seconds
- If tests are slow, reduce numRuns or optimize generators
- Use fc.pre() to filter invalid inputs early rather than generating and rejecting

**Grid and A\* Performance**:

- Grid construction is O(shapes \* cells), typically fast for <100 shapes
- A* is O(cells * log(cells)), fast for grids <10,000 cells
- Tests use small shape counts (0-20) to keep tests fast
- Real-world performance testing is outside scope of unit tests

### Maintenance and Evolution

**Adding New Shape Types**:

1. Add generator in generators.ts
2. Add shape creation tests
3. Add command tests for new shape type
4. Update property tests to include new shape type

**Adding New Commands**:

1. Create test file in commands/**tests**/
2. Add unit tests for execute and undo
3. Add property tests for round-trip behavior
4. Update CommandManager tests if needed

**Updating Routing Logic**:

1. Update Router.test.ts with new behavior
2. Ensure property tests still pass (or update properties)
3. Add regression tests for bugs found in production
4. Update grid or A\* tests if algorithm changes

The test suite is designed to be maintainable and extensible as the canvas engine evolves.
