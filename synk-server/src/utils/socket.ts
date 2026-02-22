import { createHash } from "node:crypto";
import { Server } from "socket.io";
import { Shape } from "../types/shapes";

const getBoardRoomId = (boardId: string) => {
  return createHash("sha256").update(boardId).digest("hex");
};
const boardState: Record<string, Shape[]> = {};
const initialiseSocket = (server: any) => {
  const io = new Server(server, {
    cors: { origin: process.env.ORIGIN_URL },
  });
  io.on("connection", (socket) => {
    socket.on("joinboard", ({ name, userId, boardId }) => {
      const roomId = getBoardRoomId(boardId);
      socket.join(roomId);
      console.log("name: ", name);
      console.log("boardId: ", boardId);
      socket.emit("initialstate", boardState[roomId] || []);
    });

    // Draw shape
    socket.on(
      "drawShape",
      ({ boardId, shape }: { boardId: string; shape: Shape }) => {
        const roomId = getBoardRoomId(boardId);

        if (!boardState[roomId]) {
          boardState[roomId] = [];
        }

        boardState[roomId].push(shape);

        // Broadcast to others
        socket.to(roomId).emit("shapeDrawn", shape);
      },
    );

    // Update shape
    socket.on(
      "updateShape",
      ({ boardId, shape }: { boardId: string; shape: Shape }) => {
        const roomId = getBoardRoomId(boardId);

        const shapes = boardState[roomId];
        if (!shapes) return;

        const index = shapes.findIndex((s) => s.id === shape.id);
        if (index !== -1) {
          shapes[index] = shape;
        }

        socket.to(roomId).emit("shapeUpdated", shape);
      },
    );

    // Clear board
    socket.on("clearBoard", ({ boardId }) => {
      const roomId = getBoardRoomId(boardId);

      boardState[roomId] = [];
      io.to(roomId).emit("boardCleared");
    });

    socket.on("disconnect", () => {
      // console.log("User disconnected:", socket.id);
    });
  });
};

export default initialiseSocket;
