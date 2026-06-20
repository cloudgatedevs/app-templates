// Pipeline kanban page.
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsync } from '@/hooks/useAsync';
import { leadsApi, stagesApi } from '@/services/crm';
import { Card, Spinner, ErrorState, EmptyState, PageHeader, Badge } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { formatCurrency, fullName } from '@/services/format';

const UNASSIGNED = '__none__';

const RATING_COLOR = { hot: 'rose', warm: 'amber', cold: 'blue' };

function Rating({ value }) {
  const v = (value == null ? '' : String(value)).trim();
  if (!v) return null;
  return (
    <Badge color={RATING_COLOR[v.toLowerCase()] || 'gray'} dot>
      {v}
    </Badge>
  );
}

const Pipeline = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const stages = useAsync(() => stagesApi.list(), []);
  const leads = useAsync(() => leadsApi.list({ take: 500 }), []);
  const [dragId, setDragId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  const grouped = useMemo(() => {
    const map = new Map();
    (leads.data || []).forEach((l) => {
      const key = l.StageId ?? UNASSIGNED;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(l);
    });
    return map;
  }, [leads.data]);

  const moveTo = async (leadId, stageId) => {
    try {
      await leadsApi.stage(leadId, stageId === UNASSIGNED ? null : Number(stageId));
      toast.success('Lead moved.');
      leads.reload();
    } catch (err) {
      toast.error(err?.message || 'Failed to move lead.');
    }
  };

  const onDrop = (stageKey) => (e) => {
    e.preventDefault();
    setDropTarget(null);
    if (dragId != null) moveTo(dragId, stageKey);
    setDragId(null);
  };

  if (stages.loading || leads.loading) return <Card><Spinner /></Card>;
  if (stages.error) return <Card><ErrorState error={stages.error} onRetry={stages.reload} /></Card>;
  if (leads.error) return <Card><ErrorState error={leads.error} onRetry={leads.reload} /></Card>;

  const columns = [...(stages.data || [])];
  if (grouped.has(UNASSIGNED)) {
    columns.push({ Id: UNASSIGNED, Name: 'Unassigned', Color: '#94a3b8' });
  }

  if (!columns.length) {
    return (
      <Card>
        <EmptyState title="No stages yet" message="Define pipeline stages in Settings to use the board." />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Pipeline" subtitle="Drag leads between stages to update their position." />
      <div className="flex gap-4 overflow-x-auto pb-2">
        {columns.map((stage) => {
          const items = grouped.get(stage.Id) || [];
          const sum = items.reduce((a, l) => a + (Number(l.Value) || 0), 0);
          const isTarget = dropTarget === stage.Id;
          const accent = stage.Color || '#64748b';
          return (
            <div
              key={stage.Id}
              onDragOver={(e) => {
                e.preventDefault();
                setDropTarget(stage.Id);
              }}
              onDragLeave={() => setDropTarget((t) => (t === stage.Id ? null : t))}
              onDrop={onDrop(stage.Id)}
              className={`flex min-h-[60vh] w-72 shrink-0 flex-col overflow-hidden rounded-xl border bg-slate-50 transition-colors ${
                isTarget ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200'
              }`}
            >
              <div className="h-1 w-full shrink-0" style={{ backgroundColor: accent }} />
              <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/95 px-3 py-2.5 backdrop-blur">
                <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-900">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                  <span className="truncate">{stage.Name}</span>
                  <Badge color="gray">{items.length}</Badge>
                </span>
                <span className="shrink-0 text-xs font-medium tabular-nums text-slate-500">
                  {formatCurrency(sum)}
                </span>
              </div>
              <div className="flex grow flex-col gap-2 p-2">
                {items.length === 0 ? (
                  <div className="flex grow items-center justify-center rounded-lg border border-dashed border-slate-200 px-2 py-8 text-center text-xs text-slate-400">
                    {isTarget ? 'Drop leads here' : 'No leads'}
                  </div>
                ) : (
                  items.map((l) => (
                    <div
                      key={l.Id}
                      draggable
                      onDragStart={() => setDragId(l.Id)}
                      onDragEnd={() => setDragId(null)}
                      onClick={() => navigate(`/leads/${l.Id}`)}
                      className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover active:cursor-grabbing"
                    >
                      <p className="truncate text-sm font-medium text-slate-900">{fullName(l)}</p>
                      {l.CompanyName && (
                        <p className="truncate text-xs text-slate-500">{l.CompanyName}</p>
                      )}
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold tabular-nums text-slate-700">
                          {formatCurrency(l.Value)}
                        </span>
                        {l.Rating && <Rating value={l.Rating} />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { Pipeline };
