import React from 'react';
import { useRouter } from 'next/router';
import { useProjects } from '@/hooks/useProjects';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectFilters from '@/components/projects/ProjectFilters';

function SkeletonCard() {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#fff' }}>
      {[120, 80, 60, 40].map((w, i) => (
        <div key={i} style={{ height: 14, background: '#f3f4f6', borderRadius: 4, width: `${w}%`, marginBottom: 10 }} />
      ))}
    </div>
  );
}

export default function ProjectsIndexPage() {
  const router = useRouter();
  const { projects, total, loading, error, query, setQuery } = useProjects({ page: 1, limit: 10 });

  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const totalPages = Math.ceil(total / limit);
  const from = Math.min((page - 1) * limit + 1, total);
  const to = Math.min(page * limit, total);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Browse Projects</h1>
        <button
          onClick={() => router.push('/projects/create')}
          style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 500 }}
        >
          + Post a Project
        </button>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <div style={{ width: '25%', minWidth: 220, flexShrink: 0 }}>
          <ProjectFilters query={query} onChange={setQuery} />
        </div>

        {/* Main */}
        <div style={{ flex: 1 }}>
          {total > 0 && !loading && (
            <p style={{ margin: '0 0 16px', fontSize: 14, color: '#6b7280' }}>
              Showing {from}–{to} of {total} project{total !== 1 ? 's' : ''}
            </p>
          )}

          {error && (
            <div style={{ padding: 14, borderRadius: 8, background: '#fee2e2', color: '#991b1b', marginBottom: 16 }}>{error}</div>
          )}

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <p style={{ fontSize: 16, margin: 0 }}>No projects found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {projects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => router.push(`/projects/${project.id}`)}
                />
              ))}
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 32 }}>
              <button
                disabled={page <= 1}
                onClick={() => setQuery(q => ({ ...q, page: (q.page ?? 1) - 1 }))}
                style={{ padding: '8px 18px', borderRadius: 6, border: '1px solid #d1d5db', background: page <= 1 ? '#f3f4f6' : '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: 14 }}
              >
                ← Prev
              </button>
              <span style={{ fontSize: 14, color: '#374151' }}>Page {page} of {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setQuery(q => ({ ...q, page: (q.page ?? 1) + 1 }))}
                style={{ padding: '8px 18px', borderRadius: 6, border: '1px solid #d1d5db', background: page >= totalPages ? '#f3f4f6' : '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontSize: 14 }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
