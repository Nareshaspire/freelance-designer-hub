import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority, CreateTaskInput, createTask as apiCreateTask, updateTask as apiUpdateTask } from '@/services/projects';

interface Props {
  projectId: string;
  milestoneId?: string;
  task?: Task;
  onSuccess?: (task?: Task) => void;
  onCancel?: () => void;
}

export default function TaskForm({ projectId, milestoneId, task, onSuccess, onCancel }: Props) {
  const [form, setForm] = useState<CreateTaskInput>({
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: task?.status ?? TaskStatus.TODO,
    priority: task?.priority ?? TaskPriority.MEDIUM,
    assigneeId: task?.assigneeId ?? '',
    milestoneId: task?.milestoneId ?? milestoneId,
    dueDate: task?.dueDate ?? '',
    order: task?.order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof CreateTaskInput>(key: K, value: CreateTaskInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: CreateTaskInput = {
        ...form,
        assigneeId: form.assigneeId || undefined,
        dueDate: form.dueDate || undefined,
        milestoneId: form.milestoneId || undefined,
      };
      let result: Task;
      if (task) {
        result = await apiUpdateTask(task.id, payload);
      } else {
        result = await apiCreateTask(projectId, payload);
      }
      onSuccess?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 10px 40px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600 }}>{task ? 'Edit Task' : 'New Task'}</h3>

        {error && (
          <div style={{ padding: 10, borderRadius: 6, background: '#fee2e2', color: '#991b1b', fontSize: 14, marginBottom: 14 }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
            <span style={{ fontWeight: 500 }}>Title</span>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => set('title', e.target.value)}
              style={{ padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
            <span style={{ fontWeight: 500 }}>Description</span>
            <textarea
              rows={3}
              value={form.description ?? ''}
              onChange={e => set('description', e.target.value)}
              style={{ padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, resize: 'vertical' }}
            />
          </label>

          <div style={{ display: 'flex', gap: 12 }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
              <span style={{ fontWeight: 500 }}>Status</span>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value as TaskStatus)}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
              >
                <option value={TaskStatus.TODO}>Todo</option>
                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                <option value={TaskStatus.REVIEW}>Review</option>
                <option value={TaskStatus.DONE}>Done</option>
              </select>
            </label>

            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
              <span style={{ fontWeight: 500 }}>Priority</span>
              <select
                value={form.priority}
                onChange={e => set('priority', e.target.value as TaskPriority)}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
              >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
                <option value={TaskPriority.URGENT}>Urgent</option>
              </select>
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
            <span style={{ fontWeight: 500 }}>Assignee ID</span>
            <input
              type="text"
              placeholder="User ID (optional)"
              value={form.assigneeId ?? ''}
              onChange={e => set('assigneeId', e.target.value)}
              style={{ padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
            />
          </label>

          <div style={{ display: 'flex', gap: 12 }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
              <span style={{ fontWeight: 500 }}>Due Date</span>
              <input
                type="date"
                value={form.dueDate ?? ''}
                onChange={e => set('dueDate', e.target.value)}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
              />
            </label>

            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 }}>
              <span style={{ fontWeight: 500 }}>Order</span>
              <input
                type="number"
                min={0}
                value={form.order ?? 0}
                onChange={e => set('order', Number(e.target.value))}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 14 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ flex: 1, padding: 10, borderRadius: 6, border: 'none', background: saving ? '#9ca3af' : '#3b82f6', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 500 }}
            >
              {saving ? 'Saving…' : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
