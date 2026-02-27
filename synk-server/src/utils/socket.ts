import { createHash } from "node:crypto";
import { Server } from "socket.io";
import { Shape } from "../types/shapes";
import { prisma } from "../lib/prisma";

const getBoardRoomId = (boardId: string) => {
  return createHash("sha256").update(boardId).digest("hex");
};
const boardState: Record<string, Shape[]> = {};
const initialiseSocket = (server: any) => {
  const io = new Server(server, {
    cors: { origin: process.env.ORIGIN_URL },
  });
  io.on("connection", (socket) => {
    socket.on("joinboard", async ({ name, userId, boardId: slug }) => {
      const board = await prisma.board.findFirst({ where: { slug } });
      if (!board) {
        socket.emit("error", "Board not found");
        return;
      }

      const roomId = getBoardRoomId(board.id);

      socket.join(roomId);
      const shapes = await prisma.shape.findMany({
        where: { boardId: board.id },
      });
      console.log("name: ", name);
      console.log("boardId: ", board.id);
      socket.emit(
        "initialstate",
        shapes.map((s) => s.data),
      );
    });

    // Draw shape
    socket.on(
      "drawShape",
      async ({ boardId: slug, shape }: { boardId: string; shape: Shape }) => {
        const board = await prisma.board.findFirst({ where: { slug } });
        if (!board) {
          socket.emit("error", "boardnot found");
          return;
        }
        const roomId = getBoardRoomId(board.id);
        await prisma.shape.create({
          data: {
            id: shape.id,
            boardId: board.id,
            type: shape.type,
            data: shape,
          },
        });

        // Broadcast to others
        socket.to(roomId).emit("shapeDrawn", shape);
      },
    );

    // Update shape
    socket.on(
      "updateShape",
      async ({ boardId: slug, shape }: { boardId: string; shape: Shape }) => {
        const board = await prisma.board.findFirst({ where: { slug } });
        if (!board) {
          socket.emit("error", "board not found");
          return;
        }
        const roomId = getBoardRoomId(board.id);

        await prisma.shape.update({
          where: { id: shape.id },
          data: {
            data: shape,
            version: { increment: 1 },
          },
        });

        socket.to(roomId).emit("shapeUpdated", shape);
      },
    );

    // Clear board
    socket.on("clearBoard", async ({ boardId }) => {
      const roomId = getBoardRoomId(boardId);

      await prisma.shape.deleteMany({
        where: { boardId },
      });
      io.to(roomId).emit("boardCleared");
    });

    socket.on("disconnect", () => {
      // console.log("User disconnected:", socket.id);
    });
  });
};

export default initialiseSocket;
