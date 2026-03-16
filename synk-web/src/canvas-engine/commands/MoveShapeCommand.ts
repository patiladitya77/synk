import { Socket } from "socket.io-client";
import { Shape } from "../types";
import { Command } from "./command";
import React from "react";

export class MoveShapeCommand implements Command {
  private oldSnapshot: Shape;
  private newSnapshot: Shape;

  constructor(
    private shapesRef: React.RefObject<Shape[]>,
    private boardId: string,
    private socket: Socket,
    shape: Shape, //shape before move
    newShape: Shape, //shape after move
  ) {
    // deep copy both states at the time of commit
    this.oldSnapshot = { ...shape };
    this.newSnapshot = { ...newShape };
  }

  execute(): void {
    const idx = this.shapesRef.current.findIndex(
      (s) => (s.id = this.newSnapshot.id),
    );
    if (idx !== -1) this.shapesRef.current[idx] = { ...this.newSnapshot };
    this.socket.emit("updateboard", {
      boardId: this.boardId,
      shape: this.newSnapshot,
    });
  }
  undo(): void {
    const idx = this.shapesRef.current.findIndex(
      (s) => s.id == this.oldSnapshot.id,
    );
    if (idx !== -1) this.shapesRef.current[idx] = { ...this.oldSnapshot };
    this.socket.emit("updateshape", {
      boardId: this.boardId,
      shape: this.oldSnapshot,
    });
  }
}
