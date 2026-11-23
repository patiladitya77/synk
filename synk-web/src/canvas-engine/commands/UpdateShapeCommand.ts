import React from "react";
import { Shape } from "../types";
import { Command } from "./Command";
import { Socket } from "socket.io-client";

export class UpdateShapeCommand implements Command {
  private oldSnapshot: Shape;
  private newSnapshot: Shape;

  constructor(
    private shapesRef: React.RefObject<Shape[]>,
    private boardId: string,
    private socket: Socket,
    oldShape: Shape,
    newShape: Shape,
  ) {
    this.oldSnapshot = { ...oldShape };
    this.newSnapshot = { ...newShape };
  }

  execute(): void {
    const idx = this.shapesRef.current.findIndex(
      (s) => s.id === this.newSnapshot.id,
    );
    if (idx !== -1) this.shapesRef.current[idx] = { ...this.newSnapshot };
    this.socket.emit("updateShape", {
      boardId: this.boardId,
      shape: this.newSnapshot,
    });
  }

  undo(): void {
    const idx = this.shapesRef.current.findIndex(
      (s) => s.id === this.oldSnapshot.id,
    );
    if (idx !== -1) this.shapesRef.current[idx] = { ...this.oldSnapshot };
    this.socket.emit("updateShape", {
      boardId: this.boardId,
      shape: this.oldSnapshot,
    });
  }
}
