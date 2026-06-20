// LMS dashboard.
import { Link } from 'react-router-dom';
import { useAsync } from '@/hooks/useAsync';
import { dashboardApi } from '@/services/lms';
import { Card, StatCard, Spinner, ErrorState, EmptyState, Badge, PageHeader } from '@/components/ui';
import { formatNumber, formatDateTime } from '@/services/format';

function TopCourses({ rows }) {
  if (!rows.length) {
    return <EmptyState title="No courses yet" message="Create a course to see enrolment activity here." />;
  }
  const max = Math.max(1, ...rows.map((r) => Number(r.Enrollments) || 0));
  return (
    <div className="flex flex-col gap-3 px-5 py-4">
      {rows.map((r) => {
        const n = Number(r.Enrollments) || 0;
        const pct = Math.round((n / max) * 100);
        return (
          <div key={r.Id} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <Link to={`/courses/${r.Id}`} className="flex items-center gap-2 font-medium text-slate-700 hover:text-indigo-600">
                <span className="h-2.5 w-2.5 rounded-full ring-2 ring-white" style={{ backgroundColor: r.CoverColor || '#0d9488' }} />
                {r.Title}
                <span className="text-slate-400">· {r.Category || '—'}</span>
              </Link>
              <span className="font-semibold tabular-nums text-slate-900">{formatNumber(n)} enrolled</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: r.CoverColor || '#0d9488' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RecentEnrollments({ rows }) {
  if (!rows.length) {
    return <EmptyState title="No recent activity" message="New enrolments will appear here." />;
  }
  return (
    <ul className="divide-y divide-slate-100">
      {rows.map((r) => (
        <li key={r.Id} className="flex items-center gap-3 px-5 py-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ backgroundColor: r.CoverColor || '#0d9488' }}>
            {(r.StudentName || '?').trim()[0]?.toUpperCase()}
          </span>
          <div className="min-w-0 grow">
            <p className="truncate text-sm font-medium text-slate-800">{r.StudentName || r.StudentEmail}</p>
            <p className="truncate text-xs text-slate-500">
              {r.CourseTitle || 'Course'} · {formatDateTime(r.EnrolledAt)}
            </p>
          </div>
          <Badge color={String(r.Status).toLowerCase() === 'completed' ? 'green' : 'blue'}>
            {Number(r.ProgressPct) || 0}%
          </Badge>
        </li>
      ))}
    </ul>
  );
}

const Home = () => {
  const stats = useAsync(() => dashboardApi.stats(), []);
  const top = useAsync(() => dashboardApi.topCourses(), []);
  const recent = useAsync(() => dashboardApi.recent(), []);

  const s = stats.data || {};

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" subtitle="Your learning platform at a glance." />

      {stats.loading ? (
        <Card><Spinner /></Card>
      ) : stats.error ? (
        <Card><ErrorState error={stats.error} onRetry={stats.reload} /></Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Courses" value={formatNumber(s.TotalCourses)} sub={`${formatNumber(s.PublishedCourses)} published`} accent="#0d9488" />
          <StatCard label="Lessons" value={formatNumber(s.TotalLessons)} accent="#0ea5e9" />
          <StatCard label="Enrolments" value={formatNumber(s.TotalEnrollments)} accent="#8b5cf6" />
          <StatCard label="Completed" value={formatNumber(s.CompletedEnrollments)} accent="#14b8a6" />
          <StatCard label="Avg Progress" value={`${formatNumber(s.AvgProgress)}%`} accent="#f59e0b" />
          <StatCard label="Certificates" value={formatNumber(s.CertificatesIssued)} accent="#fb7185" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Most popular courses">
          {top.loading ? <Spinner /> : top.error ? <ErrorState error={top.error} onRetry={top.reload} /> : <TopCourses rows={top.data || []} />}
        </Card>

        <Card title="Recent enrolments">
          {recent.loading ? <Spinner /> : recent.error ? <ErrorState error={recent.error} onRetry={recent.reload} /> : <RecentEnrollments rows={recent.data || []} />}
        </Card>
      </div>
    </div>
  );
};

export { Home };
