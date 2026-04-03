import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { getChatSocket } from '../services/socket';

export function useSocket(token: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const socket = getChatSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [token]);

  return { socket: socketRef.current, isConnected };
}
