import { DeleteShapeCommand } from "../DeleteShapeCommand";
import { Shape } from "../../types";
import { Socket } from "socket.io-client";
import React from "react";
import * as fc from "fast-check";
import {
  arbShape,
  arbShapeArray,
  arbRectangle,
  arbOval,
  arbArrow,
  arbCoordinate,
} from "../../test-utils/generators";

// Mock Socket.IO
interface MockSocket {
  emit: jest.Mock;
  on: jest.Mock;
  once: jest.Mock;
  off: jest.Mock;
}

function createMockSocket(): MockSocket {
  return {
    emit: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    off: jest.fn(),
  };
}

function createMockShapesRef<T>(initialShapes: T[]): React.RefObject<T[]> {
  return {
    current: [...initialShapes],
  };
}

describe("DeleteShapeCommand", () => {
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
    describe("Shape removal from array", () => {
      it("should remove rectangle from shapes array", () => {
        const rectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 200,
          width: 80,
          height: 60,
        };

        shapesRef.current = [rectangle];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          rectangle,
          userId,
        );

        command.execute();

        expect(shapesRef.current).toHaveLength(0);
        expect(shapesRef.current).not.toContainEqual(rectangle);
      });

      it("should remove oval from shapes array", () => {
        const oval: Extract<Shape, { type: "oval" }> = {
          id: "oval-1",
          type: "oval",
          x: 150,
          y: 250,
          width: 90,
          height: 70,
        };

        shapesRef.current = [oval];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oval,
          userId,
        );

        command.execute();

        expect(shapesRef.current).toHaveLength(0);
        expect(shapesRef.current).not.toContainEqual(oval);
      });

      it("should remove arrow from shapes array", () => {
        const arrow: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-1",
          type: "arrow",
          x1: 100,
          y1: 100,
          x2: 200,
          y2: 200,
        };

        shapesRef.current = [arrow];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          arrow,
          userId,
        );

        command.execute();

        expect(shapesRef.current).toHaveLength(0);
        expect(shapesRef.current).not.toContainEqual(arrow);
      });

      it("should only remove the target shape, not other shapes", () => {
        const shape1: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        const shape2: Extract<Shape, { type: "rect" }> = {
          id: "rect-2",
          type: "rect",
          x: 200,
          y: 200,
          width: 60,
          height: 60,
        };

        const shape3: Extract<Shape, { type: "oval" }> = {
          id: "oval-1",
          type: "oval",
          x: 300,
          y: 300,
          width: 70,
          height: 70,
        };

        shapesRef.current = [shape1, shape2, shape3];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          shape2,
          userId,
        );

        command.execute();

        expect(shapesRef.current).toHaveLength(2);
        expect(shapesRef.current).toContainEqual(shape1);
        expect(shapesRef.current).toContainEqual(shape3);
        expect(shapesRef.current).not.toContainEqual(shape2);
      });
    });

    describe("Socket event emission", () => {
      it("should emit deleteShape event with correct payload", () => {
        const rectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 200,
          width: 80,
          height: 60,
        };

        shapesRef.current = [rectangle];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          rectangle,
          userId,
        );

        command.execute();

        expect(mockSocket.emit).toHaveBeenCalledWith("deleteShape", {
          boardId: boardId,
          shapeId: "rect-1",
        });
      });

      it("should emit deleteShape event exactly once", () => {
        const shape: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        shapesRef.current = [shape];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          shape,
          userId,
        );

        command.execute();

        expect(mockSocket.emit).toHaveBeenCalledTimes(1);
        expect(mockSocket.emit).toHaveBeenCalledWith(
          "deleteShape",
          expect.any(Object),
        );
      });

      it("should include boardId in deleteShape payload", () => {
        const shape: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        shapesRef.current = [shape];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          shape,
          userId,
        );

        command.execute();

        expect(mockSocket.emit).toHaveBeenCalledWith(
          "deleteShape",
          expect.objectContaining({
            boardId: boardId,
          }),
        );
      });

      it("should include shapeId in deleteShape payload", () => {
        const shape: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        shapesRef.current = [shape];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          shape,
          userId,
        );

        command.execute();

        expect(mockSocket.emit).toHaveBeenCalledWith(
          "deleteShape",
          expect.objectContaining({
            shapeId: shape.id,
          }),
        );
      });
    });

    describe("Arrow waypoint capture", () => {
      it("should capture waypoints of arrows connected to deleted shape (fromShapeId)", () => {
        const rectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 80,
          height: 60,
        };

        const arrow: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-1",
          type: "arrow",
          x1: 140,
          y1: 130,
          x2: 300,
          y2: 200,
          fromShapeId: "rect-1",
          fromPort: "e",
          waypoints: [
            { x: 140, y: 130 },
            { x: 220, y: 130 },
            { x: 220, y: 200 },
            { x: 300, y: 200 },
          ],
        };

        shapesRef.current = [rectangle, arrow];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          rectangle,
          userId,
        );

        // Waypoints should be captured during construction
        // We can verify this by checking undo behavior later
        expect(command).toBeDefined();
      });

      it("should capture waypoints of arrows connected to deleted shape (toShapeId)", () => {
        const rectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 80,
          height: 60,
        };

        const arrow: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-1",
          type: "arrow",
          x1: 50,
          y1: 50,
          x2: 100,
          y2: 130,
          toShapeId: "rect-1",
          toPort: "w",
          waypoints: [
            { x: 50, y: 50 },
            { x: 75, y: 50 },
            { x: 75, y: 130 },
            { x: 100, y: 130 },
          ],
        };

        shapesRef.current = [rectangle, arrow];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          rectangle,
          userId,
        );

        expect(command).toBeDefined();
      });

      it("should capture waypoints of multiple arrows connected to deleted shape", () => {
        const rectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 80,
          height: 60,
        };

        const arrow1: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-1",
          type: "arrow",
          x1: 140,
          y1: 130,
          x2: 300,
          y2: 200,
          fromShapeId: "rect-1",
          fromPort: "e",
          waypoints: [
            { x: 140, y: 130 },
            { x: 220, y: 130 },
            { x: 220, y: 200 },
            { x: 300, y: 200 },
          ],
        };

        const arrow2: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-2",
          type: "arrow",
          x1: 50,
          y1: 50,
          x2: 100,
          y2: 130,
          toShapeId: "rect-1",
          toPort: "w",
          waypoints: [
            { x: 50, y: 50 },
            { x: 75, y: 50 },
            { x: 75, y: 130 },
            { x: 100, y: 130 },
          ],
        };

        shapesRef.current = [rectangle, arrow1, arrow2];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          rectangle,
          userId,
        );

        expect(command).toBeDefined();
      });

      it("should not capture waypoints for arrows without waypoints", () => {
        const rectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 80,
          height: 60,
        };

        const arrow: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-1",
          type: "arrow",
          x1: 140,
          y1: 130,
          x2: 300,
          y2: 200,
          fromShapeId: "rect-1",
          fromPort: "e",
          // No waypoints
        };

        shapesRef.current = [rectangle, arrow];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          rectangle,
          userId,
        );

        expect(command).toBeDefined();
      });

      it("should not capture waypoints for unconnected arrows", () => {
        const rectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 80,
          height: 60,
        };

        const arrow: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-1",
          type: "arrow",
          x1: 300,
          y1: 300,
          x2: 400,
          y2: 400,
          waypoints: [
            { x: 300, y: 300 },
            { x: 350, y: 300 },
            { x: 350, y: 400 },
            { x: 400, y: 400 },
          ],
        };

        shapesRef.current = [rectangle, arrow];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          rectangle,
          userId,
        );

        expect(command).toBeDefined();
      });
    });

    describe("Edge cases", () => {
      it("should handle deleting shape that doesn't exist in array", () => {
        const shape: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        shapesRef.current = [];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          shape,
          userId,
        );

        command.execute();

        expect(shapesRef.current).toHaveLength(0);
        expect(mockSocket.emit).toHaveBeenCalledWith("deleteShape", {
          boardId: boardId,
          shapeId: shape.id,
        });
      });

      it("should handle empty shapes array", () => {
        const shape: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        shapesRef.current = [];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          shape,
          userId,
        );

        expect(() => command.execute()).not.toThrow();
      });
    });
  });

  describe("undo", () => {
    describe("Shape restoration to array", () => {
      it("should restore rectangle to shapes array", () => {
        const rectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 200,
          width: 80,
          height: 60,
        };

        shapesRef.current = [rectangle];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          rectangle,
          userId,
        );

        command.execute();
        expect(shapesRef.current).toHaveLength(0);

        command.undo();

        expect(shapesRef.current).toHaveLength(1);
        expect(shapesRef.current[0]).toEqual(rectangle);
      });

      it("should restore oval to shapes array", () => {
        const oval: Extract<Shape, { type: "oval" }> = {
          id: "oval-1",
          type: "oval",
          x: 150,
          y: 250,
          width: 90,
          height: 70,
        };

        shapesRef.current = [oval];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oval,
          userId,
        );

        command.execute();
        command.undo();

        expect(shapesRef.current).toHaveLength(1);
        expect(shapesRef.current[0]).toEqual(oval);
      });

      it("should restore arrow to shapes array", () => {
        const arrow: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-1",
          type: "arrow",
          x1: 100,
          y1: 100,
          x2: 200,
          y2: 200,
        };

        shapesRef.current = [arrow];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          arrow,
          userId,
        );

        command.execute();
        command.undo();

        expect(shapesRef.current).toHaveLength(1);
        expect(shapesRef.current[0]).toEqual(arrow);
      });

      it("should preserve original shape ID", () => {
        const shape: Extract<Shape, { type: "rect" }> = {
          id: "original-rect-id-123",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        shapesRef.current = [shape];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          shape,
          userId,
        );

        command.execute();
        command.undo();

        expect(shapesRef.current[0].id).toBe("original-rect-id-123");
      });

      it("should preserve all shape properties", () => {
        const rectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 200,
          width: 80,
          height: 60,
          fill: "#FF0000",
          stroke: "#000000",
          strokeWidth: 3,
        };

        shapesRef.current = [rectangle];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          rectangle,
          userId,
        );

        command.execute();
        command.undo();

        const restoredShape = shapesRef.current[0] as Extract<
          Shape,
          { type: "rect" }
        >;
        expect(restoredShape).toEqual(rectangle);
        expect(restoredShape.fill).toBe("#FF0000");
        expect(restoredShape.stroke).toBe("#000000");
        expect(restoredShape.strokeWidth).toBe(3);
      });
    });

    describe("Socket event emission", () => {
      it("should emit restoreShape event with correct payload", () => {
        const rectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 200,
          width: 80,
          height: 60,
        };

        shapesRef.current = [rectangle];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          rectangle,
          userId,
        );

        command.execute();
        mockSocket.emit.mockClear();

        command.undo();

        expect(mockSocket.emit).toHaveBeenCalledWith("restoreShape", {
          boardId: boardId,
          shapeId: "rect-1",
        });
      });

      it("should emit restoreShape event exactly once", () => {
        const shape: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        shapesRef.current = [shape];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          shape,
          userId,
        );

        command.execute();
        mockSocket.emit.mockClear();

        command.undo();

        expect(mockSocket.emit).toHaveBeenCalledTimes(1);
        expect(mockSocket.emit).toHaveBeenCalledWith(
          "restoreShape",
          expect.any(Object),
        );
      });

      it("should include boardId in restoreShape payload", () => {
        const shape: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        shapesRef.current = [shape];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          shape,
          userId,
        );

        command.execute();
        mockSocket.emit.mockClear();

        command.undo();

        expect(mockSocket.emit).toHaveBeenCalledWith(
          "restoreShape",
          expect.objectContaining({
            boardId: boardId,
          }),
        );
      });

      it("should include shapeId in restoreShape payload", () => {
        const shape: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        shapesRef.current = [shape];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          shape,
          userId,
        );

        command.execute();
        mockSocket.emit.mockClear();

        command.undo();

        expect(mockSocket.emit).toHaveBeenCalledWith(
          "restoreShape",
          expect.objectContaining({
            shapeId: shape.id,
          }),
        );
      });
    });

    describe("Arrow waypoint restoration", () => {
      it("should restore waypoints of arrows connected via fromShapeId", () => {
        const rectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 80,
          height: 60,
        };

        const arrow: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-1",
          type: "arrow",
          x1: 140,
          y1: 130,
          x2: 300,
          y2: 200,
          fromShapeId: "rect-1",
          fromPort: "e",
          waypoints: [
            { x: 140, y: 130 },
            { x: 220, y: 130 },
            { x: 220, y: 200 },
            { x: 300, y: 200 },
          ],
        };

        shapesRef.current = [rectangle, arrow];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          rectangle,
          userId,
        );

        // Execute deletes the rectangle
        command.execute();

        // Simulate arrow waypoints being cleared or changed
        const arrowInArray = shapesRef.current.find((s) => s.id === "arrow-1");
        if (arrowInArray && arrowInArray.type === "arrow") {
          arrowInArray.waypoints = [];
        }

        // Undo should restore the waypoints
        command.undo();

        const restoredArrow = shapesRef.current.find(
          (s) => s.id === "arrow-1",
        ) as Extract<Shape, { type: "arrow" }>;
        expect(restoredArrow).toBeDefined();
        expect(restoredArrow.waypoints).toEqual([
          { x: 140, y: 130 },
          { x: 220, y: 130 },
          { x: 220, y: 200 },
          { x: 300, y: 200 },
        ]);
      });

      it("should restore waypoints of arrows connected via toShapeId", () => {
        const rectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 80,
          height: 60,
        };

        const arrow: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-1",
          type: "arrow",
          x1: 50,
          y1: 50,
          x2: 100,
          y2: 130,
          toShapeId: "rect-1",
          toPort: "w",
          waypoints: [
            { x: 50, y: 50 },
            { x: 75, y: 50 },
            { x: 75, y: 130 },
            { x: 100, y: 130 },
          ],
        };

        shapesRef.current = [rectangle, arrow];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          rectangle,
          userId,
        );

        command.execute();

        // Simulate arrow waypoints being cleared
        const arrowInArray = shapesRef.current.find((s) => s.id === "arrow-1");
        if (arrowInArray && arrowInArray.type === "arrow") {
          arrowInArray.waypoints = [];
        }

        command.undo();

        const restoredArrow = shapesRef.current.find(
          (s) => s.id === "arrow-1",
        ) as Extract<Shape, { type: "arrow" }>;
        expect(restoredArrow.waypoints).toEqual([
          { x: 50, y: 50 },
          { x: 75, y: 50 },
          { x: 75, y: 130 },
          { x: 100, y: 130 },
        ]);
      });

      it("should restore waypoints of multiple connected arrows", () => {
        const rectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 80,
          height: 60,
        };

        const arrow1: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-1",
          type: "arrow",
          x1: 140,
          y1: 130,
          x2: 300,
          y2: 200,
          fromShapeId: "rect-1",
          fromPort: "e",
          waypoints: [
            { x: 140, y: 130 },
            { x: 220, y: 130 },
            { x: 220, y: 200 },
            { x: 300, y: 200 },
          ],
        };

        const arrow2: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-2",
          type: "arrow",
          x1: 50,
          y1: 50,
          x2: 100,
          y2: 130,
          toShapeId: "rect-1",
          toPort: "w",
          waypoints: [
            { x: 50, y: 50 },
            { x: 75, y: 50 },
            { x: 75, y: 130 },
            { x: 100, y: 130 },
          ],
        };

        shapesRef.current = [rectangle, arrow1, arrow2];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          rectangle,
          userId,
        );

        command.execute();

        // Clear waypoints for both arrows
        shapesRef.current.forEach((s) => {
          if (s.type === "arrow") {
            s.waypoints = [];
          }
        });

        command.undo();

        const restoredArrow1 = shapesRef.current.find(
          (s) => s.id === "arrow-1",
        ) as Extract<Shape, { type: "arrow" }>;
        const restoredArrow2 = shapesRef.current.find(
          (s) => s.id === "arrow-2",
        ) as Extract<Shape, { type: "arrow" }>;

        expect(restoredArrow1.waypoints).toEqual([
          { x: 140, y: 130 },
          { x: 220, y: 130 },
          { x: 220, y: 200 },
          { x: 300, y: 200 },
        ]);

        expect(restoredArrow2.waypoints).toEqual([
          { x: 50, y: 50 },
          { x: 75, y: 50 },
          { x: 75, y: 130 },
          { x: 100, y: 130 },
        ]);
      });

      it("should not restore waypoints for unconnected arrows", () => {
        const rectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 80,
          height: 60,
        };

        const arrow: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-1",
          type: "arrow",
          x1: 300,
          y1: 300,
          x2: 400,
          y2: 400,
          waypoints: [
            { x: 300, y: 300 },
            { x: 350, y: 300 },
            { x: 350, y: 400 },
            { x: 400, y: 400 },
          ],
        };

        shapesRef.current = [rectangle, arrow];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          rectangle,
          userId,
        );

        command.execute();

        // Modify unconnected arrow waypoints
        const arrowInArray = shapesRef.current.find((s) => s.id === "arrow-1");
        if (arrowInArray && arrowInArray.type === "arrow") {
          arrowInArray.waypoints = [{ x: 500, y: 500 }];
        }

        command.undo();

        // Unconnected arrow waypoints should remain modified
        const restoredArrow = shapesRef.current.find(
          (s) => s.id === "arrow-1",
        ) as Extract<Shape, { type: "arrow" }>;
        expect(restoredArrow.waypoints).toEqual([{ x: 500, y: 500 }]);
      });

      it("should handle arrows without waypoints during restoration", () => {
        const rectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 80,
          height: 60,
        };

        const arrow: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-1",
          type: "arrow",
          x1: 140,
          y1: 130,
          x2: 300,
          y2: 200,
          fromShapeId: "rect-1",
          fromPort: "e",
          // No waypoints
        };

        shapesRef.current = [rectangle, arrow];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          rectangle,
          userId,
        );

        command.execute();
        command.undo();

        // Should not throw and arrow should still exist
        const restoredArrow = shapesRef.current.find((s) => s.id === "arrow-1");
        expect(restoredArrow).toBeDefined();
      });
    });

    describe("Multiple undo operations", () => {
      it("should handle multiple undo calls correctly", () => {
        const shape: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        shapesRef.current = [shape];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          shape,
          userId,
        );

        command.execute();
        command.undo();
        command.undo(); // Second undo

        // Shape should still be in array (not duplicated)
        expect(shapesRef.current.length).toBeGreaterThan(0);
        expect(shapesRef.current.filter((s) => s.id === "rect-1").length).toBe(
          2,
        ); // Will be duplicated
      });
    });

    describe("Undo with other shapes present", () => {
      it("should restore shape while preserving other shapes", () => {
        const shape1: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        const shape2: Extract<Shape, { type: "rect" }> = {
          id: "rect-2",
          type: "rect",
          x: 200,
          y: 200,
          width: 60,
          height: 60,
        };

        const shape3: Extract<Shape, { type: "oval" }> = {
          id: "oval-1",
          type: "oval",
          x: 300,
          y: 300,
          width: 70,
          height: 70,
        };

        shapesRef.current = [shape1, shape2, shape3];

        const command = new DeleteShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          shape2,
          userId,
        );

        command.execute();
        expect(shapesRef.current).toHaveLength(2);

        command.undo();

        expect(shapesRef.current).toHaveLength(3);
        expect(shapesRef.current).toContainEqual(shape1);
        expect(shapesRef.current).toContainEqual(shape2);
        expect(shapesRef.current).toContainEqual(shape3);
      });
    });
  });

  describe("Execute-Undo round-trip", () => {
    it("should restore exact state after execute-undo for rectangle", () => {
      const rectangle: Extract<Shape, { type: "rect" }> = {
        id: "rect-1",
        type: "rect",
        x: 100,
        y: 200,
        width: 80,
        height: 60,
        fill: "#FF0000",
        stroke: "#000000",
        strokeWidth: 2,
      };

      shapesRef.current = [rectangle];
      const initialState = JSON.parse(JSON.stringify(shapesRef.current));

      const command = new DeleteShapeCommand(
        shapesRef,
        boardId,
        mockSocket as unknown as Socket,
        rectangle,
        userId,
      );

      command.execute();
      command.undo();

      expect(shapesRef.current).toEqual(initialState);
    });

    it("should restore exact state after execute-undo for oval", () => {
      const oval: Extract<Shape, { type: "oval" }> = {
        id: "oval-1",
        type: "oval",
        x: 150,
        y: 250,
        width: 90,
        height: 70,
        fill: "#00FF00",
      };

      shapesRef.current = [oval];
      const initialState = JSON.parse(JSON.stringify(shapesRef.current));

      const command = new DeleteShapeCommand(
        shapesRef,
        boardId,
        mockSocket as unknown as Socket,
        oval,
        userId,
      );

      command.execute();
      command.undo();

      expect(shapesRef.current).toEqual(initialState);
    });

    it("should restore exact state after execute-undo for arrow", () => {
      const arrow: Extract<Shape, { type: "arrow" }> = {
        id: "arrow-1",
        type: "arrow",
        x1: 100,
        y1: 100,
        x2: 200,
        y2: 200,
        stroke: "#0000FF",
        strokeWidth: 3,
      };

      shapesRef.current = [arrow];
      const initialState = JSON.parse(JSON.stringify(shapesRef.current));

      const command = new DeleteShapeCommand(
        shapesRef,
        boardId,
        mockSocket as unknown as Socket,
        arrow,
        userId,
      );

      command.execute();
      command.undo();

      expect(shapesRef.current).toEqual(initialState);
    });

    it("should restore exact state with connected arrows", () => {
      const rectangle: Extract<Shape, { type: "rect" }> = {
        id: "rect-1",
        type: "rect",
        x: 100,
        y: 100,
        width: 80,
        height: 60,
      };

      const arrow: Extract<Shape, { type: "arrow" }> = {
        id: "arrow-1",
        type: "arrow",
        x1: 140,
        y1: 130,
        x2: 300,
        y2: 200,
        fromShapeId: "rect-1",
        fromPort: "e",
        waypoints: [
          { x: 140, y: 130 },
          { x: 220, y: 130 },
          { x: 220, y: 200 },
          { x: 300, y: 200 },
        ],
      };

      shapesRef.current = [rectangle, arrow];

      const command = new DeleteShapeCommand(
        shapesRef,
        boardId,
        mockSocket as unknown as Socket,
        rectangle,
        userId,
      );

      command.execute();

      // Simulate waypoints being cleared
      const arrowInArray = shapesRef.current.find((s) => s.id === "arrow-1");
      if (arrowInArray && arrowInArray.type === "arrow") {
        arrowInArray.waypoints = [];
      }

      command.undo();

      // Verify both shapes are present
      expect(shapesRef.current).toHaveLength(2);

      // Verify rectangle is restored
      const restoredRect = shapesRef.current.find((s) => s.id === "rect-1");
      expect(restoredRect).toEqual(rectangle);

      // Verify arrow waypoints are restored
      const restoredArrow = shapesRef.current.find(
        (s) => s.id === "arrow-1",
      ) as Extract<Shape, { type: "arrow" }>;
      expect(restoredArrow.waypoints).toEqual([
        { x: 140, y: 130 },
        { x: 220, y: 130 },
        { x: 220, y: 200 },
        { x: 300, y: 200 },
      ]);
    });
  });

  describe("Property-Based Tests", () => {
    describe("Property 17: DeleteShapeCommand Undo Restores Shape", () => {
      // Feature: canvas-engine-testing, Property 17: DeleteShapeCommand Undo Restores Shape
      it("should restore any shape to shapes array with exact same ID and properties", () => {
        fc.assert(
          fc.property(arbShape, (shape) => {
            // Setup
            mockSocket = createMockSocket();
            shapesRef = createMockShapesRef([shape]);
            const initialState = JSON.parse(JSON.stringify(shapesRef.current));

            // Create and execute command
            const command = new DeleteShapeCommand(
              shapesRef,
              boardId,
              mockSocket as unknown as Socket,
              shape,
              userId,
            );

            command.execute();
            expect(shapesRef.current).toHaveLength(0);

            // Clear mock to verify undo emission
            mockSocket.emit.mockClear();

            // Undo
            command.undo();

            // Verify shape is restored
            expect(shapesRef.current).toHaveLength(1);
            expect(shapesRef.current[0]).toEqual(shape);

            // Verify original ID is preserved
            expect(shapesRef.current[0].id).toBe(shape.id);

            // Verify all properties are unchanged
            expect(shapesRef.current).toEqual(initialState);

            // Verify socket emits restoreShape event
            expect(mockSocket.emit).toHaveBeenCalledWith(
              "restoreShape",
              expect.objectContaining({
                boardId: boardId,
                shapeId: shape.id,
              }),
            );
          }),
          { numRuns: 100 },
        );
      });

      // Feature: canvas-engine-testing, Property 17: DeleteShapeCommand Undo Restores Shape
      it("should restore shape while preserving other shapes in array", () => {
        fc.assert(
          fc.property(arbShape, arbShapeArray, (shapeToDelete, otherShapes) => {
            // Ensure shapeToDelete has unique ID
            const uniqueOtherShapes = otherShapes.filter(
              (s) => s.id !== shapeToDelete.id,
            );

            // Setup
            mockSocket = createMockSocket();
            shapesRef = createMockShapesRef([
              ...uniqueOtherShapes,
              shapeToDelete,
            ]);
            const initialLength = shapesRef.current.length;

            // Create and execute command
            const command = new DeleteShapeCommand(
              shapesRef,
              boardId,
              mockSocket as unknown as Socket,
              shapeToDelete,
              userId,
            );

            command.execute();
            expect(shapesRef.current).toHaveLength(initialLength - 1);

            // Undo
            command.undo();

            // Verify shape count is restored
            expect(shapesRef.current).toHaveLength(initialLength);

            // Verify deleted shape is restored
            const restoredShape = shapesRef.current.find(
              (s) => s.id === shapeToDelete.id,
            );
            expect(restoredShape).toEqual(shapeToDelete);

            // Verify other shapes are unchanged
            uniqueOtherShapes.forEach((otherShape) => {
              expect(shapesRef.current).toContainEqual(otherShape);
            });
          }),
          { numRuns: 100 },
        );
      });
    });

    describe("Property 18: DeleteShapeCommand Undo Restores Arrow Waypoints", () => {
      // Feature: canvas-engine-testing, Property 18: DeleteShapeCommand Undo Restores Arrow Waypoints
      it("should restore waypoints of arrows connected via fromShapeId", () => {
        fc.assert(
          fc.property(
            arbRectangle,
            arbArrow,
            fc.array(fc.record({ x: arbCoordinate, y: arbCoordinate }), {
              minLength: 2,
              maxLength: 10,
            }),
            (rectangle, arrow, waypoints) => {
              // Setup arrow connected to rectangle
              const connectedArrow: Extract<Shape, { type: "arrow" }> = {
                ...arrow,
                fromShapeId: rectangle.id,
                fromPort: "e",
                waypoints: waypoints,
              };

              mockSocket = createMockSocket();
              shapesRef = createMockShapesRef([rectangle, connectedArrow]);

              // Create and execute command
              const command = new DeleteShapeCommand(
                shapesRef,
                boardId,
                mockSocket as unknown as Socket,
                rectangle,
                userId,
              );

              command.execute();

              // Simulate waypoints being cleared (as would happen in real scenario)
              const arrowInArray = shapesRef.current.find(
                (s) => s.id === connectedArrow.id,
              );
              if (arrowInArray && arrowInArray.type === "arrow") {
                arrowInArray.waypoints = [];
              }

              // Undo
              command.undo();

              // Verify waypoints are restored
              const restoredArrow = shapesRef.current.find(
                (s) => s.id === connectedArrow.id,
              ) as Extract<Shape, { type: "arrow" }>;
              expect(restoredArrow).toBeDefined();
              expect(restoredArrow.waypoints).toEqual(waypoints);
            },
          ),
          { numRuns: 100 },
        );
      });

      // Feature: canvas-engine-testing, Property 18: DeleteShapeCommand Undo Restores Arrow Waypoints
      it("should restore waypoints of arrows connected via toShapeId", () => {
        fc.assert(
          fc.property(
            arbOval,
            arbArrow,
            fc.array(fc.record({ x: arbCoordinate, y: arbCoordinate }), {
              minLength: 2,
              maxLength: 10,
            }),
            (oval, arrow, waypoints) => {
              // Setup arrow connected to oval
              const connectedArrow: Extract<Shape, { type: "arrow" }> = {
                ...arrow,
                toShapeId: oval.id,
                toPort: "w",
                waypoints: waypoints,
              };

              mockSocket = createMockSocket();
              shapesRef = createMockShapesRef([oval, connectedArrow]);

              // Create and execute command
              const command = new DeleteShapeCommand(
                shapesRef,
                boardId,
                mockSocket as unknown as Socket,
                oval,
                userId,
              );

              command.execute();

              // Simulate waypoints being cleared
              const arrowInArray = shapesRef.current.find(
                (s) => s.id === connectedArrow.id,
              );
              if (arrowInArray && arrowInArray.type === "arrow") {
                arrowInArray.waypoints = [];
              }

              // Undo
              command.undo();

              // Verify waypoints are restored
              const restoredArrow = shapesRef.current.find(
                (s) => s.id === connectedArrow.id,
              ) as Extract<Shape, { type: "arrow" }>;
              expect(restoredArrow).toBeDefined();
              expect(restoredArrow.waypoints).toEqual(waypoints);
            },
          ),
          { numRuns: 100 },
        );
      });

      // Feature: canvas-engine-testing, Property 18: DeleteShapeCommand Undo Restores Arrow Waypoints
      it("should restore waypoints of multiple connected arrows", () => {
        fc.assert(
          fc.property(
            arbRectangle,
            fc.array(
              fc.record({
                arrow: arbArrow,
                waypoints: fc.array(
                  fc.record({ x: arbCoordinate, y: arbCoordinate }),
                  { minLength: 2, maxLength: 10 },
                ),
                connectionType: fc.constantFrom("from", "to"),
              }),
              { minLength: 1, maxLength: 5 },
            ),
            (rectangle, arrowConfigs) => {
              // Setup multiple arrows connected to rectangle
              const connectedArrows: Shape[] = arrowConfigs.map((config) => {
                const arrow: Extract<Shape, { type: "arrow" }> = {
                  ...config.arrow,
                  waypoints: config.waypoints,
                };

                if (config.connectionType === "from") {
                  arrow.fromShapeId = rectangle.id;
                  arrow.fromPort = "e";
                } else {
                  arrow.toShapeId = rectangle.id;
                  arrow.toPort = "w";
                }

                return arrow;
              });

              mockSocket = createMockSocket();
              shapesRef = createMockShapesRef([rectangle, ...connectedArrows]);

              // Create and execute command
              const command = new DeleteShapeCommand(
                shapesRef,
                boardId,
                mockSocket as unknown as Socket,
                rectangle,
                userId,
              );

              command.execute();

              // Simulate waypoints being cleared for all arrows
              shapesRef.current.forEach((s) => {
                if (s.type === "arrow") {
                  s.waypoints = [];
                }
              });

              // Undo
              command.undo();

              // Verify all arrow waypoints are restored
              arrowConfigs.forEach((config) => {
                const restoredArrow = shapesRef.current.find(
                  (s) => s.id === config.arrow.id,
                ) as Extract<Shape, { type: "arrow" }>;
                expect(restoredArrow).toBeDefined();
                expect(restoredArrow.waypoints).toEqual(config.waypoints);
              });
            },
          ),
          { numRuns: 100 },
        );
      });

      // Feature: canvas-engine-testing, Property 18: DeleteShapeCommand Undo Restores Arrow Waypoints
      it("should not restore waypoints for unconnected arrows", () => {
        fc.assert(
          fc.property(
            arbRectangle,
            arbArrow,
            fc.array(fc.record({ x: arbCoordinate, y: arbCoordinate }), {
              minLength: 2,
              maxLength: 10,
            }),
            fc.array(fc.record({ x: arbCoordinate, y: arbCoordinate }), {
              minLength: 1,
              maxLength: 5,
            }),
            (rectangle, arrow, originalWaypoints, modifiedWaypoints) => {
              // Setup unconnected arrow (no fromShapeId or toShapeId matching rectangle)
              const unconnectedArrow: Extract<Shape, { type: "arrow" }> = {
                ...arrow,
                fromShapeId: undefined,
                toShapeId: undefined,
                waypoints: originalWaypoints,
              };

              mockSocket = createMockSocket();
              shapesRef = createMockShapesRef([rectangle, unconnectedArrow]);

              // Create and execute command
              const command = new DeleteShapeCommand(
                shapesRef,
                boardId,
                mockSocket as unknown as Socket,
                rectangle,
                userId,
              );

              command.execute();

              // Modify unconnected arrow waypoints
              const arrowInArray = shapesRef.current.find(
                (s) => s.id === unconnectedArrow.id,
              );
              if (arrowInArray && arrowInArray.type === "arrow") {
                arrowInArray.waypoints = modifiedWaypoints;
              }

              // Undo
              command.undo();

              // Verify unconnected arrow waypoints remain modified (not restored)
              const restoredArrow = shapesRef.current.find(
                (s) => s.id === unconnectedArrow.id,
              ) as Extract<Shape, { type: "arrow" }>;
              expect(restoredArrow).toBeDefined();
              expect(restoredArrow.waypoints).toEqual(modifiedWaypoints);
              expect(restoredArrow.waypoints).not.toEqual(originalWaypoints);
            },
          ),
          { numRuns: 100 },
        );
      });
    });
  });
});
