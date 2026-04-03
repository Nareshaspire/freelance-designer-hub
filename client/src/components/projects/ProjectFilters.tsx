import React, { useState } from 'react';
import { ProjectQuery, ProjectStatus } from '@/services/projects';

const CATEGORIES = ['Logo Design', 'Web Design', 'UI/UX', 'Branding', 'Motion Graphics', 'Other'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'budget_desc', label: 'Budget: High to Low' },
  { value: 'budget_asc', label: 'Budget: Low to High' },
  { value: 'deadline', label: 'Deadline' },
];

interface Props {
  query: ProjectQuery;
  onChange: (query: ProjectQuery) => void;
}

export default function ProjectFilters({ query, onChange }: Props) {
  const [skillInput, setSkillInput] = useState('');

  function update(patch: Partial<ProjectQuery>) {
    onChange({ ...query, ...patch, page: 1 });
  }

  function addSkill() {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    const skills = query.skills ?? [];
    if (!skills.includes(trimmed)) {
      update({ skills: [...skills, trimmed] });
    }
    setSkillInput('');
  }

  function removeSkill(skill: string) {
    update({ skills: (query.skills ?? []).filter(s => s !== skill) });
  }

  function reset() {
    onChange({ page: 1, limit: query.limit ?? 10 });
    setSkillInput('');
  }

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff' }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Filters</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Category</label>
        <select
          value={query.category ?? ''}
          onChange={e => update({ category: e.target.value || undefined })}
          style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Budget Range</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="number"
            placeholder="Min"
            value={query.budgetMin ?? ''}
            onChange={e => update({ budgetMin: e.target.value ? Number(e.target.value) : undefined })}
            style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
          />
          <span style={{ color: '#9ca3af' }}>–</span>
          <input
            type="number"
            placeholder="Max"
            value={query.budgetMax ?? ''}
            onChange={e => update({ budgetMax: e.target.value ? Number(e.target.value) : undefined })}
            style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Skills</label>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="text"
            placeholder="Add skill..."
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            style={{ flex: 1, padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
          />
          <button
            onClick={addSkill}
            style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: 14 }}
          >
            Add
          </button>
        </div>
        {(query.skills ?? []).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {(query.skills ?? []).map(skill => (
              <span key={skill} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 12, background: '#eff6ff', color: '#1d4ed8', fontSize: 12 }}>
                {skill}
                <button onClick={() => removeSkill(skill)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#1d4ed8', padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Status</label>
        <select
          value={query.status ?? ''}
          onChange={e => update({ status: (e.target.value as ProjectStatus) || undefined })}
          style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
        >
          <option value="">All Statuses</option>
          {Object.values(ProjectStatus).map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Sort By</label>
        <select
          value={query.sort ?? ''}
          onChange={e => update({ sort: e.target.value || undefined })}
          style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
        >
          <option value="">Best Match</option>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button
          onClick={reset}
          style={{ flex: 1, padding: '8px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 14 }}
        >
          Reset
        </button>
      </div>
    </aside>
  );
}
