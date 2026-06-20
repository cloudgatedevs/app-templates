// Course catalog page.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAsync } from '@/hooks/useAsync';
import { coursesApi } from '@/services/lms';
import { useToast } from '@/components/Toast';
import { Modal } from '@/components/Modal';
import {
  Card, Badge, Spinner, ErrorState, EmptyState, PageHeader, Button,
  Field, Input, Textarea, Select,
} from '@/components/ui';
import { coverFor } from '@/services/covers';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const COLORS = ['#0d9488', '#fb7185', '#0ea5e9', '#8b5cf6', '#f59e0b', '#34d399', '#f472b6'];

function CourseCard({ c }) {
  return (
    <Link
      to={`/courses/${c.Id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <img
        src={coverFor(c)}
        alt=""
        loading="lazy"
        className="h-28 w-full object-cover"
        style={{ backgroundColor: c.CoverColor || '#0d9488' }}
      />
      <div className="flex grow flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <Badge color="indigo">{c.Category || 'General'}</Badge>
          <Badge color="gray">{c.Level || 'Beginner'}</Badge>
          {!c.Published && <Badge color="amber">Draft</Badge>}
        </div>
        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600">{c.Title}</h3>
        <p className="line-clamp-2 grow text-xs text-slate-500">{c.Summary}</p>
        <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
          <span>{c.Instructor || 'Staff'}</span>
          <span>{Number(c.LessonCount) || 0} lessons · {Number(c.EnrollmentCount) || 0} enrolled</span>
        </div>
      </div>
    </Link>
  );
}

const emptyForm = { title: '', category: '', level: 'Beginner', instructor: '', summary: '', durationHours: '', coverColor: COLORS[0], published: true };

const Courses = () => {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const courses = useAsync(() => coursesApi.list({ take: 200 }), []);
  const rows = courses.data || [];

  const categories = useMemo(
    () => Array.from(new Set(rows.map((r) => r.Category).filter(Boolean))).sort(),
    [rows],
  );

  const filtered = rows.filter((r) => {
    const matchesQ = !q || `${r.Title} ${r.Summary} ${r.Instructor}`.toLowerCase().includes(q.toLowerCase());
    const matchesCat = !category || r.Category === category;
    return matchesQ && matchesCat;
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function create() {
    if (!form.title.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      await coursesApi.create({
        title: form.title, category: form.category, level: form.level, instructor: form.instructor,
        summary: form.summary, durationHours: form.durationHours || 0, coverColor: form.coverColor,
        published: form.published ? 1 : 0,
      });
      toast.success('Course created');
      setOpen(false);
      setForm(emptyForm);
      courses.reload();
    } catch (e) {
      toast.error(e?.message || 'Failed to create course');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Courses"
        subtitle="Browse and manage the course catalog."
        actions={<Button onClick={() => setOpen(true)}>+ New course</Button>}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input placeholder="Search courses…" value={q} onChange={(e) => setQ(e.target.value)} className="sm:max-w-xs" />
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:max-w-[200px]">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>

      {courses.loading ? (
        <Card><Spinner /></Card>
      ) : courses.error ? (
        <Card><ErrorState error={courses.error} onRetry={courses.reload} /></Card>
      ) : filtered.length === 0 ? (
        <Card><EmptyState title="No courses found" message="Try a different search, or create a new course." /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((c) => <CourseCard key={c.Id} c={c} />)}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New course"
        footer={<>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={create}>Create course</Button>
        </>}
      >
        <div className="flex flex-col gap-3">
          <Field label="Title" required>
            <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Intro to TypeScript" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category"><Input value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="Development" /></Field>
            <Field label="Level">
              <Select value={form.level} onChange={(e) => set('level', e.target.value)}>
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Instructor"><Input value={form.instructor} onChange={(e) => set('instructor', e.target.value)} /></Field>
            <Field label="Duration (hours)"><Input type="number" min="0" value={form.durationHours} onChange={(e) => set('durationHours', e.target.value)} /></Field>
          </div>
          <Field label="Summary"><Textarea value={form.summary} onChange={(e) => set('summary', e.target.value)} placeholder="One-line description shown on the card." /></Field>
          <Field label="Cover colour">
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => set('coverColor', c)}
                  className={`h-7 w-7 rounded-full ring-2 ring-offset-1 ${form.coverColor === c ? 'ring-slate-900' : 'ring-transparent'}`}
                  style={{ backgroundColor: c }} aria-label={c} />
              ))}
            </div>
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
            Published (visible to learners)
          </label>
        </div>
      </Modal>
    </div>
  );
};

export { Courses };
