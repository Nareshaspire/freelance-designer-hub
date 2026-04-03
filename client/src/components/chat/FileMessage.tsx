import React from 'react';
import { Message } from '../../hooks/useChat';

interface Props {
  message: Message;
}

export function FileMessage({ message }: Props) {
  const isImage = message.type === 'image';
  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
  const fileUrl = message.fileUrl?.startsWith('http') ? message.fileUrl : `${API_URL}${message.fileUrl}`;

  if (isImage) {
    return (
      <div>
        <img
          src={fileUrl}
          alt={message.fileName || 'Image'}
          style={{ maxWidth: 240, maxHeight: 180, borderRadius: 8, display: 'block', cursor: 'pointer' }}
          onClick={() => window.open(fileUrl, '_blank')}
        />
        {message.fileName && (
          <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{message.fileName}</div>
        )}
      </div>
    );
  }

  return (
    <a
      href={fileUrl}
      download={message.fileName}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <span style={{ fontSize: 24 }}>📄</span>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{message.fileName || 'File'}</div>
        {message.fileSize && (
          <div style={{ fontSize: 11, opacity: 0.8 }}>
            {message.fileSize < 1024
              ? `${message.fileSize} B`
              : message.fileSize < 1024 * 1024
              ? `${(message.fileSize / 1024).toFixed(1)} KB`
              : `${(message.fileSize / 1024 / 1024).toFixed(1)} MB`}
          </div>
        )}
      </div>
    </a>
  );
}
