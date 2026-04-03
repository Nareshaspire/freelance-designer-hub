import { useState, useEffect, useCallback } from 'react';
import {
  Task,
  TaskStatus,
  CreateTaskInput,
  getProjectTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  moveTask as apiMoveTask,
} from '@/services/projects';

type KanbanColumns = Record<TaskStatus, Task[]>;

function groupByStatus(tasks: Task[]): KanbanColumns {
  const columns: KanbanColumns = {
    [TaskStatus.TODO]: [],
    [TaskStatus.IN_PROGRESS]: [],
    [TaskStatus.REVIEW]: [],
    [TaskStatus.DONE]: [],
  };
  for (const task of tasks) {
    const col = columns[task.status];
    if (col) col.push(task);
  }
  for (const col of Object.values(columns)) {
    col.sort((a, b) => a.order - b.order);
  }
  return columns;
}

export function useKanban(projectId: string) {
  const [columns, setColumns] = useState<KanbanColumns>({
    [TaskStatus.TODO]: [],
    [TaskStatus.IN_PROGRESS]: [],
    [TaskStatus.REVIEW]: [],
    [TaskStatus.DONE]: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tasks = await getProjectTasks(projectId);
      setColumns(groupByStatus(tasks));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const moveTask = useCallback(async (taskId: string, newStatus: TaskStatus, order: number) => {
    // Optimistic update
    setColumns(prev => {
      const next = { ...prev };
      let movedTask: Task | undefined;
      for (const status of Object.keys(next) as TaskStatus[]) {
        const idx = next[status].findIndex(t => t.id === taskId);
        if (idx !== -1) {
          [movedTask] = next[status].splice(idx, 1);
          next[status] = [...next[status]];
          break;
        }
      }
      if (movedTask) {
        movedTask = { ...movedTask, status: newStatus, order };
        next[newStatus] = [...next[newStatus], movedTask].sort((a, b) => a.order - b.order);
      }
      return next;
    });

    try {
      await apiMoveTask(taskId, newStatus, order);
    } catch {
      // Revert on failure
      await refreshTasks();
    }
  }, [refreshTasks]);

  const createTask = useCallback(async (data: CreateTaskInput): Promise<Task> => {
    const task = await apiCreateTask(projectId, data);
    setColumns(prev => {
      const col = prev[task.status] ?? [];
      return {
        ...prev,
        [task.status]: [...col, task].sort((a, b) => a.order - b.order),
      };
    });
    return task;
  }, [projectId]);

  const updateTask = useCallback(async (id: string, data: Partial<CreateTaskInput>): Promise<Task> => {
    const task = await apiUpdateTask(id, data);
    await refreshTasks();
    return task;
  }, [refreshTasks]);

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    await apiDeleteTask(id);
    setColumns(prev => {
      const next = { ...prev };
      for (const status of Object.keys(next) as TaskStatus[]) {
        next[status] = next[status].filter(t => t.id !== id);
      }
      return next;
    });
  }, []);

  return {
    columns,
    loading,
    error,
    moveTask,
    createTask,
    updateTask,
    deleteTask,
    refreshTasks,
  };
}
