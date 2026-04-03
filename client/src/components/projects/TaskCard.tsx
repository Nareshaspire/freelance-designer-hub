import React from 'react';
import { Task, TaskPriority } from '@/services/projects';

const PRIORITY_STYLES: Record<TaskPriority, { bg: string; color: string }> = {
  [TaskPriority.LOW]: { bg: '#dbeafe', color: '#1e40af' },
  [TaskPriority.MEDIUM]: { bg: '#fef3c7', color: '#92400e' },
  [TaskPriority.HIGH]: { bg: '#fed7aa', color: '#9a3412' },
  [TaskPriority.URGENT]: { bg: '#fee2e2', color: '#991b1b' },
};

interface Props {
  task: Task;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
  onClick?: (task: Task) => void;
}

export default function TaskCard({ task, onDragStart, onClick }: Props) {
  const priorityStyle = PRIORITY_STYLES[task.priority];

  return (
    <div
      draggable
      onDragStart={e => onDragStart?.(e, task)}
      onClick={() => onClick?.(task)}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        padding: '10px 12px',
        background: '#fff',
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        userSelect: 'none',
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{task.title}</span>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          padding: '1px 8px',
          borderRadius: 10,
          fontSize: 11,
          fontWeight: 500,
          background: priorityStyle.bg,
          color: priorityStyle.color,
        }}>
          {task.priority}
        </span>

        {task.dueDate && (
          <span style={{ fontSize: 11, color: '#6b7280' }}>
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      {task.assigneeId && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: '#6b7280', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 600,
          }}>
            {task.assigneeId.slice(0, 2).toUpperCase()}
          </div>
          <span style={{ fontSize: 11, color: '#6b7280' }}>{task.assigneeId}</span>
        </div>
      )}
    </div>
  );
}
