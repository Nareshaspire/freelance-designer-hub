import React, { useState } from 'react';
import { chatService } from '../../services/chat';
import { Message } from '../../hooks/useChat';

interface Props {
  token: string;
  conversationId?: string;
  onSelectMessage?: (message: Message) => void;
}

export function MessageSearch({ token, conversationId, onSelectMessage }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await chatService.searchMessages(token, query.trim(), conversationId);
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search messages..."
          style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>
      <div>
        {results.map((msg) => (
          <div
            key={msg.id}
            onClick={() => onSelectMessage?.(msg)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              backgroundColor: '#f9fafb',
              marginBottom: 4,
            }}
          >
            <div style={{ fontSize: 13, color: '#374151' }}>{msg.content}</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(msg.createdAt).toLocaleString()}</div>
          </div>
        ))}
        {results.length === 0 && query && !loading && (
          <div style={{ color: '#9ca3af', textAlign: 'center', padding: 16 }}>No results found</div>
        )}
      </div>
    </div>
  );
}
