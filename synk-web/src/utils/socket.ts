import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const createSocketConnection = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_BASE_URL!, {
      transports: ["websocket"],
    });
  }

  return socket;
};
