import { useState, useEffect, useCallback } from 'react';
import {
  Project,
  ProjectQuery,
  CreateProjectInput,
  getProjects,
  createProject as apiCreateProject,
  updateProject as apiUpdateProject,
  deleteProject as apiDeleteProject,
} from '@/services/projects';

export function useProjects(initialQuery?: ProjectQuery) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<ProjectQuery>(initialQuery || { page: 1, limit: 10 });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProjects(query);
      setProjects(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(async (data: CreateProjectInput): Promise<Project> => {
    const project = await apiCreateProject(data);
    await fetchProjects();
    return project;
  }, [fetchProjects]);

  const updateProject = useCallback(async (id: string, data: Partial<CreateProjectInput>): Promise<Project> => {
    const project = await apiUpdateProject(id, data);
    setProjects(prev => prev.map(p => p.id === id ? project : p));
    return project;
  }, []);

  const deleteProject = useCallback(async (id: string): Promise<void> => {
    await apiDeleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    setTotal(prev => prev - 1);
  }, []);

  return {
    projects,
    total,
    loading,
    error,
    query,
    setQuery,
    createProject,
    updateProject,
    deleteProject,
    refresh: fetchProjects,
  };
}
