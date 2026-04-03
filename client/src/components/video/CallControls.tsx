import React from 'react';

interface Props {
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isSharingScreen: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onEndCall: () => void;
}

export function CallControls({ isAudioMuted, isVideoOff, isSharingScreen, onToggleAudio, onToggleVideo, onToggleScreenShare, onEndCall }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 16,
        padding: '16px 24px',
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 40,
      }}
    >
      <ControlButton
        onClick={onToggleAudio}
        active={!isAudioMuted}
        activeIcon="🎙️"
        inactiveIcon="🔇"
        label={isAudioMuted ? 'Unmute' : 'Mute'}
      />
      <ControlButton
        onClick={onToggleVideo}
        active={!isVideoOff}
        activeIcon="📹"
        inactiveIcon="📷"
        label={isVideoOff ? 'Start Video' : 'Stop Video'}
      />
      <ControlButton
        onClick={onToggleScreenShare}
        active={isSharingScreen}
        activeIcon="🖥️"
        inactiveIcon="🖥️"
        label={isSharingScreen ? 'Stop Share' : 'Share Screen'}
      />
      <button
        onClick={onEndCall}
        title="End Call"
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          backgroundColor: '#ef4444',
          border: 'none',
          cursor: 'pointer',
          fontSize: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        📵
      </button>
    </div>
  );
}

function ControlButton({ onClick, active, activeIcon, inactiveIcon, label }: { onClick: () => void; active: boolean; activeIcon: string; inactiveIcon: string; label: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: 52,
        height: 52,
        borderRadius: '50%',
        backgroundColor: active ? 'rgba(255,255,255,0.2)' : 'rgba(239,68,68,0.8)',
        border: 'none',
        cursor: 'pointer',
        fontSize: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {active ? activeIcon : inactiveIcon}
    </button>
  );
}
