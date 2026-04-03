import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Project, ProjectStatus, Bid } from '@/services/projects';
import { getProjects } from '@/services/projects';
import { getMyBids } from '@/services/bids';
import ProjectCard from '@/components/projects/ProjectCard';
import BidCard from '@/components/projects/BidCard';

type Role = 'client' | 'freelancer';

const CLIENT_TABS: { key: ProjectStatus[]; label: string }[] = [
  { key: [ProjectStatus.IN_PROGRESS, ProjectStatus.REVIEW], label: 'Active' },
  { key: [ProjectStatus.DRAFT], label: 'Drafts' },
  { key: [ProjectStatus.OPEN], label: 'Open' },
  { key: [ProjectStatus.COMPLETED], label: 'Completed' },
];

export default function MyProjectsPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('client');
  const [projects, setProjects] = useState<Project[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientTab, setClientTab] = useState(0);
  const [freelancerTab, setFreelancerTab] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (role === 'client') {
      getProjects({ limit: 100 })
        .then(r => setProjects(r.data))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      Promise.all([
        getProjects({ status: ProjectStatus.IN_PROGRESS, limit: 100 }),
        getMyBids(),
      ])
        .then(([projectsResult, bidsResult]) => {
          setProjects(projectsResult.data);
          setBids(bidsResult);
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [role]);

  const activeStatuses = CLIENT_TABS[clientTab].key;
  const filteredProjects = role === 'client'
    ? projects.filter(p => activeStatuses.includes(p.status))
    : projects;

  const tabCounts = CLIENT_TABS.map(tab =>
    projects.filter(p => tab.key.includes(p.status)).length
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>My Projects</h1>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: '#6b7280' }}>View as:</span>
          <div style={{ display: 'flex', border: '1px solid #d1d5db', borderRadius: 8, overflow: 'hidden' }}>
            {(['client', 'freelancer'] as Role[]).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  padding: '7px 16px',
                  border: 'none',
                  background: role === r ? '#3b82f6' : '#fff',
                  color: role === r ? '#fff' : '#374151',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: role === r ? 500 : 400,
                }}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => router.push('/projects/create')}
            style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}
          >
            + New Project
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: 14, borderRadius: 8, background: '#fee2e2', color: '#991b1b', marginBottom: 20 }}>{error}</div>
      )}

      {/* Client view */}
      {role === 'client' && (
        <>
          <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: 24, gap: 0 }}>
            {CLIENT_TABS.map((tab, i) => (
              <button
                key={i}
                onClick={() => setClientTab(i)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: 15,
                  fontWeight: clientTab === i ? 600 : 400,
                  color: clientTab === i ? '#3b82f6' : '#6b7280',
                  borderBottom: clientTab === i ? '2px solid #3b82f6' : '2px solid transparent',
                  marginBottom: -2,
                }}
              >
                {tab.label} ({tabCounts[i]})
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ color: '#6b7280', padding: 20 }}>Loading…</div>
          ) : filteredProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
              <p style={{ margin: 0 }}>No projects in this category yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {filteredProjects.map(p => (
                <ProjectCard key={p.id} project={p} onClick={() => router.push(`/projects/${p.id}`)} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Freelancer view */}
      {role === 'freelancer' && (
        <>
          <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: 24, gap: 0 }}>
            {[
              { label: `Active Projects (${projects.length})` },
              { label: `My Bids (${bids.length})` },
            ].map((tab, i) => (
              <button
                key={i}
                onClick={() => setFreelancerTab(i)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: 15,
                  fontWeight: freelancerTab === i ? 600 : 400,
                  color: freelancerTab === i ? '#3b82f6' : '#6b7280',
                  borderBottom: freelancerTab === i ? '2px solid #3b82f6' : '2px solid transparent',
                  marginBottom: -2,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ color: '#6b7280', padding: 20 }}>Loading…</div>
          ) : freelancerTab === 0 ? (
            projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>💼</div>
                <p style={{ margin: 0 }}>You have no active projects.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {projects.map(p => (
                  <ProjectCard key={p.id} project={p} onClick={() => router.push(`/projects/${p.id}`)} />
                ))}
              </div>
            )
          ) : (
            bids.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <p style={{ margin: 0 }}>You have not submitted any bids yet.</p>
                <button
                  onClick={() => router.push('/projects')}
                  style={{ marginTop: 16, padding: '8px 20px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: 14 }}
                >
                  Browse Projects
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {bids.map(bid => (
                  <BidCard key={bid.id} bid={bid} />
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
