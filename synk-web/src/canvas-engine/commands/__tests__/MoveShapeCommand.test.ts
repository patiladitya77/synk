import { MoveShapeCommand } from "../MoveShapeCommand";
import { Shape } from "../../types";
import { Socket } from "socket.io-client";
import React from "react";
import * as fc from "fast-check";
import {
  arbShape,
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

describe("MoveShapeCommand", () => {
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
      it("should update rectangle position in shapes array", () => {
        const oldRectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 200,
          width: 80,
          height: 60,
        };

        const newRectangle: Extract<Shape, { type: "rect" }> = {
          ...oldRectangle,
          x: 150,
          y: 250,
        };

        shapesRef.current = [oldRectangle];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldRectangle,
          newRectangle,
        );

        command.execute();

        expect(shapesRef.current).toHaveLength(1);
        expect(shapesRef.current[0].x).toBe(150);
        expect(shapesRef.current[0].y).toBe(250);
      });

      it("should emit updateShape event with correct payload for rectangle", () => {
        const oldRectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 200,
          width: 80,
          height: 60,
        };

        const newRectangle: Extract<Shape, { type: "rect" }> = {
          ...oldRectangle,
          x: 150,
          y: 250,
        };

        shapesRef.current = [oldRectangle];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldRectangle,
          newRectangle,
        );

        command.execute();

        expect(mockSocket.emit).toHaveBeenCalledWith("updateShape", {
          boardId: boardId,
          shape: expect.objectContaining({
            id: "rect-1",
            type: "rect",
            x: 150,
            y: 250,
            width: 80,
            height: 60,
          }),
        });
      });

      it("should preserve rectangle width and height", () => {
        const oldRectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 200,
          width: 80,
          height: 60,
        };

        const newRectangle: Extract<Shape, { type: "rect" }> = {
          ...oldRectangle,
          x: 300,
          y: 400,
        };

        shapesRef.current = [oldRectangle];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldRectangle,
          newRectangle,
        );

        command.execute();

        const movedShape = shapesRef.current[0] as Extract<
          Shape,
          { type: "rect" }
        >;
        expect(movedShape.width).toBe(80);
        expect(movedShape.height).toBe(60);
      });

      it("should preserve rectangle type and id", () => {
        const oldRectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 200,
          width: 80,
          height: 60,
        };

        const newRectangle: Extract<Shape, { type: "rect" }> = {
          ...oldRectangle,
          x: 200,
          y: 300,
        };

        shapesRef.current = [oldRectangle];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldRectangle,
          newRectangle,
        );

        command.execute();

        const movedShape = shapesRef.current[0];
        expect(movedShape.id).toBe("rect-1");
        expect(movedShape.type).toBe("rect");
      });

      it("should preserve optional styling properties", () => {
        const oldRectangle: Extract<Shape, { type: "rect" }> = {
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

        const newRectangle: Extract<Shape, { type: "rect" }> = {
          ...oldRectangle,
          x: 150,
          y: 250,
        };

        shapesRef.current = [oldRectangle];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldRectangle,
          newRectangle,
        );

        command.execute();

        const movedShape = shapesRef.current[0] as Extract<
          Shape,
          { type: "rect" }
        >;
        expect(movedShape.fill).toBe("#FF0000");
        expect(movedShape.stroke).toBe("#000000");
        expect(movedShape.strokeWidth).toBe(2);
      });
    });

    describe("Oval shapes", () => {
      it("should update oval position in shapes array", () => {
        const oldOval: Extract<Shape, { type: "oval" }> = {
          id: "oval-1",
          type: "oval",
          x: 150,
          y: 250,
          width: 90,
          height: 70,
        };

        const newOval: Extract<Shape, { type: "oval" }> = {
          ...oldOval,
          x: 200,
          y: 300,
        };

        shapesRef.current = [oldOval];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldOval,
          newOval,
        );

        command.execute();

        expect(shapesRef.current).toHaveLength(1);
        expect(shapesRef.current[0].x).toBe(200);
        expect(shapesRef.current[0].y).toBe(300);
      });

      it("should emit updateShape event with correct payload for oval", () => {
        const oldOval: Extract<Shape, { type: "oval" }> = {
          id: "oval-1",
          type: "oval",
          x: 150,
          y: 250,
          width: 90,
          height: 70,
        };

        const newOval: Extract<Shape, { type: "oval" }> = {
          ...oldOval,
          x: 200,
          y: 300,
        };

        shapesRef.current = [oldOval];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldOval,
          newOval,
        );

        command.execute();

        expect(mockSocket.emit).toHaveBeenCalledWith("updateShape", {
          boardId: boardId,
          shape: expect.objectContaining({
            id: "oval-1",
            type: "oval",
            x: 200,
            y: 300,
            width: 90,
            height: 70,
          }),
        });
      });

      it("should preserve oval width and height", () => {
        const oldOval: Extract<Shape, { type: "oval" }> = {
          id: "oval-1",
          type: "oval",
          x: 150,
          y: 250,
          width: 90,
          height: 70,
        };

        const newOval: Extract<Shape, { type: "oval" }> = {
          ...oldOval,
          x: 300,
          y: 400,
        };

        shapesRef.current = [oldOval];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldOval,
          newOval,
        );

        command.execute();

        const movedShape = shapesRef.current[0] as Extract<
          Shape,
          { type: "oval" }
        >;
        expect(movedShape.width).toBe(90);
        expect(movedShape.height).toBe(70);
      });
    });

    describe("Arrow shapes", () => {
      it("should update arrow position in shapes array", () => {
        const oldArrow: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-1",
          type: "arrow",
          x1: 100,
          y1: 100,
          x2: 200,
          y2: 200,
        };

        const newArrow: Extract<Shape, { type: "arrow" }> = {
          ...oldArrow,
          x1: 150,
          y1: 150,
          x2: 250,
          y2: 250,
        };

        shapesRef.current = [oldArrow];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldArrow,
          newArrow,
        );

        command.execute();

        const movedArrow = shapesRef.current[0] as Extract<
          Shape,
          { type: "arrow" }
        >;
        expect(movedArrow.x1).toBe(150);
        expect(movedArrow.y1).toBe(150);
        expect(movedArrow.x2).toBe(250);
        expect(movedArrow.y2).toBe(250);
      });

      it("should emit updateShape event with correct payload for arrow", () => {
        const oldArrow: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-1",
          type: "arrow",
          x1: 100,
          y1: 100,
          x2: 200,
          y2: 200,
        };

        const newArrow: Extract<Shape, { type: "arrow" }> = {
          ...oldArrow,
          x1: 150,
          y1: 150,
          x2: 250,
          y2: 250,
        };

        shapesRef.current = [oldArrow];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldArrow,
          newArrow,
        );

        command.execute();

        expect(mockSocket.emit).toHaveBeenCalledWith("updateShape", {
          boardId: boardId,
          shape: expect.objectContaining({
            id: "arrow-1",
            type: "arrow",
            x1: 150,
            y1: 150,
            x2: 250,
            y2: 250,
          }),
        });
      });

      it("should preserve arrow connection properties", () => {
        const oldArrow: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-1",
          type: "arrow",
          x1: 100,
          y1: 100,
          x2: 200,
          y2: 200,
          fromShapeId: "rect-1",
          fromPort: "e",
          toShapeId: "rect-2",
          toPort: "w",
        };

        const newArrow: Extract<Shape, { type: "arrow" }> = {
          ...oldArrow,
          x1: 150,
          y1: 150,
          x2: 250,
          y2: 250,
        };

        shapesRef.current = [oldArrow];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldArrow,
          newArrow,
        );

        command.execute();

        const movedArrow = shapesRef.current[0] as Extract<
          Shape,
          { type: "arrow" }
        >;
        expect(movedArrow.fromShapeId).toBe("rect-1");
        expect(movedArrow.fromPort).toBe("e");
        expect(movedArrow.toShapeId).toBe("rect-2");
        expect(movedArrow.toPort).toBe("w");
      });
    });

    describe("Socket event emission", () => {
      it("should emit updateShape event exactly once", () => {
        const oldShape: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        const newShape: Extract<Shape, { type: "rect" }> = {
          ...oldShape,
          x: 200,
          y: 200,
        };

        shapesRef.current = [oldShape];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldShape,
          newShape,
        );

        command.execute();

        expect(mockSocket.emit).toHaveBeenCalledTimes(1);
        expect(mockSocket.emit).toHaveBeenCalledWith(
          "updateShape",
          expect.any(Object),
        );
      });

      it("should include boardId in socket payload", () => {
        const oldShape: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        const newShape: Extract<Shape, { type: "rect" }> = {
          ...oldShape,
          x: 200,
          y: 200,
        };

        shapesRef.current = [oldShape];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldShape,
          newShape,
        );

        command.execute();

        expect(mockSocket.emit).toHaveBeenCalledWith(
          "updateShape",
          expect.objectContaining({
            boardId: boardId,
          }),
        );
      });

      it("should include shape in socket payload", () => {
        const oldShape: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        const newShape: Extract<Shape, { type: "rect" }> = {
          ...oldShape,
          x: 200,
          y: 200,
        };

        shapesRef.current = [oldShape];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldShape,
          newShape,
        );

        command.execute();

        expect(mockSocket.emit).toHaveBeenCalledWith(
          "updateShape",
          expect.objectContaining({
            shape: expect.objectContaining({
              id: "rect-1",
              x: 200,
              y: 200,
            }),
          }),
        );
      });
    });

    describe("Multiple shapes in array", () => {
      it("should only update the target shape", () => {
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

        const newShape2: Extract<Shape, { type: "rect" }> = {
          ...shape2,
          x: 250,
          y: 250,
        };

        shapesRef.current = [shape1, shape2, shape3];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          shape2,
          newShape2,
        );

        command.execute();

        expect(shapesRef.current).toHaveLength(3);
        expect(shapesRef.current[0]).toEqual(shape1);
        expect(shapesRef.current[1].x).toBe(250);
        expect(shapesRef.current[1].y).toBe(250);
        expect(shapesRef.current[2]).toEqual(shape3);
      });
    });

    describe("Edge cases", () => {
      it("should handle moving shape that doesn't exist in array", () => {
        const oldShape: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        const newShape: Extract<Shape, { type: "rect" }> = {
          ...oldShape,
          x: 200,
          y: 200,
        };

        shapesRef.current = [];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldShape,
          newShape,
        );

        expect(() => command.execute()).not.toThrow();
        expect(mockSocket.emit).toHaveBeenCalledWith("updateShape", {
          boardId: boardId,
          shape: newShape,
        });
      });
    });
  });

  describe("undo", () => {
    describe("Rectangle shapes", () => {
      it("should restore rectangle to original position", () => {
        const oldRectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 200,
          width: 80,
          height: 60,
        };

        const newRectangle: Extract<Shape, { type: "rect" }> = {
          ...oldRectangle,
          x: 150,
          y: 250,
        };

        shapesRef.current = [oldRectangle];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldRectangle,
          newRectangle,
        );

        command.execute();
        expect(shapesRef.current[0].x).toBe(150);
        expect(shapesRef.current[0].y).toBe(250);

        mockSocket.emit.mockClear();
        command.undo();

        expect(shapesRef.current[0].x).toBe(100);
        expect(shapesRef.current[0].y).toBe(200);
      });

      it("should emit updateShape event with old position", () => {
        const oldRectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 200,
          width: 80,
          height: 60,
        };

        const newRectangle: Extract<Shape, { type: "rect" }> = {
          ...oldRectangle,
          x: 150,
          y: 250,
        };

        shapesRef.current = [oldRectangle];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldRectangle,
          newRectangle,
        );

        command.execute();
        mockSocket.emit.mockClear();
        command.undo();

        expect(mockSocket.emit).toHaveBeenCalledWith("updateShape", {
          boardId: boardId,
          shape: expect.objectContaining({
            id: "rect-1",
            type: "rect",
            x: 100,
            y: 200,
            width: 80,
            height: 60,
          }),
        });
      });

      it("should preserve all rectangle properties during undo", () => {
        const oldRectangle: Extract<Shape, { type: "rect" }> = {
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

        const newRectangle: Extract<Shape, { type: "rect" }> = {
          ...oldRectangle,
          x: 150,
          y: 250,
        };

        shapesRef.current = [oldRectangle];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldRectangle,
          newRectangle,
        );

        command.execute();
        command.undo();

        const restoredShape = shapesRef.current[0] as Extract<
          Shape,
          { type: "rect" }
        >;
        expect(restoredShape).toEqual(oldRectangle);
        expect(restoredShape.fill).toBe("#FF0000");
        expect(restoredShape.stroke).toBe("#000000");
        expect(restoredShape.strokeWidth).toBe(2);
      });
    });

    describe("Oval shapes", () => {
      it("should restore oval to original position", () => {
        const oldOval: Extract<Shape, { type: "oval" }> = {
          id: "oval-1",
          type: "oval",
          x: 150,
          y: 250,
          width: 90,
          height: 70,
        };

        const newOval: Extract<Shape, { type: "oval" }> = {
          ...oldOval,
          x: 200,
          y: 300,
        };

        shapesRef.current = [oldOval];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldOval,
          newOval,
        );

        command.execute();
        expect(shapesRef.current[0].x).toBe(200);
        expect(shapesRef.current[0].y).toBe(300);

        mockSocket.emit.mockClear();
        command.undo();

        expect(shapesRef.current[0].x).toBe(150);
        expect(shapesRef.current[0].y).toBe(250);
      });

      it("should emit updateShape event with old position for oval", () => {
        const oldOval: Extract<Shape, { type: "oval" }> = {
          id: "oval-1",
          type: "oval",
          x: 150,
          y: 250,
          width: 90,
          height: 70,
        };

        const newOval: Extract<Shape, { type: "oval" }> = {
          ...oldOval,
          x: 200,
          y: 300,
        };

        shapesRef.current = [oldOval];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldOval,
          newOval,
        );

        command.execute();
        mockSocket.emit.mockClear();
        command.undo();

        expect(mockSocket.emit).toHaveBeenCalledWith("updateShape", {
          boardId: boardId,
          shape: expect.objectContaining({
            id: "oval-1",
            type: "oval",
            x: 150,
            y: 250,
            width: 90,
            height: 70,
          }),
        });
      });
    });

    describe("Arrow shapes", () => {
      it("should restore arrow to original position", () => {
        const oldArrow: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-1",
          type: "arrow",
          x1: 100,
          y1: 100,
          x2: 200,
          y2: 200,
        };

        const newArrow: Extract<Shape, { type: "arrow" }> = {
          ...oldArrow,
          x1: 150,
          y1: 150,
          x2: 250,
          y2: 250,
        };

        shapesRef.current = [oldArrow];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldArrow,
          newArrow,
        );

        command.execute();
        const movedArrow = shapesRef.current[0] as Extract<
          Shape,
          { type: "arrow" }
        >;
        expect(movedArrow.x1).toBe(150);
        expect(movedArrow.y1).toBe(150);
        expect(movedArrow.x2).toBe(250);
        expect(movedArrow.y2).toBe(250);

        mockSocket.emit.mockClear();
        command.undo();

        const restoredArrow = shapesRef.current[0] as Extract<
          Shape,
          { type: "arrow" }
        >;
        expect(restoredArrow.x1).toBe(100);
        expect(restoredArrow.y1).toBe(100);
        expect(restoredArrow.x2).toBe(200);
        expect(restoredArrow.y2).toBe(200);
      });

      it("should emit updateShape event with old position for arrow", () => {
        const oldArrow: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-1",
          type: "arrow",
          x1: 100,
          y1: 100,
          x2: 200,
          y2: 200,
        };

        const newArrow: Extract<Shape, { type: "arrow" }> = {
          ...oldArrow,
          x1: 150,
          y1: 150,
          x2: 250,
          y2: 250,
        };

        shapesRef.current = [oldArrow];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldArrow,
          newArrow,
        );

        command.execute();
        mockSocket.emit.mockClear();
        command.undo();

        expect(mockSocket.emit).toHaveBeenCalledWith("updateShape", {
          boardId: boardId,
          shape: expect.objectContaining({
            id: "arrow-1",
            type: "arrow",
            x1: 100,
            y1: 100,
            x2: 200,
            y2: 200,
          }),
        });
      });
    });

    describe("Socket event emission", () => {
      it("should emit updateShape event exactly once on undo", () => {
        const oldShape: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        const newShape: Extract<Shape, { type: "rect" }> = {
          ...oldShape,
          x: 200,
          y: 200,
        };

        shapesRef.current = [oldShape];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldShape,
          newShape,
        );

        command.execute();
        mockSocket.emit.mockClear();
        command.undo();

        expect(mockSocket.emit).toHaveBeenCalledTimes(1);
        expect(mockSocket.emit).toHaveBeenCalledWith(
          "updateShape",
          expect.any(Object),
        );
      });
    });

    describe("Multiple undo operations", () => {
      it("should handle multiple undo calls correctly", () => {
        const oldShape: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        const newShape: Extract<Shape, { type: "rect" }> = {
          ...oldShape,
          x: 200,
          y: 200,
        };

        shapesRef.current = [oldShape];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldShape,
          newShape,
        );

        command.execute();
        command.undo();
        command.undo(); // Second undo

        // Shape should still be at original position
        expect(shapesRef.current[0].x).toBe(100);
        expect(shapesRef.current[0].y).toBe(100);
      });
    });

    describe("Undo with other shapes present", () => {
      it("should restore shape position while preserving other shapes", () => {
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

        const newShape2: Extract<Shape, { type: "rect" }> = {
          ...shape2,
          x: 250,
          y: 250,
        };

        shapesRef.current = [shape1, shape2, shape3];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          shape2,
          newShape2,
        );

        command.execute();
        expect(shapesRef.current[1].x).toBe(250);
        expect(shapesRef.current[1].y).toBe(250);

        command.undo();

        expect(shapesRef.current).toHaveLength(3);
        expect(shapesRef.current[0]).toEqual(shape1);
        expect(shapesRef.current[1]).toEqual(shape2);
        expect(shapesRef.current[2]).toEqual(shape3);
      });
    });
  });

  describe("Execute-Undo round-trip", () => {
    it("should restore exact state after execute-undo for rectangle", () => {
      const oldRectangle: Extract<Shape, { type: "rect" }> = {
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

      const newRectangle: Extract<Shape, { type: "rect" }> = {
        ...oldRectangle,
        x: 150,
        y: 250,
      };

      shapesRef.current = [oldRectangle];
      const initialState = JSON.parse(JSON.stringify(shapesRef.current));

      const command = new MoveShapeCommand(
        shapesRef,
        boardId,
        mockSocket as unknown as Socket,
        oldRectangle,
        newRectangle,
      );

      command.execute();
      command.undo();

      expect(shapesRef.current).toEqual(initialState);
    });

    it("should restore exact state after execute-undo for oval", () => {
      const oldOval: Extract<Shape, { type: "oval" }> = {
        id: "oval-1",
        type: "oval",
        x: 150,
        y: 250,
        width: 90,
        height: 70,
        fill: "#00FF00",
      };

      const newOval: Extract<Shape, { type: "oval" }> = {
        ...oldOval,
        x: 200,
        y: 300,
      };

      shapesRef.current = [oldOval];
      const initialState = JSON.parse(JSON.stringify(shapesRef.current));

      const command = new MoveShapeCommand(
        shapesRef,
        boardId,
        mockSocket as unknown as Socket,
        oldOval,
        newOval,
      );

      command.execute();
      command.undo();

      expect(shapesRef.current).toEqual(initialState);
    });

    it("should restore exact state after execute-undo for arrow", () => {
      const oldArrow: Extract<Shape, { type: "arrow" }> = {
        id: "arrow-1",
        type: "arrow",
        x1: 100,
        y1: 100,
        x2: 200,
        y2: 200,
        stroke: "#0000FF",
        strokeWidth: 3,
      };

      const newArrow: Extract<Shape, { type: "arrow" }> = {
        ...oldArrow,
        x1: 150,
        y1: 150,
        x2: 250,
        y2: 250,
      };

      shapesRef.current = [oldArrow];
      const initialState = JSON.parse(JSON.stringify(shapesRef.current));

      const command = new MoveShapeCommand(
        shapesRef,
        boardId,
        mockSocket as unknown as Socket,
        oldArrow,
        newArrow,
      );

      command.execute();
      command.undo();

      expect(shapesRef.current).toEqual(initialState);
    });
  });

  describe("Property-Based Tests", () => {
    describe("Property 19: MoveShapeCommand Execution Updates Position", () => {
      // Feature: canvas-engine-testing, Property 19: MoveShapeCommand Execution Updates Position
      it("should update shape position while preserving all other properties", () => {
        fc.assert(
          fc.property(
            arbShape,
            arbCoordinate,
            arbCoordinate,
            (shape, newX, newY) => {
              // Setup
              mockSocket = createMockSocket();
              shapesRef = createMockShapesRef([shape]);

              // Create new shape with updated position
              let newShape: Shape;
              if (shape.type === "rect" || shape.type === "oval") {
                newShape = { ...shape, x: newX, y: newY };
              } else {
                // For arrows, update both endpoints
                const dx =
                  newX - (shape as Extract<Shape, { type: "arrow" }>).x1;
                const dy =
                  newY - (shape as Extract<Shape, { type: "arrow" }>).y1;
                newShape = {
                  ...shape,
                  x1: newX,
                  y1: newY,
                  x2: (shape as Extract<Shape, { type: "arrow" }>).x2 + dx,
                  y2: (shape as Extract<Shape, { type: "arrow" }>).y2 + dy,
                };
              }

              // Create and execute command
              const command = new MoveShapeCommand(
                shapesRef,
                boardId,
                mockSocket as unknown as Socket,
                shape,
                newShape,
              );

              command.execute();

              // Verify position is updated
              const updatedShape = shapesRef.current[0];
              if (
                updatedShape.type === "rect" ||
                updatedShape.type === "oval"
              ) {
                expect(updatedShape.x).toBe(newX);
                expect(updatedShape.y).toBe(newY);
                // Verify width and height unchanged
                expect(updatedShape.width).toBe(
                  (shape as Extract<Shape, { type: "rect" | "oval" }>).width,
                );
                expect(updatedShape.height).toBe(
                  (shape as Extract<Shape, { type: "rect" | "oval" }>).height,
                );
              } else {
                expect(
                  (updatedShape as Extract<Shape, { type: "arrow" }>).x1,
                ).toBe(newX);
                expect(
                  (updatedShape as Extract<Shape, { type: "arrow" }>).y1,
                ).toBe(newY);
              }

              // Verify type and id unchanged
              expect(updatedShape.type).toBe(shape.type);
              expect(updatedShape.id).toBe(shape.id);

              // Verify socket emits updateShape event
              expect(mockSocket.emit).toHaveBeenCalledWith(
                "updateShape",
                expect.objectContaining({
                  boardId: boardId,
                  shape: expect.objectContaining({
                    id: shape.id,
                    type: shape.type,
                  }),
                }),
              );
            },
          ),
          { numRuns: 100 },
        );
      });

      // Feature: canvas-engine-testing, Property 19: MoveShapeCommand Execution Updates Position
      it("should update position for all shape types (rectangles, ovals, arrows)", () => {
        fc.assert(
          fc.property(
            fc.oneof(arbRectangle, arbOval, arbArrow),
            arbCoordinate,
            arbCoordinate,
            (shape, newX, newY) => {
              // Setup
              mockSocket = createMockSocket();
              shapesRef = createMockShapesRef([shape]);

              // Create new shape with updated position
              let newShape: Shape;
              if (shape.type === "rect" || shape.type === "oval") {
                newShape = { ...shape, x: newX, y: newY };
              } else {
                const dx = newX - shape.x1;
                const dy = newY - shape.y1;
                newShape = {
                  ...shape,
                  x1: newX,
                  y1: newY,
                  x2: shape.x2 + dx,
                  y2: shape.y2 + dy,
                };
              }

              // Create and execute command
              const command = new MoveShapeCommand(
                shapesRef,
                boardId,
                mockSocket as unknown as Socket,
                shape,
                newShape,
              );

              command.execute();

              // Verify shape is updated in array
              expect(shapesRef.current).toHaveLength(1);
              const updatedShape = shapesRef.current[0];

              // Verify position is updated based on shape type
              if (
                updatedShape.type === "rect" ||
                updatedShape.type === "oval"
              ) {
                expect(updatedShape.x).toBe(newX);
                expect(updatedShape.y).toBe(newY);
              } else {
                expect(
                  (updatedShape as Extract<Shape, { type: "arrow" }>).x1,
                ).toBe(newX);
                expect(
                  (updatedShape as Extract<Shape, { type: "arrow" }>).y1,
                ).toBe(newY);
              }

              // Verify socket event
              expect(mockSocket.emit).toHaveBeenCalledWith(
                "updateShape",
                expect.any(Object),
              );
            },
          ),
          { numRuns: 100 },
        );
      });
    });

    describe("Property 20: MoveShapeCommand Round-Trip", () => {
      // Feature: canvas-engine-testing, Property 20: MoveShapeCommand Round-Trip
      it("should restore exact original position after execute-undo", () => {
        fc.assert(
          fc.property(
            arbShape,
            arbCoordinate,
            arbCoordinate,
            (shape, newX, newY) => {
              // Setup
              mockSocket = createMockSocket();
              shapesRef = createMockShapesRef([shape]);
              const initialState = JSON.parse(
                JSON.stringify(shapesRef.current),
              );

              // Create new shape with updated position
              let newShape: Shape;
              if (shape.type === "rect" || shape.type === "oval") {
                newShape = { ...shape, x: newX, y: newY };
              } else {
                const dx =
                  newX - (shape as Extract<Shape, { type: "arrow" }>).x1;
                const dy =
                  newY - (shape as Extract<Shape, { type: "arrow" }>).y1;
                newShape = {
                  ...shape,
                  x1: newX,
                  y1: newY,
                  x2: (shape as Extract<Shape, { type: "arrow" }>).x2 + dx,
                  y2: (shape as Extract<Shape, { type: "arrow" }>).y2 + dy,
                };
              }

              // Create and execute command
              const command = new MoveShapeCommand(
                shapesRef,
                boardId,
                mockSocket as unknown as Socket,
                shape,
                newShape,
              );

              command.execute();

              // Clear socket emit calls from execute
              mockSocket.emit.mockClear();

              // Undo
              command.undo();

              // Verify exact state restoration
              expect(shapesRef.current).toEqual(initialState);

              // Verify all properties unchanged
              const restoredShape = shapesRef.current[0];
              expect(restoredShape).toEqual(shape);
              expect(restoredShape.id).toBe(shape.id);
              expect(restoredShape.type).toBe(shape.type);

              // Verify socket emits updateShape event with old position
              expect(mockSocket.emit).toHaveBeenCalledWith(
                "updateShape",
                expect.objectContaining({
                  boardId: boardId,
                  shape: expect.objectContaining({
                    id: shape.id,
                    type: shape.type,
                  }),
                }),
              );
            },
          ),
          { numRuns: 100 },
        );
      });

      // Feature: canvas-engine-testing, Property 20: MoveShapeCommand Round-Trip
      it("should handle round-trip for all shape types", () => {
        fc.assert(
          fc.property(
            fc.oneof(arbRectangle, arbOval, arbArrow),
            arbCoordinate,
            arbCoordinate,
            (shape, newX, newY) => {
              // Setup
              mockSocket = createMockSocket();
              shapesRef = createMockShapesRef([shape]);

              // Create new shape with updated position
              let newShape: Shape;
              if (shape.type === "rect" || shape.type === "oval") {
                newShape = { ...shape, x: newX, y: newY };
              } else {
                const dx = newX - shape.x1;
                const dy = newY - shape.y1;
                newShape = {
                  ...shape,
                  x1: newX,
                  y1: newY,
                  x2: shape.x2 + dx,
                  y2: shape.y2 + dy,
                };
              }

              // Create and execute command
              const command = new MoveShapeCommand(
                shapesRef,
                boardId,
                mockSocket as unknown as Socket,
                shape,
                newShape,
              );

              command.execute();
              command.undo();

              // Verify shape is restored to original state
              expect(shapesRef.current).toHaveLength(1);
              expect(shapesRef.current[0]).toEqual(shape);
            },
          ),
          { numRuns: 100 },
        );
      });

      // Feature: canvas-engine-testing, Property 20: MoveShapeCommand Round-Trip
      it("should preserve shape in array with other shapes during round-trip", () => {
        fc.assert(
          fc.property(
            arbShape,
            fc.array(arbShape, { minLength: 0, maxLength: 10 }),
            arbCoordinate,
            arbCoordinate,
            (shapeToMove, otherShapes, newX, newY) => {
              // Ensure shapeToMove has unique ID
              const uniqueOtherShapes = otherShapes.filter(
                (s) => s.id !== shapeToMove.id,
              );

              // Setup
              mockSocket = createMockSocket();
              shapesRef = createMockShapesRef([
                ...uniqueOtherShapes,
                shapeToMove,
              ]);
              const initialLength = shapesRef.current.length;

              // Create new shape with updated position
              let newShape: Shape;
              if (shapeToMove.type === "rect" || shapeToMove.type === "oval") {
                newShape = { ...shapeToMove, x: newX, y: newY };
              } else {
                const dx =
                  newX - (shapeToMove as Extract<Shape, { type: "arrow" }>).x1;
                const dy =
                  newY - (shapeToMove as Extract<Shape, { type: "arrow" }>).y1;
                newShape = {
                  ...shapeToMove,
                  x1: newX,
                  y1: newY,
                  x2:
                    (shapeToMove as Extract<Shape, { type: "arrow" }>).x2 + dx,
                  y2:
                    (shapeToMove as Extract<Shape, { type: "arrow" }>).y2 + dy,
                };
              }

              // Create and execute command
              const command = new MoveShapeCommand(
                shapesRef,
                boardId,
                mockSocket as unknown as Socket,
                shapeToMove,
                newShape,
              );

              command.execute();
              command.undo();

              // Verify shape count is unchanged
              expect(shapesRef.current).toHaveLength(initialLength);

              // Verify moved shape is restored
              const restoredShape = shapesRef.current.find(
                (s) => s.id === shapeToMove.id,
              );
              expect(restoredShape).toEqual(shapeToMove);

              // Verify other shapes are unchanged
              uniqueOtherShapes.forEach((otherShape) => {
                expect(shapesRef.current).toContainEqual(otherShape);
              });
            },
          ),
          { numRuns: 100 },
        );
      });
    });
  });

  describe("Shape property invariants", () => {
    describe("Shape ID remains unchanged through move operations", () => {
      it("should preserve shape ID when moving rectangle", () => {
        const oldRectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-unique-id-123",
          type: "rect",
          x: 100,
          y: 200,
          width: 80,
          height: 60,
        };

        const newRectangle: Extract<Shape, { type: "rect" }> = {
          ...oldRectangle,
          x: 150,
          y: 250,
        };

        shapesRef.current = [oldRectangle];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldRectangle,
          newRectangle,
        );

        command.execute();

        const movedShape = shapesRef.current[0];
        expect(movedShape.id).toBe("rect-unique-id-123");
        expect(movedShape.id).toBe(oldRectangle.id);
      });

      it("should preserve shape ID when moving oval", () => {
        const oldOval: Extract<Shape, { type: "oval" }> = {
          id: "oval-unique-id-456",
          type: "oval",
          x: 150,
          y: 250,
          width: 90,
          height: 70,
        };

        const newOval: Extract<Shape, { type: "oval" }> = {
          ...oldOval,
          x: 200,
          y: 300,
        };

        shapesRef.current = [oldOval];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldOval,
          newOval,
        );

        command.execute();

        const movedShape = shapesRef.current[0];
        expect(movedShape.id).toBe("oval-unique-id-456");
        expect(movedShape.id).toBe(oldOval.id);
      });

      it("should preserve shape ID when moving arrow", () => {
        const oldArrow: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-unique-id-789",
          type: "arrow",
          x1: 100,
          y1: 100,
          x2: 200,
          y2: 200,
        };

        const newArrow: Extract<Shape, { type: "arrow" }> = {
          ...oldArrow,
          x1: 150,
          y1: 150,
          x2: 250,
          y2: 250,
        };

        shapesRef.current = [oldArrow];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldArrow,
          newArrow,
        );

        command.execute();

        const movedShape = shapesRef.current[0];
        expect(movedShape.id).toBe("arrow-unique-id-789");
        expect(movedShape.id).toBe(oldArrow.id);
      });

      it("should preserve shape ID after undo", () => {
        const oldShape: Extract<Shape, { type: "rect" }> = {
          id: "rect-id-undo-test",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        const newShape: Extract<Shape, { type: "rect" }> = {
          ...oldShape,
          x: 200,
          y: 200,
        };

        shapesRef.current = [oldShape];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldShape,
          newShape,
        );

        command.execute();
        command.undo();

        const restoredShape = shapesRef.current[0];
        expect(restoredShape.id).toBe("rect-id-undo-test");
        expect(restoredShape.id).toBe(oldShape.id);
      });
    });

    describe("Shape type remains unchanged through move operations", () => {
      it("should preserve shape type when moving rectangle", () => {
        const oldRectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 200,
          width: 80,
          height: 60,
        };

        const newRectangle: Extract<Shape, { type: "rect" }> = {
          ...oldRectangle,
          x: 150,
          y: 250,
        };

        shapesRef.current = [oldRectangle];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldRectangle,
          newRectangle,
        );

        command.execute();

        const movedShape = shapesRef.current[0];
        expect(movedShape.type).toBe("rect");
        expect(movedShape.type).toBe(oldRectangle.type);
      });

      it("should preserve shape type when moving oval", () => {
        const oldOval: Extract<Shape, { type: "oval" }> = {
          id: "oval-1",
          type: "oval",
          x: 150,
          y: 250,
          width: 90,
          height: 70,
        };

        const newOval: Extract<Shape, { type: "oval" }> = {
          ...oldOval,
          x: 200,
          y: 300,
        };

        shapesRef.current = [oldOval];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldOval,
          newOval,
        );

        command.execute();

        const movedShape = shapesRef.current[0];
        expect(movedShape.type).toBe("oval");
        expect(movedShape.type).toBe(oldOval.type);
      });

      it("should preserve shape type when moving arrow", () => {
        const oldArrow: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-1",
          type: "arrow",
          x1: 100,
          y1: 100,
          x2: 200,
          y2: 200,
        };

        const newArrow: Extract<Shape, { type: "arrow" }> = {
          ...oldArrow,
          x1: 150,
          y1: 150,
          x2: 250,
          y2: 250,
        };

        shapesRef.current = [oldArrow];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldArrow,
          newArrow,
        );

        command.execute();

        const movedShape = shapesRef.current[0];
        expect(movedShape.type).toBe("arrow");
        expect(movedShape.type).toBe(oldArrow.type);
      });

      it("should preserve shape type after undo", () => {
        const oldShape: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        const newShape: Extract<Shape, { type: "rect" }> = {
          ...oldShape,
          x: 200,
          y: 200,
        };

        shapesRef.current = [oldShape];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldShape,
          newShape,
        );

        command.execute();
        command.undo();

        const restoredShape = shapesRef.current[0];
        expect(restoredShape.type).toBe("rect");
        expect(restoredShape.type).toBe(oldShape.type);
      });
    });

    describe("Move preserves dimensions", () => {
      it("should preserve width and height when moving rectangle", () => {
        const oldRectangle: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 200,
          width: 80,
          height: 60,
        };

        const newRectangle: Extract<Shape, { type: "rect" }> = {
          ...oldRectangle,
          x: 300,
          y: 400,
        };

        shapesRef.current = [oldRectangle];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldRectangle,
          newRectangle,
        );

        command.execute();

        const movedShape = shapesRef.current[0] as Extract<
          Shape,
          { type: "rect" }
        >;
        expect(movedShape.width).toBe(80);
        expect(movedShape.height).toBe(60);
        expect(movedShape.width).toBe(oldRectangle.width);
        expect(movedShape.height).toBe(oldRectangle.height);
      });

      it("should preserve width and height when moving oval", () => {
        const oldOval: Extract<Shape, { type: "oval" }> = {
          id: "oval-1",
          type: "oval",
          x: 150,
          y: 250,
          width: 90,
          height: 70,
        };

        const newOval: Extract<Shape, { type: "oval" }> = {
          ...oldOval,
          x: 300,
          y: 400,
        };

        shapesRef.current = [oldOval];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldOval,
          newOval,
        );

        command.execute();

        const movedShape = shapesRef.current[0] as Extract<
          Shape,
          { type: "oval" }
        >;
        expect(movedShape.width).toBe(90);
        expect(movedShape.height).toBe(70);
        expect(movedShape.width).toBe(oldOval.width);
        expect(movedShape.height).toBe(oldOval.height);
      });

      it("should preserve dimensions after undo", () => {
        const oldShape: Extract<Shape, { type: "rect" }> = {
          id: "rect-1",
          type: "rect",
          x: 100,
          y: 100,
          width: 50,
          height: 50,
        };

        const newShape: Extract<Shape, { type: "rect" }> = {
          ...oldShape,
          x: 200,
          y: 200,
        };

        shapesRef.current = [oldShape];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldShape,
          newShape,
        );

        command.execute();
        command.undo();

        const restoredShape = shapesRef.current[0] as Extract<
          Shape,
          { type: "rect" }
        >;
        expect(restoredShape.width).toBe(50);
        expect(restoredShape.height).toBe(50);
        expect(restoredShape.width).toBe(oldShape.width);
        expect(restoredShape.height).toBe(oldShape.height);
      });
    });

    describe("Undo restores all properties exactly", () => {
      it("should restore all rectangle properties exactly after undo", () => {
        const oldRectangle: Extract<Shape, { type: "rect" }> = {
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

        const newRectangle: Extract<Shape, { type: "rect" }> = {
          ...oldRectangle,
          x: 150,
          y: 250,
        };

        shapesRef.current = [oldRectangle];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldRectangle,
          newRectangle,
        );

        command.execute();
        command.undo();

        const restoredShape = shapesRef.current[0] as Extract<
          Shape,
          { type: "rect" }
        >;
        expect(restoredShape).toEqual(oldRectangle);
        expect(restoredShape.id).toBe(oldRectangle.id);
        expect(restoredShape.type).toBe(oldRectangle.type);
        expect(restoredShape.x).toBe(oldRectangle.x);
        expect(restoredShape.y).toBe(oldRectangle.y);
        expect(restoredShape.width).toBe(oldRectangle.width);
        expect(restoredShape.height).toBe(oldRectangle.height);
        expect(restoredShape.fill).toBe(oldRectangle.fill);
        expect(restoredShape.stroke).toBe(oldRectangle.stroke);
        expect(restoredShape.strokeWidth).toBe(oldRectangle.strokeWidth);
      });

      it("should restore all oval properties exactly after undo", () => {
        const oldOval: Extract<Shape, { type: "oval" }> = {
          id: "oval-1",
          type: "oval",
          x: 150,
          y: 250,
          width: 90,
          height: 70,
          fill: "#00FF00",
        };

        const newOval: Extract<Shape, { type: "oval" }> = {
          ...oldOval,
          x: 200,
          y: 300,
        };

        shapesRef.current = [oldOval];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldOval,
          newOval,
        );

        command.execute();
        command.undo();

        const restoredShape = shapesRef.current[0] as Extract<
          Shape,
          { type: "oval" }
        >;
        expect(restoredShape).toEqual(oldOval);
        expect(restoredShape.id).toBe(oldOval.id);
        expect(restoredShape.type).toBe(oldOval.type);
        expect(restoredShape.x).toBe(oldOval.x);
        expect(restoredShape.y).toBe(oldOval.y);
        expect(restoredShape.width).toBe(oldOval.width);
        expect(restoredShape.height).toBe(oldOval.height);
        expect(restoredShape.fill).toBe(oldOval.fill);
      });

      it("should restore all arrow properties exactly after undo", () => {
        const oldArrow: Extract<Shape, { type: "arrow" }> = {
          id: "arrow-1",
          type: "arrow",
          x1: 100,
          y1: 100,
          x2: 200,
          y2: 200,
          fromShapeId: "rect-1",
          fromPort: "e",
          toShapeId: "rect-2",
          toPort: "w",
        };

        const newArrow: Extract<Shape, { type: "arrow" }> = {
          ...oldArrow,
          x1: 150,
          y1: 150,
          x2: 250,
          y2: 250,
        };

        shapesRef.current = [oldArrow];

        const command = new MoveShapeCommand(
          shapesRef,
          boardId,
          mockSocket as unknown as Socket,
          oldArrow,
          newArrow,
        );

        command.execute();
        command.undo();

        const restoredArrow = shapesRef.current[0] as Extract<
          Shape,
          { type: "arrow" }
        >;
        expect(restoredArrow).toEqual(oldArrow);
        expect(restoredArrow.id).toBe(oldArrow.id);
        expect(restoredArrow.type).toBe(oldArrow.type);
        expect(restoredArrow.x1).toBe(oldArrow.x1);
        expect(restoredArrow.y1).toBe(oldArrow.y1);
        expect(restoredArrow.x2).toBe(oldArrow.x2);
        expect(restoredArrow.y2).toBe(oldArrow.y2);
        expect(restoredArrow.fromShapeId).toBe(oldArrow.fromShapeId);
        expect(restoredArrow.fromPort).toBe(oldArrow.fromPort);
        expect(restoredArrow.toShapeId).toBe(oldArrow.toShapeId);
        expect(restoredArrow.toPort).toBe(oldArrow.toPort);
      });
    });
  });
});
