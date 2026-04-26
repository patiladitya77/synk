import React from "react";
import { Socket } from "socket.io-client";
import { Shape } from "../types";
import { Command } from "./Command";

type Point = { x: number; y: number };

export class DeleteShapeCommand implements Command {
  private affectedArrows: Map<string, Point[]> = new Map();

  constructor(
    private shapesRef: React.RefObject<Shape[]>,
    private boardId: string,
    private socket: Socket,
    private shape: Shape,
    private userId: string,
  ) {
    // Capture waypoints of arrows connected to the shape being deleted
    if (this.shapesRef.current) {
      for (const s of this.shapesRef.current) {
        if (s.type === "arrow") {
          const isConnected =
            s.fromShapeId === this.shape.id || s.toShapeId === this.shape.id;

          if (isConnected && s.waypoints && s.waypoints.length > 0) {
            // Store a copy of the waypoints
            this.affectedArrows.set(s.id, [...s.waypoints]);
          }
        }
      }
    }
  }

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

    // Restore waypoints for affected arrows
    if (this.shapesRef.current) {
      for (const s of this.shapesRef.current) {
        if (s.type === "arrow" && this.affectedArrows.has(s.id)) {
          const savedWaypoints = this.affectedArrows.get(s.id);
          if (savedWaypoints) {
            // Update the arrow's waypoints in-place
            s.waypoints = [...savedWaypoints];
          }
        }
      }
    }

    // Tell server to flip isDeleted = false — preserves original ID
    this.socket.emit("restoreShape", {
      boardId: this.boardId,
      shapeId: this.shape.id,
    });
  }
}
