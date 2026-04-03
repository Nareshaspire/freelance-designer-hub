import { useState, useEffect, useRef, useCallback } from 'react';
import { getVideoSocket } from '../services/socket';

export type CallState = 'idle' | 'ringing' | 'connecting' | 'active' | 'ended';

export interface IncomingCall {
  sessionId: string;
  callerId: string;
  type: 'audio' | 'video';
  conversationId: string;
}

export function useVideoCall(token: string | null) {
  const [callState, setCallState] = useState<CallState>('idle');
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Use a ref to track the current sessionId so ICE candidate handlers always have the latest value
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const socket = getVideoSocket(token);

    socket.on('incoming_call', (data: IncomingCall) => {
      setIncomingCall(data);
      setCallState('ringing');
    });

    socket.on('call_answered', async (data: { sdp: any; answererId: string; sessionId: string }) => {
      setCallState('active');
      startTimer();
      if (peerConnectionRef.current && data.sdp) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
      }
    });

    socket.on('call_rejected', () => {
      setCallState('ended');
      cleanup();
    });

    socket.on('call_ended', () => {
      setCallState('ended');
      cleanup();
    });

    socket.on('remote_ice_candidate', (data: { candidate: any }) => {
      if (peerConnectionRef.current && data.candidate) {
        peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    socket.on('participant_toggled_audio', ({ enabled }: { enabled: boolean }) => {
      // Handle remote audio toggle
    });

    socket.on('participant_toggled_video', ({ enabled }: { enabled: boolean }) => {
      // Handle remote video toggle
    });

    socket.on('screen_share_started', () => {
      // Handle remote screen share start
    });

    socket.on('screen_share_stopped', () => {
      // Handle remote screen share stop
    });

    return () => {
      socket.off('incoming_call');
      socket.off('call_answered');
      socket.off('call_rejected');
      socket.off('call_ended');
      socket.off('remote_ice_candidate');
      socket.off('participant_toggled_audio');
      socket.off('participant_toggled_video');
      socket.off('screen_share_started');
      socket.off('screen_share_stopped');
    };
  }, [token]);

  const startTimer = () => {
    setCallDuration(0);
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setCallDuration(0);
    setIsAudioMuted(false);
    setIsVideoOff(false);
    setIsSharingScreen(false);
  };

  const initiateCall = useCallback(
    async (conversationId: string, type: 'audio' | 'video', recipientId: string) => {
      if (!token) return;
      const socket = getVideoSocket(token);
      setCallState('ringing');

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: type === 'video',
        });
        localStreamRef.current = stream;

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });
        peerConnectionRef.current = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.onicecandidate = ({ candidate }) => {
          if (candidate) {
            socket.emit('ice_candidate', { candidate, targetUserId: recipientId, sessionId: sessionIdRef.current });
          }
        };

        pc.ontrack = (event) => {
          remoteStreamRef.current = event.streams[0];
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('call_initiate', { conversationId, type, recipientId, sdp: offer }, (res: any) => {
          if (res?.sessionId) {
            setSessionId(res.sessionId);
            sessionIdRef.current = res.sessionId;
          }
        });
      } catch (err) {
        console.error('Failed to initiate call:', err);
        setCallState('idle');
      }
    },
    [token],
  );

  const answerCall = useCallback(
    async () => {
      if (!token || !incomingCall) return;
      const socket = getVideoSocket(token);
      setCallState('connecting');

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: incomingCall.type === 'video',
        });
        localStreamRef.current = stream;

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });
        peerConnectionRef.current = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          remoteStreamRef.current = event.streams[0];
        };

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // Set sessionId ref before emitting to avoid race conditions with ICE candidates
        sessionIdRef.current = incomingCall.sessionId;
        setSessionId(incomingCall.sessionId);
        socket.emit('call_answer', { sessionId: incomingCall.sessionId, sdp: answer });
        setCallState('active');
        startTimer();
        setIncomingCall(null);
      } catch (err) {
        console.error('Failed to answer call:', err);
        setCallState('idle');
      }
    },
    [token, incomingCall],
  );

  const rejectCall = useCallback(() => {
    if (!token || !incomingCall) return;
    const socket = getVideoSocket(token);
    socket.emit('call_reject', { sessionId: incomingCall.sessionId });
    setIncomingCall(null);
    setCallState('idle');
  }, [token, incomingCall]);

  const endCall = useCallback(() => {
    if (!token || !sessionId) return;
    const socket = getVideoSocket(token);
    socket.emit('call_end', { sessionId });
    setCallState('ended');
    cleanup();
    setSessionId(null);
  }, [token, sessionId]);

  const toggleAudio = useCallback(
    (targetUserId: string) => {
      if (!localStreamRef.current) return;
      const socket = getVideoSocket(token!);
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
        socket.emit('toggle_audio', { sessionId, enabled: audioTrack.enabled, targetUserId });
      }
    },
    [token, sessionId],
  );

  const toggleVideo = useCallback(
    (targetUserId: string) => {
      if (!localStreamRef.current) return;
      const socket = getVideoSocket(token!);
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        socket.emit('toggle_video', { sessionId, enabled: videoTrack.enabled, targetUserId });
      }
    },
    [token, sessionId],
  );

  const startScreenShare = useCallback(
    async (targetUserId: string) => {
      if (!token) return;
      const socket = getVideoSocket(token);
      try {
        const screenStream = await (navigator.mediaDevices as MediaDevices & { getDisplayMedia(constraints?: DisplayMediaStreamOptions): Promise<MediaStream> }).getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) await sender.replaceTrack(screenTrack);
        }
        setIsSharingScreen(true);
        socket.emit('screen_share_start', { sessionId, targetUserId });
        screenTrack.onended = () => stopScreenShare(targetUserId);
      } catch (err) {
        console.error('Screen share failed:', err);
      }
    },
    [token, sessionId],
  );

  const stopScreenShare = useCallback(
    async (targetUserId: string) => {
      if (!token || !localStreamRef.current) return;
      const socket = getVideoSocket(token);
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (peerConnectionRef.current && videoTrack) {
        const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) await sender.replaceTrack(videoTrack);
      }
      setIsSharingScreen(false);
      socket.emit('screen_share_stop', { sessionId, targetUserId });
    },
    [token, sessionId],
  );

  return {
    callState,
    incomingCall,
    sessionId,
    isAudioMuted,
    isVideoOff,
    isSharingScreen,
    callDuration,
    localStream: localStreamRef.current,
    remoteStream: remoteStreamRef.current,
    initiateCall,
    answerCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
  };
}
