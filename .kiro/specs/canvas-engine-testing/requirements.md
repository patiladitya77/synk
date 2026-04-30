# Requirements Document

## Introduction

This document defines the requirements for comprehensive test coverage of the canvas engine features. The canvas engine is a collaborative drawing application that supports shape creation (rectangles, ovals, arrows), arrow routing with A\* pathfinding, and undo/redo functionality through a command pattern. The test suite will ensure correctness of shape operations, arrow connection logic, and command history management.

## Glossary

- **Canvas_Engine**: The drawing system that manages shapes, rendering, and user interactions
- **Shape**: A drawable object on the canvas (rectangle, oval, or arrow)
- **Rectangle_Shape**: A rectangular shape with x, y, width, and height properties
- **Oval_Shape**: An elliptical shape with x, y, width, and height properties
- **Arrow_Shape**: A connecting line between two points or shapes with optional anchoring
- **Command_Manager**: The system that manages undo/redo operations using the command pattern
- **Shape_Command**: An executable and reversible operation on shapes (Add, Delete, Move, Resize)
- **Port**: A connection point on a shape's edge (north, south, east, west)
- **Router**: The system that computes arrow waypoints using A\* pathfinding
- **Waypoint**: A point along an arrow's path used for rendering
- **Grid**: The spatial data structure used by A\* for pathfinding around obstacles

## Requirements

### Requirement 1: Test Rectangle Shape Creation

**User Story:** As a developer, I want to test rectangle creation, so that I can verify rectangles are created with correct properties

#### Acceptance Criteria

1. WHEN a rectangle is created with valid coordinates, THE Test_Suite SHALL verify the shape has correct x, y, width, and height values
2. WHEN a rectangle is created, THE Test_Suite SHALL verify the shape type is "rect"
3. WHEN a rectangle is created, THE Test_Suite SHALL verify the shape has a unique id
4. WHEN a rectangle is created with optional styling, THE Test_Suite SHALL verify fill, stroke, and strokeWidth properties are preserved

### Requirement 2: Test Oval Shape Creation

**User Story:** As a developer, I want to test oval creation, so that I can verify ovals are created with correct properties

#### Acceptance Criteria

1. WHEN an oval is created with valid coordinates, THE Test_Suite SHALL verify the shape has correct x, y, width, and height values
2. WHEN an oval is created, THE Test_Suite SHALL verify the shape type is "oval"
3. WHEN an oval is created, THE Test_Suite SHALL verify the shape has a unique id
4. WHEN an oval is created with optional styling, THE Test_Suite SHALL verify fill, stroke, and strokeWidth properties are preserved

### Requirement 3: Test Arrow Shape Creation

**User Story:** As a developer, I want to test arrow creation, so that I can verify arrows are created with correct endpoints

#### Acceptance Criteria

1. WHEN an arrow is created with start and end coordinates, THE Test_Suite SHALL verify the arrow has correct x1, y1, x2, and y2 values
2. WHEN an arrow is created, THE Test_Suite SHALL verify the shape type is "arrow"
3. WHEN an arrow is created, THE Test_Suite SHALL verify the shape has a unique id
4. WHEN an arrow is created without anchoring, THE Test_Suite SHALL verify fromShapeId and toShapeId are undefined

### Requirement 4: Test Arrow Port Snapping

**User Story:** As a developer, I want to test arrow port snapping, so that I can verify arrows correctly connect to shape ports

#### Acceptance Criteria

1. WHEN an arrow endpoint is near a shape port within snap radius, THE Test_Suite SHALL verify the arrow snaps to that port
2. WHEN an arrow snaps to a port, THE Test_Suite SHALL verify the fromShapeId or toShapeId is set correctly
3. WHEN an arrow snaps to a port, THE Test_Suite SHALL verify the port direction (n, s, e, w) is recorded correctly
4. WHEN an arrow endpoint is outside snap radius, THE Test_Suite SHALL verify the arrow remains unanchored
5. WHEN multiple ports are within snap radius, THE Test_Suite SHALL verify the arrow snaps to the nearest port

### Requirement 5: Test Port Position Calculation

**User Story:** As a developer, I want to test port position calculation, so that I can verify ports are located at correct edge midpoints

#### Acceptance Criteria

1. WHEN a north port position is requested, THE Test_Suite SHALL verify the position is at the top edge midpoint
2. WHEN a south port position is requested, THE Test_Suite SHALL verify the position is at the bottom edge midpoint
3. WHEN an east port position is requested, THE Test_Suite SHALL verify the position is at the right edge midpoint
4. WHEN a west port position is requested, THE Test_Suite SHALL verify the position is at the left edge midpoint
5. FOR ALL rectangle and oval shapes, THE Test_Suite SHALL verify port positions are calculated correctly

### Requirement 6: Test Arrow Routing with A\* Pathfinding

**User Story:** As a developer, I want to test arrow routing, so that I can verify arrows route around obstacles correctly

#### Acceptance Criteria

