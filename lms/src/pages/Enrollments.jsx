// My Learning — overview, continue learning, your courses, and activity.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAsync } from '@/hooks/useAsync';
import { useStudent } from '@/hooks/useStudent';
import { enrollmentsApi, certificatesApi, coursesApi, activityApi } from '@/services/lms';
import {
  Card, StatCard, Badge, Spinner, ErrorState, EmptyState, PageHeader, Button,
} from '@/components/ui';
import { formatDate } from '@/services/format';
import { coverFor } from '@/services/covers';

const TYPE_META = {
  lesson: { color: '#0d9488', label: 'Lesson' },
  quiz: { color: '#fb7185', label: 'Quiz' },
  certificate: { color: '#f59e0b', label: 'Certificate' },
  enrolled: { color: '#0ea5e9', label: 'Enrolled' },
};

function timeAgo(s) {
  if (!s) return '';
  const d = new Date(s.replace(' ', 'T') + 'Z');
  if (Number.isNaN(d.getTime())) return formatDate(s);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 3600) return `${Math.max(1, Math.round(diff / 60))}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  const days = Math.round(diff / 86400);
  return days < 30 ? `${days}d ago` : formatDate(s);
}

function computeStreak(activity) {
  const days = new Set((activity || []).map((a) => (a.At || '').slice(0, 10)).filter(Boolean));
  if (!days.size) return 0;
  let streak = 0;
  const d = new Date();
  for (;;) {
    const key = d.toISOString().slice(0, 10);
    if (days.has(key)) { streak += 1; d.setDate(d.getDate() - 1); } else break;
  }
  return streak;
}

function activityLabel(a) {
  switch (a.Type) {
    case 'lesson': return `Completed “${a.Title}”`;
    case 'quiz': return `${Number(a.Passed) === 1 ? 'Passed' : 'Attempted'} ${a.Title} · ${Number(a.Score) || 0}%`;
    case 'certificate': return 'Earned a certificate';
    case 'enrolled': return 'Enrolled in course';
    default: return a.Title || 'Activity';
  }
}

function ProgressBar({ pct, color = '#0d9488' }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Number(pct) || 0)}%`, backgroundColor: color }} />
    </div>
  );
}

function ResumeCard({ e, course }) {
  const pct = Number(e.ProgressPct) || 0;
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <img src={coverFor(course || { Category: e.CourseCategory, CoverColor: e.CoverColor })} alt="" className="h-24 w-full object-cover" style={{ backgroundColor: e.CoverColor || '#0d9488' }} />
      <div className="flex grow flex-col gap-2 p-4">
        <p className="text-sm font-semibold text-slate-900">{e.CourseTitle}</p>
        <div className="flex items-center gap-2">
          <ProgressBar pct={pct} color={e.CoverColor} />
          <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-600">{pct}%</span>
        </div>
        <Link to={`/learn/${e.Id}`} className="mt-1">
          <Button size="sm" className="w-full">Resume</Button>
        </Link>
      </div>
    </div>
  );
}

function CourseRow({ e, course }) {
  const pct = Number(e.ProgressPct) || 0;
  const done = String(e.Status).toLowerCase() === 'completed';
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <img src={coverFor(course || { Category: e.CourseCategory, CoverColor: e.CoverColor })} alt="" className="h-10 w-14 shrink-0 rounded-lg object-cover" style={{ backgroundColor: e.CoverColor || '#0d9488' }} />
      <div className="min-w-0 grow">
        <div className="flex items-center gap-2">
          <Link to={`/courses/${e.CourseId}`} className="truncate text-sm font-medium text-slate-800 hover:text-indigo-600">{e.CourseTitle || 'Course'}</Link>
          <Badge color={done ? 'green' : 'blue'}>{done ? 'Completed' : 'In progress'}</Badge>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <ProgressBar pct={pct} color={e.CoverColor} />
          <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-600">{pct}%</span>
        </div>
      </div>
      <Link to={`/learn/${e.Id}`} className="shrink-0">
        <Button size="sm" variant="secondary">{done ? 'Review' : 'Continue'}</Button>
      </Link>
    </div>
  );
}

