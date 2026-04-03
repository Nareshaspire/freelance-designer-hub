import React from 'react';
import Head from 'next/head';
import { Layout } from '../../components/Layout';
import { NotificationPage } from '../../components/notifications/NotificationPage';

const DEMO_TOKEN = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

export default function NotificationsPage() {
  return (
    <Layout token={DEMO_TOKEN}>
      <Head>
        <title>Notifications | Freelance Designer Hub</title>
      </Head>
      <NotificationPage token={DEMO_TOKEN} />
    </Layout>
  );
}
