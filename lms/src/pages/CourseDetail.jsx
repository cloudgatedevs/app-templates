// Course detail page — lessons, quizzes, enrolment.
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAsync } from '@/hooks/useAsync';
import { useStudent } from '@/hooks/useStudent';
import { coursesApi, lessonsApi, quizzesApi, enrollmentsApi } from '@/services/lms';
import { useToast } from '@/components/Toast';
import { Modal } from '@/components/Modal';
import {
  Card, Badge, Spinner, ErrorState, EmptyState, PageHeader, Button,
  Field, Input, Textarea,
} from '@/components/ui';
import { formatNumber } from '@/services/format';
import { coverFor } from '@/services/covers';

function LessonModal({ open, onClose, onSaved, courseId, nextOrder }) {
  const toast = useToast();
  const [form, setForm] = useState({ title: '', content: '', durationMin: '' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  async function save() {
    if (!form.title.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      await lessonsApi.create({ courseId, title: form.title, content: form.content, durationMin: form.durationMin || 0, sortOrder: nextOrder });
      toast.success('Lesson added');
      setForm({ title: '', content: '', durationMin: '' });
      onSaved();
      onClose();
    } catch (e) { toast.error(e?.message || 'Failed'); } finally { setSaving(false); }
  }
  return (
    <Modal open={open} onClose={onClose} title="Add lesson" footer={<>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button loading={saving} onClick={save}>Add lesson</Button>
    </>}>
      <div className="flex flex-col gap-3">
        <Field label="Title" required><Input value={form.title} onChange={(e) => set('title', e.target.value)} /></Field>
        <Field label="Content"><Textarea rows={5} value={form.content} onChange={(e) => set('content', e.target.value)} /></Field>
        <Field label="Duration (minutes)"><Input type="number" min="0" value={form.durationMin} onChange={(e) => set('durationMin', e.target.value)} /></Field>
      </div>
    </Modal>
  );
}

function QuizModal({ open, onClose, onSaved, courseId }) {
  const toast = useToast();
  const [form, setForm] = useState({ title: '', description: '', passingScore: 70 });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  async function save() {
    if (!form.title.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      await quizzesApi.create({ courseId, title: form.title, description: form.description, passingScore: form.passingScore || 70 });
      toast.success('Quiz created');
      setForm({ title: '', description: '', passingScore: 70 });
      onSaved();
      onClose();
    } catch (e) { toast.error(e?.message || 'Failed'); } finally { setSaving(false); }
  }
  return (
    <Modal open={open} onClose={onClose} title="Add quiz" footer={<>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button loading={saving} onClick={save}>Create quiz</Button>
    </>}>
      <div className="flex flex-col gap-3">
        <Field label="Title" required><Input value={form.title} onChange={(e) => set('title', e.target.value)} /></Field>
        <Field label="Description"><Textarea value={form.description} onChange={(e) => set('description', e.target.value)} /></Field>
        <Field label="Passing score (%)"><Input type="number" min="0" max="100" value={form.passingScore} onChange={(e) => set('passingScore', e.target.value)} /></Field>
      </div>
    </Modal>
  );
}

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const student = useStudent();
  const [lessonOpen, setLessonOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  const course = useAsync(() => coursesApi.get(id), [id]);
  const lessons = useAsync(() => lessonsApi.list(id), [id]);
  const quizzes = useAsync(() => quizzesApi.list(id), [id]);

  const c = course.data;
  const lessonRows = lessons.data || [];
  const quizRows = quizzes.data || [];

  async function enroll() {
    setEnrolling(true);
    try {
      await enrollmentsApi.create({ courseId: id, studentName: student.name, studentEmail: student.email });
      toast.success('Enrolled! Find it under My Learning.');
    } catch (e) { toast.error(e?.message || 'Failed to enroll'); } finally { setEnrolling(false); }
  }

  async function removeLesson(lessonId) {
    try { await lessonsApi.remove(lessonId); toast.success('Lesson removed'); lessons.reload(); }
    catch (e) { toast.error(e?.message || 'Failed'); }
  }

  async function deleteCourse() {
    if (!window.confirm('Delete this course and all its lessons?')) return;
    try { await coursesApi.remove(id); toast.success('Course deleted'); navigate('/courses'); }
    catch (e) { toast.error(e?.message || 'Failed'); }
  }

  if (course.loading) return <Card><Spinner /></Card>;
  if (course.error) return <Card><ErrorState error={course.error} onRetry={course.reload} /></Card>;
  if (!c) return <Card><EmptyState title="Course not found" action={<Link to="/courses"><Button variant="secondary">Back to courses</Button></Link>} /></Card>;

  return (
    <div className="flex flex-col gap-6">
      <Link to="/courses" className="text-sm text-indigo-600 hover:underline">← All courses</Link>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        <img
          src={coverFor(c)}
          alt=""
          className="h-36 w-full object-cover"
          style={{ backgroundColor: c.CoverColor || '#0d9488' }}
        />
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color="indigo">{c.Category || 'General'}</Badge>
              <Badge color="gray">{c.Level || 'Beginner'}</Badge>
              {!c.Published && <Badge color="amber">Draft</Badge>}
            </div>
            <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-slate-900">{c.Title}</h1>
            <p className="max-w-2xl text-sm text-slate-600">{c.Summary || c.Description}</p>
            <p className="text-xs text-slate-500">
              {c.Instructor || 'Staff'} · {formatNumber(c.LessonCount)} lessons · {formatNumber(c.EnrollmentCount)} enrolled · {Number(c.DurationHours) || 0}h
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button onClick={enroll} loading={enrolling}>Enroll</Button>
            <Button variant="danger" onClick={deleteCourse}>Delete</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title={`Lessons (${lessonRows.length})`} action={<Button size="sm" variant="secondary" onClick={() => setLessonOpen(true)}>+ Add</Button>}>
            {lessons.loading ? <Spinner /> : lessons.error ? <ErrorState error={lessons.error} onRetry={lessons.reload} /> :
              lessonRows.length === 0 ? <EmptyState title="No lessons yet" message="Add the first lesson to this course." /> : (
              <ol className="divide-y divide-slate-100">
                {lessonRows.map((l, i) => (
                  <li key={l.Id} className="flex items-center gap-3 px-5 py-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">{i + 1}</span>
                    <div className="min-w-0 grow">
                      <p className="truncate text-sm font-medium text-slate-800">{l.Title}</p>
                      {l.Content && <p className="truncate text-xs text-slate-500">{l.Content}</p>}
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">{Number(l.DurationMin) || 0} min</span>
                    <button onClick={() => removeLesson(l.Id)} className="shrink-0 text-xs text-rose-500 hover:underline">Remove</button>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div>
          <Card title={`Quizzes (${quizRows.length})`} action={<Button size="sm" variant="secondary" onClick={() => setQuizOpen(true)}>+ Add</Button>}>
            {quizzes.loading ? <Spinner /> : quizzes.error ? <ErrorState error={quizzes.error} onRetry={quizzes.reload} /> :
              quizRows.length === 0 ? <EmptyState title="No quizzes" message="Add a quiz to assess learners." /> : (
              <ul className="divide-y divide-slate-100">
                {quizRows.map((qz) => (
                  <li key={qz.Id} className="px-5 py-3">
                    <Link to="/quizzes" className="block">
                      <p className="text-sm font-medium text-slate-800 hover:text-indigo-600">{qz.Title}</p>
                      <p className="text-xs text-slate-500">{formatNumber(qz.QuestionCount)} questions · pass {qz.PassingScore}%</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <LessonModal open={lessonOpen} onClose={() => setLessonOpen(false)} onSaved={() => { lessons.reload(); course.reload(); }} courseId={id} nextOrder={lessonRows.length + 1} />
      <QuizModal open={quizOpen} onClose={() => setQuizOpen(false)} onSaved={() => quizzes.reload()} courseId={id} />
    </div>
  );
};

export { CourseDetail };
