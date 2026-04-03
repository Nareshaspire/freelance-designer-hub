import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Layout } from '../components/Layout';

const DEMO_TOKEN = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

export default function Home() {
  return (
    <Layout token={DEMO_TOKEN}>
      <Head>
        <title>Freelance Designer Hub</title>
      </Head>
      <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 40, fontWeight: 700, marginBottom: 16 }}>🎨 Freelance Designer Hub</h1>
        <p style={{ fontSize: 18, color: '#6b7280', marginBottom: 40 }}>
          Communication Suite — Real-time chat, video calls, and notifications
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link href="/messages" style={{ padding: '14px 28px', backgroundColor: '#6366f1', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 16 }}>
            💬 Open Messages
          </Link>
          <Link href="/notifications" style={{ padding: '14px 28px', backgroundColor: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 16 }}>
            🔔 Notifications
          </Link>
        </div>
      </div>
    </Layout>
  );
}
