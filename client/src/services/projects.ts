const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export enum BudgetType {
  FIXED = 'fixed',
  HOURLY = 'hourly',
}

export enum ProjectStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  COMPLETED = 'completed',
  CLOSED = 'closed',
  DISPUTED = 'disputed',
}

export enum BidStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

export enum MilestoneStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  budgetType: BudgetType;
  status: ProjectStatus;
  category: string;
  requiredSkills: string[];
  deadline: string;
  attachments: string[];
  clientId: string;
  freelancerId?: string;
  bids?: Bid[];
  milestones?: Milestone[];
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: string;
  projectId: string;
  freelancerId: string;
  proposedRate: number;
  estimatedDuration: string;
  coverLetter: string;
  portfolioSamples: string[];
  status: BidStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: MilestoneStatus;
  deliverableUrl?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  milestoneId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assigneeId?: string;
  priority: TaskPriority;
  dueDate?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateProjectInput {
  title: string;
  description: string;
  budget: number;
  budgetType: BudgetType;
  category?: string;
  requiredSkills?: string[];
  deadline?: string;
}

export interface ProjectQuery {
  category?: string;
  budgetMin?: number;
  budgetMax?: number;
  skills?: string[];
  status?: ProjectStatus;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface CreateBidInput {
  proposedRate: number;
  estimatedDuration: string;
  coverLetter: string;
  portfolioSamples?: string[];
}

export interface CreateMilestoneInput {
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  order: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  milestoneId?: string;
  dueDate?: string;
  order?: number;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `Request failed with status ${res.status}`);
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') return undefined as T;
  return res.json();
}

function buildQuery(query: ProjectQuery): string {
  const params = new URLSearchParams();
  if (query.category) params.set('category', query.category);
  if (query.budgetMin !== undefined) params.set('budgetMin', String(query.budgetMin));
  if (query.budgetMax !== undefined) params.set('budgetMax', String(query.budgetMax));
  if (query.skills?.length) params.set('skills', query.skills.join(','));
  if (query.status) params.set('status', query.status);
  if (query.sort) params.set('sort', query.sort);
  if (query.page !== undefined) params.set('page', String(query.page));
  if (query.limit !== undefined) params.set('limit', String(query.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function getProjects(query?: ProjectQuery): Promise<PaginatedResult<Project>> {
  return apiFetch(`/api/projects${query ? buildQuery(query) : ''}`);
}

export function getProject(id: string): Promise<Project> {
  return apiFetch(`/api/projects/${id}`);
}

export function createProject(data: CreateProjectInput): Promise<Project> {
  return apiFetch('/api/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateProject(id: string, data: Partial<CreateProjectInput>): Promise<Project> {
  return apiFetch(`/api/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteProject(id: string): Promise<void> {
  return apiFetch(`/api/projects/${id}`, { method: 'DELETE' });
}

export function updateProjectStatus(id: string, status: ProjectStatus): Promise<Project> {
  return apiFetch(`/api/projects/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function getProjectBids(projectId: string): Promise<Bid[]> {
  return apiFetch(`/api/projects/${projectId}/bids`);
}

export function createBid(projectId: string, data: CreateBidInput): Promise<Bid> {
  return apiFetch(`/api/projects/${projectId}/bids`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getProjectMilestones(projectId: string): Promise<Milestone[]> {
  return apiFetch(`/api/projects/${projectId}/milestones`);
}

export function createMilestone(projectId: string, data: CreateMilestoneInput): Promise<Milestone> {
  return apiFetch(`/api/projects/${projectId}/milestones`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateMilestone(id: string, data: Partial<CreateMilestoneInput>): Promise<Milestone> {
  return apiFetch(`/api/milestones/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function submitMilestone(id: string, deliverableUrl: string): Promise<Milestone> {
  return apiFetch(`/api/milestones/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify({ deliverableUrl }),
  });
}

export function approveMilestone(id: string): Promise<Milestone> {
  return apiFetch(`/api/milestones/${id}/approve`, { method: 'POST' });
}

export function rejectMilestone(id: string): Promise<Milestone> {
  return apiFetch(`/api/milestones/${id}/reject`, { method: 'POST' });
}

export function getProjectTasks(projectId: string): Promise<Task[]> {
  return apiFetch(`/api/projects/${projectId}/tasks`);
}

export function createTask(projectId: string, data: CreateTaskInput): Promise<Task> {
  return apiFetch(`/api/projects/${projectId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateTask(id: string, data: Partial<CreateTaskInput>): Promise<Task> {
  return apiFetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteTask(id: string): Promise<void> {
  return apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
}

export function moveTask(id: string, status: string, order: number): Promise<Task> {
  return apiFetch(`/api/tasks/${id}/move`, {
    method: 'PATCH',
    body: JSON.stringify({ status, order }),
  });
}
