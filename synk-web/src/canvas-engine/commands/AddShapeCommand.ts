import React from "react";
import { Shape } from "../types";
import { Socket } from "socket.io-client";
import { Command } from "./Command";

export class AddShapeCommand implements Command {
  private committedShape: Shape | null = null; // will hold the server-assigned id
  constructor(
    private shapesRef: React.RefObject<Shape[]>,
    private boardId: string,
    private socket: Socket,
    private shape: Shape,
    private userId: string,
  ) {
    // Listen for the server's response and capture the real id
    this.socket.once("shapeDrawn", (serverShape: Shape) => {
      // Make sure it's our shape (same type + position)
      if (serverShape.type === this.shape.type) {
        this.committedShape = serverShape;
      }
    });
  }
  execute(): void {
    console.log(this.shape);
    this.socket.emit("drawShape", {
      userId: this.userId,
      boardId: this.boardId,
      shape: this.shape,
    });
  }
  undo(): void {
    if (!this.committedShape) return;
    this.shapesRef.current = this.shapesRef.current.filter(
      (s) => s.id !== this.committedShape!.id,
    );
    this.socket.emit("deleteShape", {
      boardId: this.boardId,
      shapeId: this.committedShape.id,
    });
  }
}
