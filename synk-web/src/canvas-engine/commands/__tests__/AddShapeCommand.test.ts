import { AddShapeCommand } from "../AddShapeCommand";
import { Shape } from "../../types";
import { Socket } from "socket.io-client";
import React from "react";

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
    describe("Rectangle shapes", () => {
      it("should emit drawShape event with correct payload for rectangle", () => {
        const rectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 200,
          width: 80,
          height: 60,
        };

        const command = new AddShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          rectangle,
          userId,
        );

        command.execute();

        expect(mockSocket.emit).toHaveBeenCalledWith("drawShape", {
          userId: userId,
          boardId: boardId,
          shape: rectangle,
        });
      });

      it("should preserve rectangle properties in emitted event", () => {
        const rectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-2",
          type: "rect",
          x: 50,
          y: 100,
          width: 120,
          height: 80,
          fill: "#FF0000",
          stroke: "#000000",
          strokeWidth: 2,
        };

        const command = new AddShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          rectangle,
          userId,
        );

        command.execute();

        expect(mockSocket.emit).toHaveBeenCalledWith("drawShape", {
          userId: userId,
          boardId: boardId,
          shape: expect.objectContaining({
            type: "rect",
            x: 50,
            y: 100,
            width: 120,
            height: 80,
            fill: "#FF0000",
            stroke: "#000000",
            strokeWidth: 2,
          }),
        });
      });

      it("should handle rectangle without optional styling properties", () => {
        const rectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-3",
          type: "rect",
          x: 200,
          y: 300,
          width: 100,
          height: 50,
        };

        const command = new AddShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          rectangle,
          userId,
        );

        command.execute();

        expect(mockSocket.emit).toHaveBeenCalledWith("drawShape", {
          userId: userId,
          boardId: boardId,
          shape: rectangle,
        });
      });
    });

    describe("Oval shapes", () => {
      it("should emit drawShape event with correct payload for oval", () => {
        const oval: Extract<Shape, { type: "oval" }> = {
          id: "oval-1",
          type: "oval",
          x: 150,
          y: 250,
          width: 90,
          height: 70,
        };

        const command = new AddShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oval,
          userId,
        );

        command.execute();

        expect(mockSocket.emit).toHaveBeenCalledWith("drawShape", {
          userId: userId,
          boardId: boardId,
          shape: oval,
        });
      });

      it("should preserve oval properties in emitted event", () => {
        const oval: Extract<Shape, { type: "oval" }> = {
          id: "oval-2",
          type: "oval",
          x: 75,
          y: 125,
          width: 140,
          height: 90,
          fill: "#00FF00",
          stroke: "#0000FF",
          strokeWidth: 3,
        };

        const command = new AddShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oval,
          userId,
        );

        command.execute();

        expect(mockSocket.emit).toHaveBeenCalledWith("drawShape", {
          userId: userId,
          boardId: boardId,
          shape: expect.objectContaining({
            type: "oval",
            x: 75,
            y: 125,
            width: 140,
            height: 90,
            fill: "#00FF00",
            stroke: "#0000FF",
            strokeWidth: 3,
          }),
        });
      });

      it("should handle oval without optional styling properties", () => {
        const oval: Extract<Shape, { type: "oval" }> = {
          id: "oval-3",
          type: "oval",
          x: 300,
          y: 400,
          width: 60,
          height: 40,
        };

        const command = new AddShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oval,
          userId,
        );

        command.execute();

        expect(mockSocket.emit).toHaveBeenCalledWith("drawShape", {
          userId: userId,
          boardId: boardId,
          shape: oval,
        });
      });
    });

    describe("Arrow shapes", () => {
      it("should emit drawShape event with correct payload for arrow", () => {
        const arrow: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-1",
          type: "arrow",
          x1: 100,
          y1: 100,
          x2: 200,
          y2: 200,
        };

        const command = new AddShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          arrow,
          userId,
        );

        command.execute();

        expect(mockSocket.emit).toHaveBeenCalledWith("drawShape", {
          userId: userId,
          boardId: boardId,
          shape: arrow,
        });
      });

      it("should preserve arrow properties in emitted event", () => {
        const arrow: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-2",
          type: "arrow",
          x1: 50,
          y1: 75,
          x2: 250,
          y2: 300,
          stroke: "#FF0000",
          strokeWidth: 2,
        };

        const command = new AddShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          arrow,
          userId,
        );

        command.execute();

        expect(mockSocket.emit).toHaveBeenCalledWith("drawShape", {
          userId: userId,
          boardId: boardId,
          shape: expect.objectContaining({
            type: "arrow",
            x1: 50,
            y1: 75,
            x2: 250,
            y2: 300,
            stroke: "#FF0000",
            strokeWidth: 2,
          }),
        });
      });

      it("should handle anchored arrow with shape connections", () => {
        const arrow: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-3",
          type: "arrow",
          x1: 130,
          y1: 80,
          x2: 200,
          y2: 80,
          fromShapeId: "rect-1",
          fromPort: "e",
          toShapeId: "rect-2",
          toPort: "w",
        };

        const command = new AddShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          arrow,
          userId,
        );

        command.execute();

        expect(mockSocket.emit).toHaveBeenCalledWith("drawShape", {
          userId: userId,
          boardId: boardId,
          shape: expect.objectContaining({
            type: "arrow",
            fromShapeId: "rect-1",
            fromPort: "e",
            toShapeId: "rect-2",
            toPort: "w",
          }),
        });
      });

      it("should handle partially anchored arrow (only fromShape)", () => {
        const arrow: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-4",
          type: "arrow",
          x1: 130,
          y1: 80,
          x2: 250,
          y2: 150,
          fromShapeId: "rect-1",
          fromPort: "e",
        };

        const command = new AddShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          arrow,
          userId,
        );

        command.execute();

        expect(mockSocket.emit).toHaveBeenCalledWith("drawShape", {
          userId: userId,
          boardId: boardId,
          shape: expect.objectContaining({
            type: "arrow",
            fromShapeId: "rect-1",
            fromPort: "e",
            x1: 130,
            y1: 80,
            x2: 250,
            y2: 150,
          }),
        });

        // Verify toShapeId and toPort are not present
        const emittedShape = mockSocket.emit.mock.calls[0][1].shape;
        expect(emittedShape.toShapeId).toBeUndefined();
        expect(emittedShape.toPort).toBeUndefined();
      });
    });

    describe("Socket event emission", () => {
      it("should emit drawShape event exactly once", () => {
        const shape: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        const command = new AddShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          shape,
          userId,
        );

        command.execute();

        expect(mockSocket.emit).toHaveBeenCalledTimes(1);
        expect(mockSocket.emit).toHaveBeenCalledWith(
          "drawShape",
          expect.any(Object),
        );
      });

      it("should include userId in socket payload", () => {
        const shape: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        const command = new AddShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          shape,
          userId,
        );

        command.execute();

        expect(mockSocket.emit).toHaveBeenCalledWith(
          "drawShape",
          expect.objectContaining({
            userId: userId,
          }),
        );
      });

      it("should include boardId in socket payload", () => {
        const shape: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        const command = new AddShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          shape,
          userId,
        );

        command.execute();

        expect(mockSocket.emit).toHaveBeenCalledWith(
          "drawShape",
          expect.objectContaining({
            boardId: boardId,
          }),
        );
      });
    });
  });

  describe("undo", () => {
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

        const command = new AddShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          rectangle,
          userId,
        );

        // Simulate server response with shape
        const serverShape = { ...rectangle, id: "server-rect-1" };
        shapesRef.current = [serverShape];

        // Trigger the shapeDrawn listener
        const onceCallback = mockSocket.once.mock.calls[0][1];
        onceCallback(serverShape);

        command.undo();

        expect(shapesRef.current).toHaveLength(0);
        expect(shapesRef.current).not.toContainEqual(serverShape);
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

        const command = new AddShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oval,
          userId,
        );

        // Simulate server response
        const serverShape = { ...oval, id: "server-oval-1" };
        shapesRef.current = [serverShape];

        const onceCallback = mockSocket.once.mock.calls[0][1];
        onceCallback(serverShape);

        command.undo();

        expect(shapesRef.current).toHaveLength(0);
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

        const command = new AddShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          arrow,
          userId,
        );

        // Simulate server response
        const serverShape = { ...arrow, id: "server-arrow-1" };
        shapesRef.current = [serverShape];

        const onceCallback = mockSocket.once.mock.calls[0][1];
        onceCallback(serverShape);

        command.undo();

        expect(shapesRef.current).toHaveLength(0);
      });

      it("should only remove the specific shape, not other shapes", () => {
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

        const command = new AddShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          shape1,
          userId,
        );

        // Simulate server response and add both shapes
        const serverShape1 = { ...shape1, id: "server-rect-1" };
        shapesRef.current = [serverShape1, shape2];

        const onceCallback = mockSocket.once.mock.calls[0][1];
        onceCallback(serverShape1);

        command.undo();

        expect(shapesRef.current).toHaveLength(1);
        expect(shapesRef.current[0]).toEqual(shape2);
      });
    });

    describe("Socket event emission", () => {
      it("should emit deleteShape event with correct shape ID", () => {
        const rectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 200,
          width: 80,
          height: 60,
        };

        const command = new AddShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          rectangle,
          userId,
        );

        // Simulate server response
        const serverShape = { ...rectangle, id: "server-rect-1" };
        shapesRef.current = [serverShape];

        const onceCallback = mockSocket.once.mock.calls[0][1];
        onceCallback(serverShape);

        // Clear previous emit calls from execute
        mockSocket.emit.mockClear();

        command.undo();

        expect(mockSocket.emit).toHaveBeenCalledWith("deleteShape", {
          boardId: boardId,
          shapeId: "server-rect-1",
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

        const command = new AddShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          shape,
          userId,
        );

        // Simulate server response
        const serverShape = { ...shape, id: "server-rect-1" };
        shapesRef.current = [serverShape];

        const onceCallback = mockSocket.once.mock.calls[0][1];
        onceCallback(serverShape);

        mockSocket.emit.mockClear();

        command.undo();

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

        const command = new AddShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          shape,
          userId,
        );

        // Simulate server response
        const serverShape = { ...shape, id: "server-rect-1" };
        shapesRef.current = [serverShape];

        const onceCallback = mockSocket.once.mock.calls[0][1];
        onceCallback(serverShape);

        mockSocket.emit.mockClear();

        command.undo();

        expect(mockSocket.emit).toHaveBeenCalledWith(
          "deleteShape",
          expect.objectContaining({
            boardId: boardId,
          }),
        );
      });
    });

    describe("Edge cases", () => {
      it("should not emit deleteShape if committedShape is null", () => {
        const shape: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        const command = new AddShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          shape,
          userId,
        );

        // Don't trigger shapeDrawn listener, so committedShape remains null
        mockSocket.emit.mockClear();

        command.undo();

        expect(mockSocket.emit).not.toHaveBeenCalled();
      });

      it("should handle undo when shape was already removed from array", () => {
        const shape: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        const command = new AddShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          shape,
          userId,
        );

        // Simulate server response
        const serverShape = { ...shape, id: "server-rect-1" };

        const onceCallback = mockSocket.once.mock.calls[0][1];
        onceCallback(serverShape);

        // Shapes array is empty (shape was removed by something else)
        shapesRef.current = [];

        mockSocket.emit.mockClear();

        command.undo();

        // Should still emit deleteShape event
        expect(mockSocket.emit).toHaveBeenCalledWith("deleteShape", {
          boardId: boardId,
          shapeId: "server-rect-1",
        });

        // Array should remain empty
        expect(shapesRef.current).toHaveLength(0);
      });
    });

    describe("Server shape ID handling", () => {
      it("should use server-assigned ID for deletion", () => {
        const clientShape: Extract<Shape, { type: "rect" }> = {
          id: "client-rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        const command = new AddShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          clientShape,
          userId,
        );

        // Server returns shape with different ID
        const serverShape: Extract<Shape, { type: "rect" }> = {
          ...clientShape,
          id: "server-assigned-id-123",
        };

        shapesRef.current = [serverShape];

        const onceCallback = mockSocket.once.mock.calls[0][1];
        onceCallback(serverShape);

        mockSocket.emit.mockClear();

        command.undo();

        // Should use server-assigned ID, not client ID
        expect(mockSocket.emit).toHaveBeenCalledWith("deleteShape", {
          boardId: boardId,
          shapeId: "server-assigned-id-123",
        });
      });

      it("should match shape by type when capturing server response", () => {
        const rectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        const command = new AddShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          rectangle,
          userId,
        );

        // Server returns a shape with matching type
        const serverShape: Extract<Shape, { type: "rect" }> = {
          id: "server-rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        const onceCallback = mockSocket.once.mock.calls[0][1];
        onceCallback(serverShape);

        shapesRef.current = [serverShape];
        mockSocket.emit.mockClear();

        command.undo();

        expect(mockSocket.emit).toHaveBeenCalledWith("deleteShape", {
          boardId: boardId,
          shapeId: "server-rect-1",
        });
      });
    });
  });

  describe("Socket listener setup", () => {
    it("should register shapeDrawn listener on construction", () => {
      const shape: Extract<Shape, { type: "rect" }> = {
        id: "rect-1",
        type: "rect",
        x: 100,
        y: 100,
        width: 50,
        height: 50,
      };

      new AddShapeCommand(
        shapesRef,
        boardId,
        mockSocket as unknown as Socket,
        shape,
        userId,
      );

      expect(mockSocket.once).toHaveBeenCalledWith(
        "shapeDrawn",
        expect.any(Function),
      );
    });

    it("should register listener exactly once", () => {
      const shape: Extract<Shape, { type: "rect" }> = {
        id: "rect-1",
        type: "rect",
        x: 100,
        y: 100,
        width: 50,
        height: 50,
      };

      new AddShapeCommand(
        shapesRef,
        boardId,
        mockSocket as unknown as Socket,
        shape,
        userId,
      );

      expect(mockSocket.once).toHaveBeenCalledTimes(1);
    });
  });

  describe("Property-based tests", () => {
    describe("Property 14: AddShapeCommand Undo Removes Shape", () => {
      // Feature: canvas-engine-testing, Property 14: AddShapeCommand Undo Removes Shape
      it("should remove shape from array after execute followed by undo", () => {
        const { arbShape } = require("../../test-utils/generators");
        const fc = require("fast-check");

        fc.assert(
          fc.property(arbShape, (shape: Shape) => {
            // Setup fresh mocks for each iteration
            const mockSocket = createMockSocket();
            const shapesRef = createMockShapesRef<Shape>([]);
            const boardId = "test-board-id";
            const userId = "test-user-id";

            // Create command
            const command = new AddShapeCommand(
              shapesRef,
              boardId,
              mockSocket as unknown as Socket,
              shape,
              userId,
            );

            // Execute command
            command.execute();

            // Simulate server response with a server-assigned ID
            const serverShape = { ...shape, id: `server-${shape.id}` };
            shapesRef.current = [serverShape];

            // Trigger the shapeDrawn listener
            const onceCallback = mockSocket.once.mock.calls[0][1];
            onceCallback(serverShape);

            // Clear socket emit calls from execute
            mockSocket.emit.mockClear();

            // Undo command
            command.undo();

            // Verify shape is removed from array
            expect(shapesRef.current).toHaveLength(0);
            expect(shapesRef.current).not.toContainEqual(serverShape);

            // Verify deleteShape event was emitted
            expect(mockSocket.emit).toHaveBeenCalledWith("deleteShape", {
              boardId: boardId,
              shapeId: serverShape.id,
            });

            // Verify deleteShape was called exactly once
            expect(mockSocket.emit).toHaveBeenCalledTimes(1);
          }),
          { numRuns: 100 },
        );
      });

      it("should handle undo for all shape types (rectangles, ovals, arrows)", () => {
        const {
          arbRectangle,
          arbOval,
          arbArrow,
        } = require("../../test-utils/generators");
        const fc = require("fast-check");

        fc.assert(
          fc.property(
            fc.oneof(arbRectangle, arbOval, arbArrow),
            (shape: Shape) => {
              // Setup fresh mocks for each iteration
              const mockSocket = createMockSocket();
              const shapesRef = createMockShapesRef<Shape>([]);
              const boardId = "test-board-id";
              const userId = "test-user-id";

              // Create and execute command
              const command = new AddShapeCommand(
                shapesRef,
                boardId,
                mockSocket as unknown as Socket,
                shape,
                userId,
              );

              command.execute();

              // Simulate server response
              const serverShape = { ...shape, id: `server-${shape.id}` };
              shapesRef.current = [serverShape];

              const onceCallback = mockSocket.once.mock.calls[0][1];
              onceCallback(serverShape);

              mockSocket.emit.mockClear();

              // Undo command
              command.undo();

              // Verify shape is removed regardless of type
              expect(shapesRef.current).toHaveLength(0);
              expect(mockSocket.emit).toHaveBeenCalledWith("deleteShape", {
                boardId: boardId,
                shapeId: serverShape.id,
              });
            },
          ),
          { numRuns: 100 },
        );
      });

      it("should only remove the specific shape when multiple shapes exist", () => {
        const { arbShape } = require("../../test-utils/generators");
        const fc = require("fast-check");

        fc.assert(
          fc.property(
            arbShape,
            arbShape,
            (shapeToAdd: Shape, existingShape: Shape) => {
              // Ensure shapes have different IDs
              fc.pre(shapeToAdd.id !== existingShape.id);

              // Setup fresh mocks for each iteration
              const mockSocket = createMockSocket();
              const shapesRef = createMockShapesRef<Shape>([existingShape]);
              const boardId = "test-board-id";
              const userId = "test-user-id";

              // Create and execute command
              const command = new AddShapeCommand(
                shapesRef,
                boardId,
                mockSocket as unknown as Socket,
                shapeToAdd,
                userId,
              );

              command.execute();

              // Simulate server response
              const serverShape = {
                ...shapeToAdd,
                id: `server-${shapeToAdd.id}`,
              };
              shapesRef.current = [existingShape, serverShape];

              const onceCallback = mockSocket.once.mock.calls[0][1];
              onceCallback(serverShape);

              mockSocket.emit.mockClear();

              // Undo command
              command.undo();

              // Verify only the added shape is removed
              expect(shapesRef.current).toHaveLength(1);
              expect(shapesRef.current[0]).toEqual(existingShape);
              expect(shapesRef.current).not.toContainEqual(serverShape);

              // Verify correct shape ID was used for deletion
              expect(mockSocket.emit).toHaveBeenCalledWith("deleteShape", {
                boardId: boardId,
                shapeId: serverShape.id,
              });
            },
          ),
          { numRuns: 100 },
        );
      });
    });
  });
});
