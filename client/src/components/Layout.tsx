import React from 'react';
import Link from 'next/link';
import { NotificationBell } from './notifications/NotificationBell';

interface Props {
  children: React.ReactNode;
  token?: string | null;
}

export function Layout({ children, token }: Props) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          height: 64,
          backgroundColor: '#fff',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Link href="/" style={{ textDecoration: 'none', color: '#111827', fontWeight: 700, fontSize: 20 }}>
          🎨 Designer Hub
        </Link>
        <nav style={{ display: 'flex', gap: 8, marginLeft: 32, flex: 1 }}>
          <NavLink href="/messages">💬 Messages</NavLink>
          <NavLink href="/notifications">🔔 Notifications</NavLink>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NotificationBell token={token || null} />
        </div>
      </header>
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        padding: '6px 12px',
        borderRadius: 8,
        textDecoration: 'none',
        color: '#374151',
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      {children}
    </Link>
  );
}
