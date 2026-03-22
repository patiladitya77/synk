import React from "react";
import { Socket } from "socket.io-client";
import { Shape } from "../types";
import { Command } from "./Command";

export class DeleteShapeCommand implements Command {
  constructor(
    private shapesRef: React.RefObject<Shape[]>,
    private boardId: string,
    private socket: Socket,
    private shape: Shape,
    private userId: string,
  ) {}

  execute(): void {
    this.shapesRef.current = this.shapesRef.current.filter(
      (s) => s.id !== this.shape.id,
    );
    this.socket.emit("deleteShape", {
      boardId: this.boardId,
      shapeId: this.shape.id,
    });
  }

  undo(): void {
    // Optimistically restore locally
    this.shapesRef.current = [...this.shapesRef.current, this.shape];
    // Tell server to flip isDeleted = false — preserves original ID
    this.socket.emit("restoreShape", {
      boardId: this.boardId,
      shapeId: this.shape.id,
    });
  }
}
