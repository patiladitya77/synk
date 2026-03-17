import { Socket } from "socket.io-client";
import { Shape } from "../types";
import { Command } from "./Command";

export class DeleteShapeCommand implements Command {
  constructor(
    private shapesRef: React.RefObject<Shape[]>,
    private boarId: string,
    private socket: Socket,
    private shape: Shape,
    private userId: String,
  ) {}
  execute(): void {
    //remove from local state
    this.shapesRef.current = this.shapesRef.current.filter(
      (s) => s.id !== this.shape.id,
    );
    //tell server about this
    this.socket.emit("deleteShape", {
      boardId: this.boarId,
      shapeId: this.shape.id,
    });
  }
  undo(): void {
    //put shape in local state
    this.shapesRef.current = [...this.shapesRef.current, this.shape];
    //recreate on server with same data
    this.socket.emit("shapeDrawn", {
      boardId: this.boarId,
      shapeId: this.shape.id,
      userId: this.userId,
    });
  }
}
