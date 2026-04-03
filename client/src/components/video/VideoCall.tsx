import React, { useEffect, useRef } from 'react';
import { CallState } from '../../hooks/useVideoCall';
import { CallControls } from './CallControls';
import { CallStatus } from './CallStatus';

interface Props {
  callState: CallState;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isSharingScreen: boolean;
  callDuration: number;
  targetUserId: string;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
}

export function VideoCall({
  callState,
  localStream,
  remoteStream,
  isAudioMuted,
  isVideoOff,
  isSharingScreen,
  callDuration,
  targetUserId,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall,
}: Props) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (callState === 'idle' || callState === 'ended') return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0f0f0f',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 9998,
      }}
    >
      {/* Remote video */}
      <div style={{ flex: 1, position: 'relative' }}>
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 48,
            }}
          >
            👤
          </div>
        )}

        {/* Local video (PiP) */}
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            right: 16,
            width: 140,
            height: 100,
            borderRadius: 8,
            overflow: 'hidden',
            border: '2px solid rgba(255,255,255,0.3)',
          }}
        >
          {localStream && !isVideoOff ? (
            <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24 }}>
              👤
            </div>
          )}
        </div>

        <CallStatus callState={callState} duration={callDuration} />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0 32px' }}>
        <CallControls
          isAudioMuted={isAudioMuted}
          isVideoOff={isVideoOff}
          isSharingScreen={isSharingScreen}
          onToggleAudio={onToggleAudio}
          onToggleVideo={onToggleVideo}
          onToggleScreenShare={onToggleScreenShare}
          onEndCall={onEndCall}
        />
      </div>
    </div>
  );
}