1. WHEN an arrow is routed between two points with no obstacles, THE Test_Suite SHALL verify the path is a straight line
2. WHEN an arrow is routed with obstacles between endpoints, THE Test_Suite SHALL verify the path routes around obstacles
3. WHEN an arrow is routed, THE Test_Suite SHALL verify waypoints form an orthogonal path (no diagonals)
4. WHEN an arrow is anchored to shape ports, THE Test_Suite SHALL verify the path starts and ends at exact port positions
5. WHEN no valid path exists, THE Test_Suite SHALL verify the router returns a fallback straight line
6. WHEN an arrow is routed, THE Test_Suite SHALL verify waypoints are smoothed to only include direction changes

### Requirement 7: Test AddShapeCommand Execution

**User Story:** As a developer, I want to test AddShapeCommand, so that I can verify shapes are added correctly

#### Acceptance Criteria

1. WHEN AddShapeCommand is executed, THE Test_Suite SHALL verify the shape is added to the shapes array
2. WHEN AddShapeCommand is executed, THE Test_Suite SHALL verify the socket emits a "drawShape" event
3. WHEN AddShapeCommand is executed with a rectangle, THE Test_Suite SHALL verify the rectangle properties are preserved
4. WHEN AddShapeCommand is executed with an oval, THE Test_Suite SHALL verify the oval properties are preserved
5. WHEN AddShapeCommand is executed with an arrow, THE Test_Suite SHALL verify the arrow properties are preserved

### Requirement 8: Test AddShapeCommand Undo

**User Story:** As a developer, I want to test AddShapeCommand undo, so that I can verify added shapes are removed correctly

#### Acceptance Criteria

1. WHEN AddShapeCommand is undone, THE Test_Suite SHALL verify the shape is removed from the shapes array
2. WHEN AddShapeCommand is undone, THE Test_Suite SHALL verify the socket emits a "deleteShape" event
3. WHEN AddShapeCommand is undone, THE Test_Suite SHALL verify the correct shape id is used for deletion
4. FOR ALL shape types, WHEN AddShapeCommand is undone, THE Test_Suite SHALL verify the shape is completely removed

### Requirement 9: Test DeleteShapeCommand Execution

**User Story:** As a developer, I want to test DeleteShapeCommand, so that I can verify shapes are deleted correctly

#### Acceptance Criteria

1. WHEN DeleteShapeCommand is executed, THE Test_Suite SHALL verify the shape is removed from the shapes array
2. WHEN DeleteShapeCommand is executed, THE Test_Suite SHALL verify the socket emits a "deleteShape" event
3. WHEN DeleteShapeCommand is executed on a shape with connected arrows, THE Test_Suite SHALL verify arrow waypoints are captured
4. WHEN DeleteShapeCommand is executed, THE Test_Suite SHALL verify only the target shape is removed

### Requirement 10: Test DeleteShapeCommand Undo

**User Story:** As a developer, I want to test DeleteShapeCommand undo, so that I can verify deleted shapes are restored correctly

#### Acceptance Criteria

1. WHEN DeleteShapeCommand is undone, THE Test_Suite SHALL verify the shape is restored to the shapes array
2. WHEN DeleteShapeCommand is undone, THE Test_Suite SHALL verify the socket emits a "restoreShape" event
3. WHEN DeleteShapeCommand is undone, THE Test_Suite SHALL verify the original shape id is preserved
4. WHEN DeleteShapeCommand is undone, THE Test_Suite SHALL verify connected arrow waypoints are restored
5. FOR ALL shape types, WHEN DeleteShapeCommand is undone, THE Test_Suite SHALL verify the shape properties are unchanged

### Requirement 11: Test MoveShapeCommand Execution

**User Story:** As a developer, I want to test MoveShapeCommand, so that I can verify shapes are moved correctly

#### Acceptance Criteria

1. WHEN MoveShapeCommand is executed, THE Test_Suite SHALL verify the shape position is updated in the shapes array
2. WHEN MoveShapeCommand is executed, THE Test_Suite SHALL verify the socket emits an "updateShape" event
3. WHEN MoveShapeCommand is executed, THE Test_Suite SHALL verify the new position coordinates are correct
4. WHEN MoveShapeCommand is executed, THE Test_Suite SHALL verify other shape properties remain unchanged

### Requirement 12: Test MoveShapeCommand Undo

**User Story:** As a developer, I want to test MoveShapeCommand undo, so that I can verify moved shapes return to original positions

#### Acceptance Criteria

1. WHEN MoveShapeCommand is undone, THE Test_Suite SHALL verify the shape returns to its original position
2. WHEN MoveShapeCommand is undone, THE Test_Suite SHALL verify the socket emits an "updateShape" event
3. WHEN MoveShapeCommand is undone, THE Test_Suite SHALL verify the old position coordinates are restored
4. FOR ALL shape types, WHEN MoveShapeCommand is undone, THE Test_Suite SHALL verify position restoration is exact

### Requirement 13: Test ResizeShapeCommand Execution

**User Story:** As a developer, I want to test ResizeShapeCommand, so that I can verify shapes are resized correctly

#### Acceptance Criteria

