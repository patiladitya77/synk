import { createHash } from "node:crypto";
import { Server } from "socket.io";
import { Shape } from "../types/shapes";
import { prisma } from "../lib/prisma";

const getBoardRoomId = (boardId: string) => {
  return createHash("sha256").update(boardId).digest("hex");
};
const broadcastPresence = async (
  io: Server,
  roomId: string,
  excludeSocketId?: string
) => {
  const sockets = await io.in(roomId).fetchSockets();

  const uniqueUsers = new Map();

  sockets.forEach((socket) => {
    // Exclude the disconnecting socket
    if (socket.id === excludeSocketId) return;

    const user = socket.data.user;

    if (user) {
      uniqueUsers.set(user.userId, {
        userId: user.userId,
        name: user.name,
      });
    }
  });

  const users = Array.from(uniqueUsers.values());

  console.log("Connected users:", users);

  io.to(roomId).emit("presence:update", users);
};
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
      socket.data.user = {
        userId, name
      }
      socket.data.roomId = roomId;



      socket.join(roomId);
      const shapes = await prisma.shape.findMany({
        where: { boardId: board.id, isDeleted: false },
      });
      console.log("name: ", name);
      console.log("boardId: ", board.id);
      socket.emit(
        "initialstate",
        shapes.map((s) => {
          const shapeData = s.data as Shape;
          return { ...shapeData, id: s.id };
        }),
      );
      await broadcastPresence(io, roomId);
    });

    // Draw shape
    socket.on(
      "drawShape",
      async ({
        boardId: slug,
        shape,
        userId,
      }: {
        boardId: string;
        shape: Shape;
        userId: string;
      }) => {
        const board = await prisma.board.findFirst({ where: { slug } });
        if (!board) {
          socket.emit("error", "boardnot found");
          return;
        }
        const roomId = getBoardRoomId(board.id);
        // console.log("userId from drawshape:", userId);

        // Let Prisma auto-generate the UUID
        const createdShape = await prisma.shape.create({
          data: {
            boardId: board.id,
            type: shape.type,
            data: shape,
            createdBy: userId,
          },
        });

        // Send back the shape with the DB-generated ID
        const shapeWithId = { ...shape, id: createdShape.id };

        // Broadcast to others
        socket.to(roomId).emit("shapeDrawn", shapeWithId);
        // Also send back to the creator
        socket.emit("shapeDrawn", shapeWithId);
        console.log("created shape: ", createdShape);
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

        // Validate shape ID
        if (!shape.id || shape.id === "" || shape.id === "preview") {
          console.error("Invalid shape ID:", shape.id);
          return;
        }

        const roomId = getBoardRoomId(board.id);

        try {
          await prisma.shape.update({
            where: { id: shape.id },
            data: {
              data: shape,
              version: { increment: 1 },
            },
          });

          socket.to(roomId).emit("shapeUpdated", shape);
        } catch (error) {
          console.error("Failed to update shape:", error);
          socket.emit("error", "Failed to update shape");
        }
      },
    );

    //delete shape (soft delete)
    socket.on("deleteShape", async ({ boardId: slug, shapeId }) => {
      const board = await prisma.board.findFirst({ where: { slug } });
      if (!board) {
        socket.emit("error", "board not found");
        return;
      }
      const roomId = getBoardRoomId(board.id);
      try {
        await prisma.shape.update({
          where: { id: shapeId },
          data: { isDeleted: true },
        });
        io.to(roomId).emit("shapeDeleted", { shapeId });
        console.log("shape soft-deleted");
      } catch (error) {
        console.error("Failed to delete shape:", error);
        socket.emit("error", "Failed to delete shape");
      }
    });

    // restore shape (undo delete)
    socket.on("restoreShape", async ({ boardId: slug, shapeId }) => {
      const board = await prisma.board.findFirst({ where: { slug } });
      if (!board) {
        socket.emit("error", "board not found");
        return;
      }
      const roomId = getBoardRoomId(board.id);
      try {
        const shape = await prisma.shape.update({
          where: { id: shapeId },
          data: { isDeleted: false },
        });
        const shapeData = shape.data as Shape;
        const restored = { ...shapeData, id: shape.id };
        io.to(roomId).emit("shapeDrawn", restored);
      } catch (error) {
        console.error("Failed to restore shape:", error);
        socket.emit("error", "Failed to restore shape");
      }
    });

    // Clear board
    socket.on("clearBoard", async ({ boardId }) => {
      const roomId = getBoardRoomId(boardId);

      await prisma.shape.deleteMany({
        where: { boardId },
      });
      io.to(roomId).emit("boardCleared");
    });

    // Relay cursor position to other users in the same room (no DB write)
    socket.on(
      "cursor:move",
      ({ x, y }: { boardId: string; x: number; y: number }) => {
        const user = socket.data.user;
        const roomId = socket.data.roomId;
        if (!user || !roomId) return;
        socket.to(roomId).emit("cursor:move", {
          userId: user.userId,
          name: user.name,
          x,
          y,
        });
      },
    );

    socket.on("disconnecting", async () => {
      console.log("[presence] disconnecting:", socket.data.user, "| socketId:", socket.id);
      // socket.rooms still contains the board rooms at this point
      const rooms = [...socket.rooms];

      for (const roomId of rooms) {
        // Every socket is also in a personal room named after its own ID — skip it
        if (roomId === socket.id) continue;

        console.log("[presence] broadcasting after leave for room:", roomId);
        await broadcastPresence(io, roomId, socket.id);
      }
    });
  });
};

export default initialiseSocket;
