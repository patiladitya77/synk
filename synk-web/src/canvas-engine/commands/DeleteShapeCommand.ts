import React from "react";
import { Socket } from "socket.io-client";
import { Shape } from "../types";
import { Command } from "./Command";

export class DeleteShapeCommand implements Command {
  constructor(
    private shapesRef: React.RefObject<Shape[]>,
    private boarId: string,
    private socket: Socket,
    private shape: Shape,
    private userId: string,
  ) {
    // When server confirms recreation (undo), capture the new ID
    // so that a subsequent redo deletes the correct shape
    this.socket.on("shapeDrawn", (serverShape: Shape) => {
      if (serverShape.type === this.shape.type) {
        // Update local ref and stored shape to use the new server-assigned ID
        const idx = this.shapesRef.current.findIndex(
          (s) => s.id === this.shape.id,
        );
        if (idx !== -1) {
          this.shapesRef.current[idx] = { ...serverShape };
        }
        this.shape = { ...serverShape };
      }
    });
  }

  execute(): void {
    this.shapesRef.current = this.shapesRef.current.filter(
      (s) => s.id !== this.shape.id,
    );
    this.socket.emit("deleteShape", {
      boardId: this.boarId,
      shapeId: this.shape.id,
    });
  }

  undo(): void {
    this.shapesRef.current = [...this.shapesRef.current, this.shape];
    this.socket.emit("drawShape", {
      boardId: this.boarId,
      shape: this.shape,
      userId: this.userId,
    });
  }
}
