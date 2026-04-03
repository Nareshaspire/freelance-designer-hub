import React, { useState } from 'react';

interface Props {
  onClose: () => void;
  onCreate: (data: { type: string; participantIds: string[]; name?: string }) => void;
}

export function NewConversationModal({ onClose, onCreate }: Props) {
  const [type, setType] = useState<'direct' | 'project_group'>('direct');
  const [participantInput, setParticipantInput] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [name, setName] = useState('');

  const addParticipant = () => {
    const id = participantInput.trim();
    if (id && !participants.includes(id)) {
      setParticipants((prev) => [...prev, id]);
      setParticipantInput('');
    }
  };

  const removeParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p !== id));
  };

  const handleCreate = () => {
    if (participants.length === 0) return;
    onCreate({ type, participantIds: participants, name: type === 'project_group' ? name : undefined });
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 24,
          width: 420,
          maxWidth: '90vw',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>New Conversation</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>×</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Type</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {(['direct', 'project_group'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid',
                  borderColor: type === t ? '#6366f1' : '#d1d5db',
                  backgroundColor: type === t ? '#6366f1' : '#fff',
                  color: type === t ? '#fff' : '#374151',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                {t === 'direct' ? 'Direct Message' : 'Group Chat'}
              </button>
            ))}
          </div>
        </div>

        {type === 'project_group' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Group Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name..."
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', marginTop: 6 }}
            />
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Add Participants (by User ID)</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input
              value={participantInput}
              onChange={(e) => setParticipantInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
              placeholder="Enter user ID..."
              style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
            />
            <button
              onClick={addParticipant}
              style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer' }}
            >
              Add
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {participants.map((p) => (
              <span
                key={p}
                style={{
                  backgroundColor: '#ede9fe',
                  color: '#6d28d9',
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {p.slice(0, 12)}
                <button onClick={() => removeParticipant(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6d28d9', padding: 0, lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={participants.length === 0}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: participants.length > 0 ? '#6366f1' : '#d1d5db',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: participants.length > 0 ? 'pointer' : 'not-allowed',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Create Conversation
        </button>
      </div>
    </div>
  );
}