const Enrollments = () => {
  const student = useStudent();
  const [scope, setScope] = useState('mine'); // mine | all
  const mine = scope === 'mine';
  const filters = mine ? { studentEmail: student.email } : {};

  const enrollments = useAsync(() => enrollmentsApi.list(filters), [scope, student.email]);
  const courses = useAsync(() => coursesApi.list({ take: 200 }), []);
  const certificates = useAsync(() => certificatesApi.list(filters), [scope, student.email]);
  const activity = useAsync(() => activityApi.list({ ...filters, take: 12 }), [scope, student.email]);

  const rows = enrollments.data || [];
  const courseById = useMemo(
    () => Object.fromEntries((courses.data || []).map((c) => [String(c.Id), c])),
    [courses.data],
  );

  const stats = useMemo(() => {
    const inProgress = rows.filter((e) => String(e.Status).toLowerCase() !== 'completed').length;
    const completed = rows.filter((e) => String(e.Status).toLowerCase() === 'completed').length;
    let hours = 0;
    rows.forEach((e) => {
      const c = courseById[String(e.CourseId)];
      const dur = Number(c?.DurationHours) || 0;
      hours += (dur * (Number(e.ProgressPct) || 0)) / 100;
    });
    return {
      inProgress,
      completed,
      hours: Math.round(hours),
      streak: computeStreak(activity.data),
      certs: (certificates.data || []).length,
    };
  }, [rows, courseById, activity.data, certificates.data]);

  const resume = rows
    .filter((e) => String(e.Status).toLowerCase() !== 'completed' && Number(e.ProgressPct) > 0)
    .sort((a, b) => Number(b.ProgressPct) - Number(a.ProgressPct))
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Learning"
        subtitle="Pick up where you left off and track your progress."
        actions={
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-sm">
            <button onClick={() => setScope('mine')} className={`rounded-md px-3 py-1.5 font-medium ${mine ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>Mine</button>
            <button onClick={() => setScope('all')} className={`rounded-md px-3 py-1.5 font-medium ${!mine ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>Everyone</button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="In progress" value={stats.inProgress} accent="#0d9488" />
        <StatCard label="Completed" value={stats.completed} accent="#14b8a6" />
        <StatCard label="Hours learned" value={`${stats.hours}h`} accent="#0ea5e9" />
        <StatCard label="Day streak" value={`${stats.streak}🔥`} accent="#fb7185" />
        <StatCard label="Certificates" value={stats.certs} accent="#f59e0b" />
      </div>

      {enrollments.loading ? (
        <Card><Spinner /></Card>
      ) : enrollments.error ? (
        <Card><ErrorState error={enrollments.error} onRetry={enrollments.reload} /></Card>
      ) : rows.length === 0 ? (
        <Card><EmptyState title="No enrolments yet" message="Enroll in a course to start learning." action={<Link to="/courses"><Button>Browse courses</Button></Link>} /></Card>
      ) : (
        <>
          {mine && resume.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="font-display text-lg font-semibold text-slate-900">Continue learning</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {resume.map((e) => <ResumeCard key={e.Id} e={e} course={courseById[String(e.CourseId)]} />)}
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card title={mine ? 'Your courses' : 'All enrolments'}>
                <div className="divide-y divide-slate-100">
                  {rows.map((e) => <CourseRow key={e.Id} e={e} course={courseById[String(e.CourseId)]} />)}
                </div>
              </Card>
            </div>

            <div>
              <Card title="Recent activity">
                {activity.loading ? <Spinner /> : (activity.data || []).length === 0 ? (
                  <EmptyState title="No activity yet" message="Complete a lesson to see it here." />
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {(activity.data || []).map((a, i) => {
                      const meta = TYPE_META[a.Type] || TYPE_META.lesson;
                      return (
                        <li key={i} className="flex items-start gap-3 px-5 py-3">
                          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: meta.color }} />
                          <div className="min-w-0 grow">
                            <p className="text-sm text-slate-800">{activityLabel(a)}</p>
                            <p className="truncate text-xs text-slate-500">{a.CourseTitle} · {timeAgo(a.At)}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export { Enrollments };
