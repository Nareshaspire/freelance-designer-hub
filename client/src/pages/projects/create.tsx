import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  CreateProjectInput,
  BudgetType,
  Milestone,
  CreateMilestoneInput,
} from '@/services/projects';
import { createProject, createMilestone } from '@/services/projects';

const CATEGORIES = ['Logo Design', 'Web Design', 'UI/UX', 'Branding', 'Motion Graphics', 'Other'];
const TOTAL_STEPS = 4;

interface FormState {
  title: string;
  description: string;
  category: string;
  budget: number;
  budgetType: BudgetType;
  requiredSkills: string[];
  deadline: string;
  milestones: CreateMilestoneInput[];
}

const initialForm: FormState = {
  title: '',
  description: '',
  category: '',
  budget: 0,
  budgetType: BudgetType.FIXED,
  requiredSkills: [],
  deadline: '',
  milestones: [],
};

function StepIndicator({ step }: { step: number }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div key={i} style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 13,
            fontWeight: step === i + 1 ? 600 : 400,
            color: i + 1 <= step ? '#3b82f6' : '#9ca3af',
          }}>
            {i + 1}. {['Details', 'Skills & Timeline', 'Milestones', 'Review'][i]}
          </div>
        ))}
      </div>
      <div style={{ height: 4, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: '#3b82f6', width: `${(step / TOTAL_STEPS) * 100}%`, transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

export default function CreateProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({ ...initialForm });
  const [skillInput, setSkillInput] = useState('');
  const [milestoneForm, setMilestoneForm] = useState<CreateMilestoneInput>({
    title: '', description: '', amount: 0, dueDate: '', order: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function addSkill() {
    const trimmed = skillInput.trim();
    if (!trimmed || form.requiredSkills.includes(trimmed)) return;
    set('requiredSkills', [...form.requiredSkills, trimmed]);
    setSkillInput('');
  }

  function removeSkill(skill: string) {
    set('requiredSkills', form.requiredSkills.filter(s => s !== skill));
  }

  function addMilestone() {
    if (!milestoneForm.title || !milestoneForm.dueDate) return;
    set('milestones', [...form.milestones, milestoneForm]);
    setMilestoneForm({ title: '', description: '', amount: 0, dueDate: '', order: form.milestones.length + 2 });
  }

  function removeMilestone(idx: number) {
    set('milestones', form.milestones.filter((_, i) => i !== idx));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const input: CreateProjectInput = {
        title: form.title,
        description: form.description,
        budget: form.budget,
        budgetType: form.budgetType,
        category: form.category || undefined,
        requiredSkills: form.requiredSkills.length ? form.requiredSkills : undefined,
        deadline: form.deadline || undefined,
      };
      const project = await createProject(input);
      await Promise.all(form.milestones.map(m => createMilestone(project.id, m)));
      router.push(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      setSubmitting(false);
    }
  }

  const inputStyle = { padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, width: '100%', boxSizing: 'border-box' as const };
  const labelStyle = { display: 'flex' as const, flexDirection: 'column' as const, gap: 4, fontSize: 14 };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ margin: '0 0 28px', fontSize: 28, fontWeight: 700 }}>Post a Project</h1>
      <StepIndicator step={step} />

      {error && (
        <div style={{ padding: 12, borderRadius: 8, background: '#fee2e2', color: '#991b1b', marginBottom: 20 }}>{error}</div>
      )}

      {/* Step 1 — Details */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>Project Details</h2>

          <label style={labelStyle}>
            <span style={{ fontWeight: 500 }}>Title *</span>
            <input type="text" required value={form.title} onChange={e => set('title', e.target.value)} style={inputStyle} placeholder="e.g. Design a modern logo for my startup" />
          </label>

          <label style={labelStyle}>
            <span style={{ fontWeight: 500 }}>Description *</span>
            <textarea required rows={5} value={form.description} onChange={e => set('description', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Describe your project in detail..." />
          </label>

          <label style={labelStyle}>
            <span style={{ fontWeight: 500 }}>Category</span>
            <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <div style={{ display: 'flex', gap: 14 }}>
            <label style={{ ...labelStyle, flex: 1 }}>
              <span style={{ fontWeight: 500 }}>Budget ($) *</span>
              <input type="number" required min={0} value={form.budget} onChange={e => set('budget', Number(e.target.value))} style={inputStyle} />
            </label>
            <label style={{ ...labelStyle, flex: 1 }}>
              <span style={{ fontWeight: 500 }}>Budget Type</span>
              <select value={form.budgetType} onChange={e => set('budgetType', e.target.value as BudgetType)} style={inputStyle}>
                <option value={BudgetType.FIXED}>Fixed</option>
                <option value={BudgetType.HOURLY}>Hourly</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {/* Step 2 — Skills & Timeline */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>Skills & Timeline</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontWeight: 500, fontSize: 14 }}>Required Skills</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="e.g. Figma"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button type="button" onClick={addSkill} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: 14 }}>
                Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {form.requiredSkills.map(skill => (
                <span key={skill} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 12, background: '#eff6ff', color: '#1d4ed8', fontSize: 13 }}>
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#1d4ed8', padding: 0, fontSize: 15 }}>×</button>
                </span>
              ))}
            </div>
          </div>

          <label style={labelStyle}>
            <span style={{ fontWeight: 500 }}>Deadline</span>
            <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} style={inputStyle} />
          </label>
        </div>
      )}

      {/* Step 3 — Milestones */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>Milestones</h2>
            <span style={{ fontSize: 13, color: '#6b7280' }}>Optional</span>
          </div>

          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 style={{ margin: 0, fontSize: 15 }}>Add a Milestone</h4>
            <input type="text" placeholder="Title" value={milestoneForm.title} onChange={e => setMilestoneForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} />
            <textarea placeholder="Description" rows={2} value={milestoneForm.description} onChange={e => setMilestoneForm(f => ({ ...f, description: e.target.value }))} style={{ ...inputStyle, resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <input type="number" placeholder="Amount ($)" min={0} value={milestoneForm.amount || ''} onChange={e => setMilestoneForm(f => ({ ...f, amount: Number(e.target.value) }))} style={{ ...inputStyle, flex: 1 }} />
              <input type="date" value={milestoneForm.dueDate} onChange={e => setMilestoneForm(f => ({ ...f, dueDate: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
            </div>
            <button type="button" onClick={addMilestone} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#059669', color: '#fff', cursor: 'pointer', fontSize: 14, alignSelf: 'flex-start' }}>
              + Add Milestone
            </button>
          </div>

          {form.milestones.length > 0 && (
            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.milestones.map((m, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{m.title}</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>${m.amount} · Due {new Date(m.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                  <button onClick={() => removeMilestone(i)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 18 }}>×</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Step 4 — Review */}
      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>Review & Submit</h2>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['Title', form.title],
              ['Category', form.category || '—'],
              ['Budget', `$${form.budget.toLocaleString()} (${form.budgetType})`],
              ['Deadline', form.deadline ? new Date(form.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'],
              ['Skills', form.requiredSkills.join(', ') || '—'],
              ['Milestones', `${form.milestones.length} milestone${form.milestones.length !== 1 ? 's' : ''}`],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', gap: 12, fontSize: 14 }}>
                <span style={{ width: 100, color: '#6b7280', flexShrink: 0 }}>{label}</span>
                <span style={{ fontWeight: 500 }}>{value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, fontSize: 14 }}>
              <span style={{ width: 100, color: '#6b7280', flexShrink: 0 }}>Description</span>
              <span style={{ color: '#374151', lineHeight: 1.5 }}>{form.description.slice(0, 200)}{form.description.length > 200 ? '…' : ''}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
        <button
          type="button"
          onClick={() => step > 1 ? setStep(s => s - 1) : router.back()}
          style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 15 }}
        >
          {step > 1 ? '← Back' : 'Cancel'}
        </button>

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            disabled={step === 1 && (!form.title || !form.description || form.budget <= 0)}
            style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: (step === 1 && (!form.title || !form.description || form.budget <= 0)) ? '#9ca3af' : '#3b82f6',
              color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 500,
            }}
          >
            Continue →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: submitting ? '#9ca3af' : '#059669', color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 500 }}
          >
            {submitting ? 'Submitting…' : '🚀 Post Project'}
          </button>
        )}
      </div>
    </div>
  );
}
