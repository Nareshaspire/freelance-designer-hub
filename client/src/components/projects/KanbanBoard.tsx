import React, { useState } from 'react';
import { Task, TaskStatus } from '@/services/projects';
import { useKanban } from '@/hooks/useKanban';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';

const COLUMN_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'Todo',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.REVIEW]: 'Review',
  [TaskStatus.DONE]: 'Done',
};

const COLUMN_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: '#f3f4f6',
  [TaskStatus.IN_PROGRESS]: '#eff6ff',
  [TaskStatus.REVIEW]: '#fefce8',
  [TaskStatus.DONE]: '#f0fdf4',
};

interface Props {
  projectId: string;
}

export default function KanbanBoard({ projectId }: Props) {
  const { columns, loading, moveTask, updateTask, refreshTasks } = useKanban(projectId);
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [addingToCol, setAddingToCol] = useState<TaskStatus | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const columnOrder: TaskStatus[] = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW, TaskStatus.DONE];

  function handleDragStart(e: React.DragEvent<HTMLDivElement>, task: Task) {
    setDraggingTask(task);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>, targetStatus: TaskStatus) {
    e.preventDefault();
    if (!draggingTask || draggingTask.status === targetStatus) {
      setDraggingTask(null);
      return;
    }
    const targetCol = columns[targetStatus];
    const newOrder = targetCol.length > 0 ? targetCol[targetCol.length - 1].order + 1 : 0;
    moveTask(draggingTask.id, targetStatus, newOrder);
    setDraggingTask(null);
  }

  if (loading) {
    return <div style={{ padding: 20, color: '#6b7280' }}>Loading tasks…</div>;
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
        {columnOrder.map(status => {
          const tasks = columns[status] ?? [];
          return (
            <div
              key={status}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, status)}
              style={{
                flex: '1 1 220px',
                minWidth: 220,
                background: COLUMN_COLORS[status],
                borderRadius: 8,
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#374151' }}>
                  {COLUMN_LABELS[status]}
                </h4>
                <span style={{ fontSize: 12, color: '#6b7280', background: '#e5e7eb', borderRadius: 10, padding: '1px 8px' }}>
                  {tasks.length}
                </span>
              </div>

              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={handleDragStart}
                  onClick={t => setEditingTask(t)}
                />
              ))}

              <button
                onClick={() => setAddingToCol(status)}
                style={{
                  marginTop: 4,
                  padding: '6px',
                  borderRadius: 6,
                  border: '1px dashed #d1d5db',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#6b7280',
                  fontSize: 13,
                }}
              >
                + Add task
              </button>
            </div>
          );
        })}
      </div>

      {addingToCol && (
        <TaskForm
          projectId={projectId}
          task={undefined}
          onSuccess={async () => {
            await refreshTasks();
            setAddingToCol(null);
          }}
          onCancel={() => setAddingToCol(null)}
        />
      )}

      {editingTask && (
        <TaskForm
          projectId={projectId}
          task={editingTask}
          onSuccess={async () => {
            await refreshTasks();
            setEditingTask(null);
          }}
          onCancel={() => setEditingTask(null)}
        />
      )}
    </>
  );
}