1. WHEN ResizeShapeCommand is executed, THE Test_Suite SHALL verify the shape dimensions are updated in the shapes array
2. WHEN ResizeShapeCommand is executed, THE Test_Suite SHALL verify the socket emits an "updateShape" event
3. WHEN ResizeShapeCommand is executed, THE Test_Suite SHALL verify the new width and height are correct
4. WHEN ResizeShapeCommand is executed, THE Test_Suite SHALL verify the shape position remains unchanged

### Requirement 14: Test ResizeShapeCommand Undo

**User Story:** As a developer, I want to test ResizeShapeCommand undo, so that I can verify resized shapes return to original dimensions

#### Acceptance Criteria

1. WHEN ResizeShapeCommand is undone, THE Test_Suite SHALL verify the shape returns to its original dimensions
2. WHEN ResizeShapeCommand is undone, THE Test_Suite SHALL verify the socket emits an "updateShape" event
3. WHEN ResizeShapeCommand is undone, THE Test_Suite SHALL verify the old width and height are restored
4. FOR ALL resizable shapes, WHEN ResizeShapeCommand is undone, THE Test_Suite SHALL verify dimension restoration is exact

### Requirement 15: Test CommandManager Undo Operation

**User Story:** As a developer, I want to test CommandManager undo, so that I can verify the undo operation works correctly

#### Acceptance Criteria

1. WHEN a command is executed and undo is called, THE Test_Suite SHALL verify the command's undo method is invoked
2. WHEN undo is called with no history, THE Test_Suite SHALL verify no operation is performed
3. WHEN multiple commands are executed and undo is called, THE Test_Suite SHALL verify commands are undone in reverse order
4. WHEN undo is called, THE Test_Suite SHALL verify the history pointer is decremented correctly
5. WHEN undo is called, THE Test_Suite SHALL verify canUndo returns false when history is empty

### Requirement 16: Test CommandManager Redo Operation

**User Story:** As a developer, I want to test CommandManager redo, so that I can verify the redo operation works correctly

#### Acceptance Criteria

1. WHEN a command is undone and redo is called, THE Test_Suite SHALL verify the command's execute method is invoked
2. WHEN redo is called with no redo history, THE Test_Suite SHALL verify no operation is performed
3. WHEN multiple commands are undone and redo is called, THE Test_Suite SHALL verify commands are redone in forward order
4. WHEN redo is called, THE Test_Suite SHALL verify the history pointer is incremented correctly
5. WHEN redo is called, THE Test_Suite SHALL verify canRedo returns false when at the end of history

### Requirement 17: Test CommandManager History Management

**User Story:** As a developer, I want to test command history management, so that I can verify history is maintained correctly

#### Acceptance Criteria

1. WHEN a new command is executed after undo, THE Test_Suite SHALL verify the redo history is cleared
2. WHEN commands are executed, THE Test_Suite SHALL verify they are added to history in order
3. WHEN the history pointer is at the beginning, THE Test_Suite SHALL verify canUndo returns false
4. WHEN the history pointer is at the end, THE Test_Suite SHALL verify canRedo returns false
5. FOR ALL command sequences, THE Test_Suite SHALL verify the history pointer tracks position correctly

### Requirement 18: Test Command Sequence Idempotence

**User Story:** As a developer, I want to test command idempotence, so that I can verify repeated undo/redo produces consistent results

#### Acceptance Criteria

1. WHEN a command is executed, undone, and redone, THE Test_Suite SHALL verify the final state matches the initial executed state
2. WHEN multiple commands are executed and fully undone, THE Test_Suite SHALL verify the state returns to the original state
3. FOR ALL command types, WHEN undo is called twice on the same command, THE Test_Suite SHALL verify the state is equivalent to calling undo once
4. FOR ALL command types, WHEN redo is called twice on the same command, THE Test_Suite SHALL verify the state is equivalent to calling redo once

### Requirement 19: Test Arrow Connection Validation

**User Story:** As a developer, I want to test arrow connection validation, so that I can verify arrows maintain valid connections

#### Acceptance Criteria

1. WHEN an arrow is connected to a shape, THE Test_Suite SHALL verify the fromShapeId or toShapeId references an existing shape
2. WHEN a connected shape is deleted, THE Test_Suite SHALL verify the arrow's waypoints are preserved for undo
3. WHEN a connected shape is moved, THE Test_Suite SHALL verify the arrow endpoint follows the shape port
4. WHEN an arrow is created with invalid shape references, THE Test_Suite SHALL verify the arrow falls back to coordinate-based endpoints

### Requirement 20: Test Shape Property Invariants

**User Story:** As a developer, I want to test shape property invariants, so that I can verify shape properties remain consistent through operations

#### Acceptance Criteria

1. FOR ALL shape operations, THE Test_Suite SHALL verify the shape id remains unchanged
2. FOR ALL shape operations, THE Test_Suite SHALL verify the shape type remains unchanged
3. WHEN a shape is moved, THE Test_Suite SHALL verify width and height remain unchanged
4. WHEN a shape is resized, THE Test_Suite SHALL verify the position (x, y) remains unchanged
5. FOR ALL command undo operations, THE Test_Suite SHALL verify all original shape properties are restored exactly
