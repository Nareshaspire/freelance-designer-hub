import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Layout } from '../../components/Layout';
import { ConversationList } from '../../components/chat/ConversationList';
import { MessageThread } from '../../components/chat/MessageThread';
import { MessageInput } from '../../components/chat/MessageInput';
import { NewConversationModal } from '../../components/chat/NewConversationModal';
import { VideoCall } from '../../components/video/VideoCall';
import { IncomingCallModal } from '../../components/video/IncomingCallModal';
import { useChat } from '../../hooks/useChat';
import { useVideoCall } from '../../hooks/useVideoCall';
import { getChatSocket } from '../../services/socket';
import { chatService } from '../../services/chat';

// For demo purposes — in production this comes from auth context
const DEMO_TOKEN = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
const DEMO_USER_ID = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

export default function MessagesPage() {
  const token = DEMO_TOKEN;
  const userId = DEMO_USER_ID;
  const [showNewModal, setShowNewModal] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<any[]>([]);
  const [targetUserId, setTargetUserId] = useState('');

  const {
    conversations,
    activeConversation,
    messages,
    loading,
    hasMore,
    loadConversations,
    openConversation,
    loadMoreMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    pinMessage,
    createConversation,
  } = useChat(token);

  const {
    callState,
    incomingCall,
    isAudioMuted,
    isVideoOff,
    isSharingScreen,
    callDuration,
    localStream,
    remoteStream,
    initiateCall,
    answerCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
  } = useVideoCall(token);

  useEffect(() => {
    if (token) loadConversations();
  }, [token, loadConversations]);

  useEffect(() => {
    if (token && activeConversation) {
      chatService.getPinnedMessages(token, activeConversation.id).then(setPinnedMessages).catch(() => {});
    }
  }, [token, activeConversation]);

  const socket = token ? getChatSocket(token) : null;

  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };

  const handleFileUpload = async (file: File) => {
    if (!token || !activeConversation) return;
    try {
      await chatService.uploadFile(token, activeConversation.id, file);
    } catch (err) {
      console.error('File upload failed:', err);
    }
  };

  const handleCreateConversation = async (data: any) => {
    const conv = await createConversation(data);
    if (conv) openConversation(conv);
  };

  const handleInitiateCall = (type: 'audio' | 'video') => {
    if (!activeConversation || !targetUserId) return;
    initiateCall(activeConversation.id, type, targetUserId);
  };

  return (
    <Layout token={token}>
      <Head>
        <title>Messages | Freelance Designer Hub</title>
      </Head>

      <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
        {/* Sidebar */}
        <div style={{ width: 320, flexShrink: 0 }}>
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversation?.id}
            currentUserId={userId || undefined}
            onSelectConversation={openConversation}
            onNewConversation={() => setShowNewModal(true)}
          />
        </div>

        {/* Main panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeConversation ? (
            <>
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  backgroundColor: '#fff',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>
                    {activeConversation.name || `Conversation`}
                  </h3>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>
                    {activeConversation.participantIds?.length} participants
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleInitiateCall('audio')}
                    style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 16 }}
                    title="Audio call"
                  >
                    📞
                  </button>
                  <button
                    onClick={() => handleInitiateCall('video')}
                    style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 16 }}
                    title="Video call"
                  >
                    📹
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <MessageThread
                  conversation={activeConversation}
                  messages={messages}
                  currentUserId={userId || undefined}
                  socket={socket}
                  hasMore={hasMore}
                  onLoadMore={loadMoreMessages}
                  onEdit={editMessage}
                  onDelete={deleteMessage}
                  onPin={pinMessage}
                  pinnedMessages={pinnedMessages}
                />
              </div>

              {/* Input */}
              <MessageInput
                socket={socket}
                conversationId={activeConversation.id}
                onSend={handleSendMessage}
                onFileUpload={handleFileUpload}
                disabled={!activeConversation}
              />
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
                <div style={{ fontSize: 16 }}>Select a conversation to start messaging</div>
                <button
                  onClick={() => setShowNewModal(true)}
                  style={{ marginTop: 16, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14 }}
                >
                  Start New Conversation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showNewModal && (
        <NewConversationModal
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreateConversation}
        />
      )}

      <VideoCall
        callState={callState}
        localStream={localStream}
        remoteStream={remoteStream}
        isAudioMuted={isAudioMuted}
        isVideoOff={isVideoOff}
        isSharingScreen={isSharingScreen}
        callDuration={callDuration}
        targetUserId={targetUserId}
        onToggleAudio={() => toggleAudio(targetUserId)}
        onToggleVideo={() => toggleVideo(targetUserId)}
        onToggleScreenShare={() => isSharingScreen ? stopScreenShare(targetUserId) : startScreenShare(targetUserId)}
        onEndCall={endCall}
      />

      <IncomingCallModal
        call={incomingCall}
        onAccept={answerCall}
        onReject={rejectCall}
      />
    </Layout>
  );
}
