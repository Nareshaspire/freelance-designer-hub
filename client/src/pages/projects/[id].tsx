import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Project, ProjectStatus, BudgetType } from '@/services/projects';
import { getProject } from '@/services/projects';
import { useBids } from '@/hooks/useBids';
import BidCard from '@/components/projects/BidCard';
import BidForm from '@/components/projects/BidForm';
import MilestoneList from '@/components/projects/MilestoneList';
import MilestoneForm from '@/components/projects/MilestoneForm';
import KanbanBoard from '@/components/projects/KanbanBoard';

type Tab = 'overview' | 'milestones' | 'tasks' | 'bids';

const STATUS_COLORS: Record<ProjectStatus, { bg: string; color: string }> = {
  [ProjectStatus.DRAFT]: { bg: '#e5e7eb', color: '#374151' },
  [ProjectStatus.OPEN]: { bg: '#d1fae5', color: '#065f46' },
  [ProjectStatus.IN_PROGRESS]: { bg: '#dbeafe', color: '#1e40af' },
  [ProjectStatus.REVIEW]: { bg: '#fef3c7', color: '#92400e' },
  [ProjectStatus.COMPLETED]: { bg: '#d1fae5', color: '#064e3b' },
  [ProjectStatus.CLOSED]: { bg: '#f3f4f6', color: '#6b7280' },
  [ProjectStatus.DISPUTED]: { bg: '#fee2e2', color: '#991b1b' },
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  // Demo role toggle — in production this would come from auth context
  const [isOwner] = useState(false);
  const [isClient] = useState(false);
  const [isFreelancer] = useState(true);

  const { bids, acceptBid, rejectBid, refresh: refreshBids } = useBids(typeof id === 'string' ? id : undefined);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    setLoading(true);
    getProject(id)
      .then(setProject)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 16px', color: '#6b7280' }}>Loading…</div>;
  }
  if (error || !project) {
    return (
      <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 16px' }}>
        <div style={{ padding: 16, borderRadius: 8, background: '#fee2e2', color: '#991b1b' }}>{error ?? 'Project not found'}</div>
      </div>
    );
  }

  const statusStyle = STATUS_COLORS[project.status];

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'milestones', label: 'Milestones' },
    { key: 'tasks', label: 'Tasks' },
    ...(isOwner ? [{ key: 'bids' as Tab, label: `Bids (${bids.length})` }] : []),
  ];

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
      <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: 14, marginBottom: 16 }}>
        ← Back
      </button>

      {/* Header */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 700 }}>{project.title}</h1>
            {project.category && <span style={{ fontSize: 14, color: '#6b7280' }}>{project.category}</span>}
          </div>
          <span style={{
            padding: '4px 14px', borderRadius: 14, fontSize: 13, fontWeight: 500,
            background: statusStyle.bg, color: statusStyle.color,
          }}>
            {project.status.replace('_', ' ')}
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 16, fontSize: 15 }}>
          <div>
            <span style={{ color: '#6b7280' }}>Budget: </span>
            <strong style={{ color: '#059669' }}>
              ${project.budget.toLocaleString()}{project.budgetType === BudgetType.HOURLY ? '/hr' : ''}
            </strong>
          </div>
          <div>
            <span style={{ color: '#6b7280' }}>Deadline: </span>
            <span>
              {project.deadline
                ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : 'No deadline'}
            </span>
          </div>
          <div>
            <span style={{ color: '#6b7280' }}>Client: </span>
            <span>{project.clientId}</span>
          </div>
        </div>

        {project.requiredSkills?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
            {project.requiredSkills.map(skill => (
              <span key={skill} style={{ padding: '3px 10px', borderRadius: 12, background: '#eff6ff', color: '#1d4ed8', fontSize: 13 }}>
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: 24, gap: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: activeTab === tab.key ? 600 : 400,
              color: activeTab === tab.key ? '#3b82f6' : '#6b7280',
              borderBottom: activeTab === tab.key ? '2px solid #3b82f6' : '2px solid transparent',
              marginBottom: -2,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 24 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>Description</h2>
          <p style={{ margin: 0, fontSize: 15, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{project.description}</p>

          {project.attachments?.length > 0 && (
            <>
              <h3 style={{ margin: '24px 0 10px', fontSize: 16 }}>Attachments</h3>
              <ul style={{ padding: 0, listStyle: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {project.attachments.map((url, i) => (
                  <li key={i}>
                    <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontSize: 14 }}>
                      📎 Attachment {i + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {activeTab === 'milestones' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Milestones</h2>
            {isClient && (
              <button
                onClick={() => setShowMilestoneForm(true)}
                style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: 14 }}
              >
                + Add Milestone
              </button>
            )}
          </div>
          <MilestoneList
            milestones={project.milestones ?? []}
            isClient={isClient}
            isFreelancer={isFreelancer}
            projectId={project.id}
            onUpdate={() => getProject(project.id).then(setProject)}
          />
          {showMilestoneForm && (
            <MilestoneForm
              projectId={project.id}
              onSuccess={() => {
                setShowMilestoneForm(false);
                getProject(project.id).then(setProject);
              }}
              onCancel={() => setShowMilestoneForm(false)}
            />
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 24 }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 18 }}>Tasks</h2>
          <KanbanBoard projectId={project.id} />
        </div>
      )}

      {activeTab === 'bids' && isOwner && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Bids ({bids.length})</h2>
          {bids.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No bids yet.</p>
          ) : (
            bids.map(bid => (
              <BidCard
                key={bid.id}
                bid={bid}
                isOwner={isOwner}
                onAccept={id => acceptBid(id).then(refreshBids)}
                onReject={id => rejectBid(id).then(refreshBids)}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'bids' && !isOwner && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 24, maxWidth: 560 }}>
          <BidForm projectId={project.id} onSuccess={refreshBids} />
        </div>
      )}
    </div>
  );
}
