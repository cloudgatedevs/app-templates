// Tasks page.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAsync } from '@/hooks/useAsync';
import { useAuthContext } from '@/auth';
import { tasksApi } from '@/services/crm';
import {
  Card,
  Spinner,
  ErrorState,
  EmptyState,
  Button,
  Input,
  Select,
  Field,
  Badge,
  PageHeader,
} from '@/components/ui';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { formatDate, isOverdue, priorityColor } from '@/services/format';

const Tasks = () => {
  const toast = useToast();
  const { headerUser } = useAuthContext();
  const ownerUserId = headerUser?.user?.id;

  const [statusFilter, setStatusFilter] = useState('open');
  const [mineOnly, setMineOnly] = useState(false);

  const list = useAsync(
    () =>
      tasksApi.list({
        status: statusFilter || undefined,
        ownerUserId: mineOnly ? ownerUserId : undefined,
      }),
    [statusFilter, mineOnly, ownerUserId],
  );

  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dueAt: '', priority: 'medium' });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const create = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await tasksApi.create({ ...form, dueAt: form.dueAt || null, status: 'open', ownerUserId });
      toast.success('Task created.');
      setForm({ title: '', description: '', dueAt: '', priority: 'medium' });
      setShowNew(false);
      list.reload();
    } catch (err) {
      toast.error(err?.message || 'Failed to create task.');
    } finally {
      setSaving(false);
    }
  };

  const complete = async (id) => {
    try {
      await tasksApi.complete(id);
      toast.success('Task completed.');
      list.reload();
    } catch (err) {
      toast.error(err?.message || 'Failed to complete task.');
    }
  };

  const rows = list.data || [];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Tasks"
        subtitle="Stay on top of follow-ups and to-dos."
        actions={<Button onClick={() => setShowNew(true)}>New task</Button>}
      />

      <Card bodyClass="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-40">
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="done">Done</option>
          </Select>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={mineOnly}
              onChange={(e) => setMineOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            My tasks only
          </label>
        </div>
      </Card>

      <Card bodyClass="p-2">
        {list.loading ? (
          <Spinner />
        ) : list.error ? (
          <ErrorState error={list.error} onRetry={list.reload} />
        ) : !rows.length ? (
          <EmptyState title="No tasks" message="You're all caught up." action={<Button onClick={() => setShowNew(true)}>New task</Button>} />
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((t) => {
              const done = ['done', 'completed'].includes(String(t.Status).toLowerCase());
              const overdue = isOverdue(t.DueAt) && !done;
              return (
                <li key={t.Id} className="flex items-center gap-3 px-3 py-3">
                  <button
                    type="button"
                    onClick={() => !done && complete(t.Id)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                      done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-400'
                    }`}
                    aria-label="Complete"
                  >
                    {done && '✓'}
                  </button>
                  <div className="min-w-0 grow">
                    <p className={`break-words text-sm font-medium ${done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      {t.Title}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                      {t.DueAt && (
                        <span className={overdue ? 'font-medium text-rose-600' : 'text-slate-400'}>
                          {overdue ? 'Overdue · ' : 'Due '}
                          {formatDate(t.DueAt)}
                        </span>
                      )}
                      {t.LeadId && (
                        <Link to={`/leads/${t.LeadId}`} className="text-indigo-600 hover:underline">
                          View lead
                        </Link>
                      )}
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-2">
                    {t.Priority && <Badge color={priorityColor(t.Priority)}>{t.Priority}</Badge>}
                    <Badge color={done ? 'green' : 'blue'}>{t.Status || 'open'}</Badge>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Modal
        open={showNew}
        onClose={() => setShowNew(false)}
        title="New task"
        maxWidth="max-w-lg"
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setShowNew(false)}>
              Cancel
            </Button>
            <Button type="submit" form="task-form" loading={saving}>
              Create task
            </Button>
          </>
        }
      >
        <form id="task-form" onSubmit={create} className="flex flex-col gap-3">
          <Field label="Title" required>
            <Input value={form.title} onChange={set('title')} required />
          </Field>
          <Field label="Description">
            <Input value={form.description} onChange={set('description')} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Due date">
              <Input type="date" value={form.dueAt} onChange={set('dueAt')} />
            </Field>
            <Field label="Priority">
              <Select value={form.priority} onChange={set('priority')}>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
                <option value="urgent">urgent</option>
              </Select>
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export { Tasks };
