import React from 'react';
import { Project, ProjectStatus, BudgetType } from '@/services/projects';

const STATUS_COLORS: Record<ProjectStatus, { bg: string; color: string }> = {
  [ProjectStatus.DRAFT]: { bg: '#e5e7eb', color: '#374151' },
  [ProjectStatus.OPEN]: { bg: '#d1fae5', color: '#065f46' },
  [ProjectStatus.IN_PROGRESS]: { bg: '#dbeafe', color: '#1e40af' },
  [ProjectStatus.REVIEW]: { bg: '#fef3c7', color: '#92400e' },
  [ProjectStatus.COMPLETED]: { bg: '#d1fae5', color: '#064e3b' },
  [ProjectStatus.CLOSED]: { bg: '#f3f4f6', color: '#6b7280' },
  [ProjectStatus.DISPUTED]: { bg: '#fee2e2', color: '#991b1b' },
};

function formatBudget(budget: number, budgetType: BudgetType): string {
  const formatted = budget.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  return budgetType === BudgetType.HOURLY ? `${formatted}/hr` : formatted;
}

function formatDeadline(deadline?: string): string {
  if (!deadline) return 'No deadline';
  const date = new Date(deadline);
  return `Due: ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

interface Props {
  project: Project;
  onClick?: () => void;
}

export default function ProjectCard({ project, onClick }: Props) {
  const statusStyle = STATUS_COLORS[project.status] || { bg: '#e5e7eb', color: '#374151' };
  const visibleSkills = project.requiredSkills?.slice(0, 3) ?? [];
  const extraSkills = (project.requiredSkills?.length ?? 0) - visibleSkills.length;
  const shortDesc = project.description?.length > 100
    ? project.description.slice(0, 100) + '…'
    : project.description ?? '';

  return (
    <div
      onClick={onClick}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: '16px',
        cursor: onClick ? 'pointer' : 'default',
        background: '#fff',
        transition: 'box-shadow 0.15s',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
      onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111827', flex: 1 }}>{project.title}</h3>
        <span style={{
          padding: '2px 8px',
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 500,
          background: statusStyle.bg,
          color: statusStyle.color,
          whiteSpace: 'nowrap',
        }}>
          {project.status.replace('_', ' ')}
        </span>
      </div>

      {project.category && (
        <span style={{ fontSize: 12, color: '#6b7280' }}>{project.category}</span>
      )}

      <p style={{ margin: 0, fontSize: 14, color: '#4b5563', lineHeight: 1.4 }}>{shortDesc}</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
        <strong style={{ color: '#059669' }}>{formatBudget(project.budget, project.budgetType)}</strong>
        <span style={{ color: '#6b7280' }}>{formatDeadline(project.deadline)}</span>
      </div>

      {visibleSkills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {visibleSkills.map(skill => (
            <span key={skill} style={{
              padding: '2px 8px',
              borderRadius: 12,
              background: '#eff6ff',
              color: '#1d4ed8',
              fontSize: 12,
            }}>
              {skill}
            </span>
          ))}
          {extraSkills > 0 && (
            <span style={{ padding: '2px 8px', borderRadius: 12, background: '#f3f4f6', color: '#6b7280', fontSize: 12 }}>
              +{extraSkills} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
