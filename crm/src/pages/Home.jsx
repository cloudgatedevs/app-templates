// Dashboard page.
import { Link } from 'react-router-dom';
import { useAsync } from '@/hooks/useAsync';
import { dashboardApi } from '@/services/crm';
import { Card, StatCard, Spinner, ErrorState, EmptyState, Badge, PageHeader } from '@/components/ui';
import { formatCurrency, formatNumber, formatDateTime, fullName } from '@/services/format';

function PipelineBreakdown({ rows }) {
  if (!rows.length) {
    return <EmptyState title="No pipeline data" message="Create leads and assign stages to see the breakdown." />;
  }
  const max = Math.max(1, ...rows.map((r) => Number(r.Value) || 0));
  const totalValue = rows.reduce((a, r) => a + (Number(r.Value) || 0), 0);
  return (
    <div className="flex flex-col gap-3 px-5 py-4">
      {rows.map((r) => {
        const value = Number(r.Value) || 0;
        const pct = Math.round((value / max) * 100);
        return (
          <div key={r.StageId ?? r.StageName} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <span
                  className="h-2.5 w-2.5 rounded-full ring-2 ring-white"
                  style={{ backgroundColor: r.Color || '#94a3b8' }}
                />
                {r.StageName || 'Unassigned'}
                <span className="text-slate-400">· {formatNumber(r.Count)} leads</span>
              </span>
              <span className="font-semibold tabular-nums text-slate-900">{formatCurrency(value)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: r.Color || '#4f46e5' }}
              />
            </div>
          </div>
        );
      })}
      <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <span className="font-medium text-slate-500">Total open pipeline</span>
        <span className="font-semibold tabular-nums text-slate-900">{formatCurrency(totalValue)}</span>
      </div>
    </div>
  );
}

function RecentActivity({ rows }) {
  if (!rows.length) {
    return <EmptyState title="No recent activity" message="Logged notes, calls and emails show up here." />;
  }
  return (
    <ul className="divide-y divide-slate-100">
      {rows.map((r) => (
        <li key={r.Id} className="flex items-start gap-3 px-5 py-3">
          <span className="mt-0.5 flex w-[68px] shrink-0 justify-start">
            <Badge color="violet">{r.Type || 'note'}</Badge>
          </span>
          <div className="min-w-0 grow">
            <p className="truncate text-sm font-medium text-slate-800">
              {r.Subject || r.Body || 'Activity'}
            </p>
            <p className="text-xs text-slate-500">
              {r.LeadId ? (
                <Link className="text-indigo-600 hover:underline" to={`/leads/${r.LeadId}`}>
                  {fullName(r)}
                </Link>
              ) : (
                fullName(r)
              )}
              {' · '}
              {formatDateTime(r.CreatedAt)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

const Home = () => {
  const stats = useAsync(() => dashboardApi.stats(), []);
  const byStage = useAsync(() => dashboardApi.byStage(), []);
  const recent = useAsync(() => dashboardApi.recent(), []);

  const s = stats.data || {};

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" subtitle="Your pipeline at a glance." />

      {stats.loading ? (
        <Card><Spinner /></Card>
      ) : stats.error ? (
        <Card><ErrorState error={stats.error} onRetry={stats.reload} /></Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Total Leads" value={formatNumber(s.TotalLeads)} accent="#4f46e5" />
          <StatCard label="Pipeline Value" value={formatCurrency(s.PipelineValue)} accent="#7c3aed" />
          <StatCard label="Won Value" value={formatCurrency(s.WonValue)} sub={`${formatNumber(s.WonLeads)} won`} accent="#10b981" />
          <StatCard label="Open Tasks" value={formatNumber(s.OpenTasks)} accent="#f59e0b" />
          <StatCard label="Companies" value={formatNumber(s.Companies)} accent="#6366f1" />
          <StatCard label="Emails Sent" value={formatNumber(s.EmailsSent)} accent="#0ea5e9" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Pipeline by stage">
          {byStage.loading ? (
            <Spinner />
          ) : byStage.error ? (
            <ErrorState error={byStage.error} onRetry={byStage.reload} />
          ) : (
            <PipelineBreakdown rows={byStage.data || []} />
          )}
        </Card>

        <Card title="Recent activity">
          {recent.loading ? (
            <Spinner />
          ) : recent.error ? (
            <ErrorState error={recent.error} onRetry={recent.reload} />
          ) : (
            <RecentActivity rows={recent.data || []} />
          )}
        </Card>
      </div>
    </div>
  );
};

export { Home };
