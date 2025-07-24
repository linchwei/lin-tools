import Router from "@koa/router";
import { Server } from "socket.io";
import { createServer } from "http";

const router = new Router();

interface Room {
  id: string;
  users: Map<string, UserInfo>;
  host: string;
}

interface UserInfo {
  id: string;
  name: string;
  color: string;
  socketId: string;
}

const rooms = new Map<string, Room>();

export function setupSignalingServer(server: any) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("用户连接:", socket.id);

    // 创建房间
    socket.on("create-room", (data) => {
      const roomId = generateRoomId();
      const room: Room = {
        id: roomId,
        users: new Map(),
        host: data.userId,
      };

      rooms.set(roomId, room);
      socket.join(roomId);

      socket.emit("room-created", { roomId });
    });

    // 加入房间
    socket.on("join-room", (data) => {
      const { roomId, userInfo } = data;
      const room = rooms.get(roomId);

      if (!room) {
        socket.emit("error", { message: "房间不存在" });
        return;
      }

      userInfo.socketId = socket.id;
      room.users.set(userInfo.id, userInfo);
      socket.join(roomId);

      // 通知房间内其他用户
      socket.to(roomId).emit("user-joined", { user: userInfo });

      // 发送房间内现有用户列表
      const existingUsers = Array.from(room.users.values());
      socket.emit("existing-users", { users: existingUsers });
    });

    // WebRTC信令
    socket.on("offer", (data) => {
      socket.to(data.roomId).emit("offer", {
        offer: data.offer,
        from: socket.id,
      });
    });

    socket.on("answer", (data) => {
      socket.to(data.to).emit("answer", {
        answer: data.answer,
        from: socket.id,
      });
    });

    socket.on("ice-candidate", (data) => {
      socket.to(data.roomId).emit("ice-candidate", {
        candidate: data.candidate,
        from: socket.id,
      });
    });

    // 绘图数据转发
    socket.on("drawing-operation", (data) => {
      socket.to(data.roomId).emit("drawing-operation", data.operation);
    });

    // 光标位置转发
    socket.on("cursor-position", (data) => {
      socket.to(data.roomId).emit("cursor-position", data.cursor);
    });

    // 断开连接
    socket.on("disconnect", () => {
      console.log("用户断开连接:", socket.id);

      // 从所有房间中移除用户
      rooms.forEach((room, roomId) => {
        const userToRemove = Array.from(room.users.values()).find(
          (user) => user.socketId === socket.id
        );

        if (userToRemove) {
          room.users.delete(userToRemove.id);
          socket.to(roomId).emit("user-left", { userId: userToRemove.id });

          // 如果房间为空，删除房间
          if (room.users.size === 0) {
            rooms.delete(roomId);
          }
        }
      });
    });
  });

  return io;
}

function generateRoomId(): string {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

export default router;
