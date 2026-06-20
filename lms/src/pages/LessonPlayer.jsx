// Lesson player — read lessons, track completion, navigate, take the quiz.
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAsync } from '@/hooks/useAsync';
import { enrollmentsApi, lessonsApi, progressApi, quizzesApi } from '@/services/lms';
import { useToast } from '@/components/Toast';
import { Card, Badge, Button, Spinner, ErrorState, EmptyState } from '@/components/ui';

function CheckCircle({ done, color }) {
  return done ? (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: color || '#0d9488' }}>
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  ) : (
    <span className="h-5 w-5 shrink-0 rounded-full border-2 border-slate-300" />
  );
}

const LessonPlayer = () => {
  const { enrollmentId } = useParams();
  const toast = useToast();
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);

  const enr = useAsync(() => enrollmentsApi.get(enrollmentId), [enrollmentId]);
  const courseId = enr.data?.CourseId;
  const lessons = useAsync(() => (courseId ? lessonsApi.list(courseId) : Promise.resolve([])), [courseId]);
  const progress = useAsync(() => progressApi.forEnrollment(enrollmentId), [enrollmentId]);
  const quizzes = useAsync(() => (courseId ? quizzesApi.list(courseId) : Promise.resolve([])), [courseId]);

  const rows = lessons.data || [];
  const color = enr.data?.CoverColor || '#0d9488';
  const completed = useMemo(() => {
    const set = new Set();
    (progress.data || []).forEach((p) => { if (Number(p.Completed) === 1) set.add(Number(p.LessonId)); });
    return set;
  }, [progress.data]);

  // Land on the first incomplete lesson once data is ready.
  useEffect(() => {
    if (!rows.length) return;
    const idx = rows.findIndex((l) => !completed.has(Number(l.Id)));
    setActive(idx === -1 ? 0 : idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length, progress.data]);

  const lesson = rows[active];
  const pct = Number(enr.data?.ProgressPct) || 0;
  const doneCount = completed.size;

  async function setDone(lessonId, value) {
    setBusy(true);
    try {
      await progressApi.complete(enrollmentId, lessonId, value);
      await Promise.all([progress.reload(), enr.reload()]);
    } catch (e) { toast.error(e?.message || 'Failed'); } finally { setBusy(false); }
  }

  if (enr.loading || lessons.loading) return <Card><Spinner label="Loading course…" /></Card>;
  if (enr.error) return <Card><ErrorState error={enr.error} onRetry={enr.reload} /></Card>;
  if (!enr.data) return <Card><EmptyState title="Enrolment not found" action={<Link to="/learning"><Button variant="secondary">Back to My Learning</Button></Link>} /></Card>;

  const isLast = active >= rows.length - 1;
  const lessonDone = lesson && completed.has(Number(lesson.Id));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link to="/learning" className="text-sm text-indigo-600 hover:underline">← My Learning</Link>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-[26px] font-semibold tracking-tight text-slate-900">{enr.data.CourseTitle}</h1>
            <p className="mt-1 text-sm text-slate-500">{doneCount} of {rows.length} lessons complete</p>
          </div>
          <div className="flex w-full max-w-xs items-center gap-3">
            <div className="h-2 grow overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-700">{pct}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
        {/* Lesson list */}
        <Card title="Lessons" className="h-fit">
          <ul className="max-h-[60vh] overflow-y-auto py-1">
            {rows.map((l, i) => (
              <li key={l.Id}>
                <button
                  onClick={() => setActive(i)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${i === active ? 'bg-indigo-50 text-indigo-800' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <CheckCircle done={completed.has(Number(l.Id))} color={color} />
                  <span className="min-w-0 grow truncate">{i + 1}. {l.Title}</span>
                  <span className="shrink-0 text-xs text-slate-400">{Number(l.DurationMin) || 0}m</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        {/* Lesson content */}
        <div className="flex flex-col gap-5">
          {lesson ? (
            <Card>
              <div className="flex flex-col gap-4 p-6">
                <div className="flex items-center gap-2">
                  <Badge color="indigo">Lesson {active + 1}</Badge>
                  <Badge color="gray">{Number(lesson.DurationMin) || 0} min</Badge>
                  {lessonDone && <Badge color="green" dot>Completed</Badge>}
                </div>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900">{lesson.Title}</h2>
                <p className="whitespace-pre-line text-[15px] leading-7 text-slate-600">
                  {lesson.Content || 'No content for this lesson yet.'}
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <Button variant={lessonDone ? 'secondary' : 'primary'} loading={busy} onClick={() => setDone(lesson.Id, !lessonDone)}>
                    {lessonDone ? 'Mark as not done' : 'Mark complete'}
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="secondary" disabled={active === 0} onClick={() => setActive((i) => Math.max(0, i - 1))}>Previous</Button>
                    <Button variant="secondary" disabled={isLast} onClick={() => setActive((i) => Math.min(rows.length - 1, i + 1))}>Next</Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card><EmptyState title="No lessons yet" message="This course has no lessons." /></Card>
          )}

          {/* Quiz CTA on the last lesson */}
          {isLast && (quizzes.data || []).length > 0 && (
            <Card>
              <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold text-slate-900">Ready to test yourself?</h3>
                  <p className="text-sm text-slate-500">{(quizzes.data || []).length} quiz(zes) available for this course.</p>
                </div>
                <Link to="/quizzes"><Button>Take the quiz</Button></Link>
              </div>
            </Card>
          )}

          {pct >= 100 && (
            <Card className="border-emerald-200 bg-emerald-50">
              <div className="flex flex-col gap-2 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold text-emerald-800">🎉 Course complete!</h3>
                  <p className="text-sm text-emerald-700">Claim your certificate of completion.</p>
                </div>
                <Link to="/certificates"><Button>View certificates</Button></Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export { LessonPlayer };
