import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

let chatSocket: Socket | null = null;
let videoSocket: Socket | null = null;

export function getChatSocket(token: string): Socket {
  if (!chatSocket || !chatSocket.connected) {
    chatSocket = io(`${SOCKET_URL}/chat`, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return chatSocket;
}

export function getVideoSocket(token: string): Socket {
  if (!videoSocket || !videoSocket.connected) {
    videoSocket = io(`${SOCKET_URL}/video`, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return videoSocket;
}

export function disconnectSockets() {
  if (chatSocket) {
    chatSocket.disconnect();
    chatSocket = null;
  }
  if (videoSocket) {
    videoSocket.disconnect();
    videoSocket = null;
  }
}
