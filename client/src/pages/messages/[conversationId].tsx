import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Layout } from '../../components/Layout';
import { ConversationList } from '../../components/chat/ConversationList';
import { MessageThread } from '../../components/chat/MessageThread';
import { MessageInput } from '../../components/chat/MessageInput';
import { useChat } from '../../hooks/useChat';
import { getChatSocket } from '../../services/socket';

const DEMO_TOKEN = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
const DEMO_USER_ID = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

export default function ConversationPage() {
  const router = useRouter();
  const { conversationId } = router.query;
  const token = DEMO_TOKEN;
  const userId = DEMO_USER_ID;

  const {
    conversations,
    activeConversation,
    messages,
    hasMore,
    loadConversations,
    openConversation,
    loadMoreMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    pinMessage,
  } = useChat(token);

  useEffect(() => {
    if (token) {
      loadConversations().then(() => {
        if (conversationId && conversations.length > 0) {
          const conv = conversations.find((c) => c.id === conversationId);
          if (conv) openConversation(conv);
        }
      });
    }
  }, [token, conversationId]);

  const socket = token ? getChatSocket(token) : null;

  return (
    <Layout token={token}>
      <Head>
        <title>Conversation | Freelance Designer Hub</title>
      </Head>
      <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
        <div style={{ width: 320, flexShrink: 0 }}>
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversation?.id}
            currentUserId={userId || undefined}
            onSelectConversation={(conv) => {
              router.push(`/messages/${conv.id}`);
              openConversation(conv);
            }}
            onNewConversation={() => router.push('/messages')}
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
          />
          <MessageInput
            socket={socket}
            conversationId={activeConversation?.id || null}
            onSend={sendMessage}
            disabled={!activeConversation}
          />
        </div>
      </div>
    </Layout>
  );
}
