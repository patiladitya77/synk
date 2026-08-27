import React from "react";
import { Shape } from "../types";
import { Socket } from "socket.io-client";
import { Command } from "./Command";

function isMatchingShape(local: Shape, server: Shape): boolean {
  if (local.type !== server.type) return false;
  if (
    local.type === "rect" ||
    local.type === "oval" ||
    local.type === "diamond" ||
    local.type === "text"
  ) {
    const s = server as typeof local;
    return (
      local.x === s.x &&
      local.y === s.y &&
      local.width === s.width &&
      local.height === s.height
    );
  }
  if (local.type === "arrow") {
    const s = server as typeof local;
    return (
      local.x1 === s.x1 &&
      local.y1 === s.y1 &&
      local.x2 === s.x2 &&
      local.y2 === s.y2
    );
  }
  return false;
}

export class AddShapeCommand implements Command {
  private committedShape: Shape | null = null; // will hold the server-assigned id
  constructor(
    private shapesRef: React.RefObject<Shape[]>,
    private boardId: string,
    private socket: Socket,
    private shape: Shape,
    private userId: string,
  ) {
    // Listen for the server's response and match our shape by type + position
    const onShapeDrawn = (serverShape: Shape) => {
      if (isMatchingShape(this.shape, serverShape)) {
        this.committedShape = serverShape;
        this.socket.off("shapeDrawn", onShapeDrawn);
      }
    };
    this.socket.on("shapeDrawn", onShapeDrawn);
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
