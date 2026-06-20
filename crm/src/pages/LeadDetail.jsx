// Lead detail page.
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAsync } from '@/hooks/useAsync';
import { useAuthContext } from '@/auth';
import {
  leadsApi,
  stagesApi,
  companiesApi,
  activitiesApi,
  emailsApi,
  tasksApi,
  tagsApi,
} from '@/services/crm';
import {
  Card,
  Spinner,
  ErrorState,
  EmptyState,
  Badge,
  Button,
  Input,
  Select,
  Textarea,
  Field,
} from '@/components/ui';
import { Modal } from '@/components/Modal';
import { LeadForm } from '@/components/LeadForm';
import { useToast } from '@/components/Toast';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  fullName,
  statusColor,
  isOverdue,
} from '@/services/format';

const TABS = ['Activities', 'Emails', 'Tasks', 'Tags'];
const ACTIVITY_TYPES = ['note', 'call', 'meeting', 'email', 'task'];

function ActivitiesTab({ leadId, ownerUserId }) {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => activitiesApi.list(leadId), [leadId]);
  const [type, setType] = useState('note');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  const add = async (e) => {
    e.preventDefault();
    if (!body.trim() && !subject.trim()) return;
    setBusy(true);
    try {
      await activitiesApi.create({ leadId, type, subject, body, ownerUserId });
      setSubject('');
      setBody('');
      toast.success('Activity logged.');
      reload();
    } catch (err) {
      toast.error(err?.message || 'Failed to log activity.');
    } finally {
      setBusy(false);
    }
  };

  const rows = data || [];
  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={add} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="flex gap-2">
          <Select value={type} onChange={(e) => setType(e.target.value)} className="w-32">
            {ACTIVITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject (optional)"
          />
        </div>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Log a note, call summary…" rows={2} />
        <div className="flex justify-end">
          <Button type="submit" size="sm" loading={busy}>
            Log activity
          </Button>
        </div>
      </form>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !rows.length ? (
        <EmptyState title="No activity yet" message="Logged notes and calls appear here." />
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((a) => (
            <li key={a.Id} className="flex gap-3">
              <div className="mt-1 flex flex-col items-center">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                <span className="mt-1 w-px grow bg-slate-200" />
              </div>
              <div className="min-w-0 grow pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex w-[68px] shrink-0 justify-start">
                    <Badge color="violet">{a.Type || 'note'}</Badge>
                  </span>
                  {a.Subject && (
                    <span className="min-w-0 break-words text-sm font-medium text-slate-800">{a.Subject}</span>
                  )}
                  <span className="ml-auto shrink-0 text-xs text-slate-400">{formatDateTime(a.CreatedAt)}</span>
                </div>
                {a.Body && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{a.Body}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmailsTab({ lead, ownerUserId }) {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => emailsApi.list(lead.Id), [lead.Id]);
  const [to, setTo] = useState(lead.Email || '');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    if (!to.trim()) {
      toast.error('Recipient email is required.');
      return;
    }
    setBusy(true);
    try {
      await emailsApi.send({ leadId: lead.Id, to, subject, body, ownerUserId });
      toast.success('Email sent.');
      setSubject('');
      setBody('');
      reload();
    } catch (err) {
      toast.error(err?.message || 'Email could not be sent. Configure SendGrid in Settings.');
    } finally {
      setBusy(false);
    }
  };

  const rows = data || [];
  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={send} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="To" type="email" />
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message…" rows={4} />
        <div className="flex justify-end">
          <Button type="submit" size="sm" loading={busy}>
            Send email
          </Button>
        </div>
      </form>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !rows.length ? (
        <EmptyState title="No emails yet" message="Sent and received emails for this lead appear here." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.map((m) => (
            <li key={m.Id} className="py-3">
              <div className="flex items-center gap-2">
                <span className="flex w-[76px] shrink-0 justify-start">
                  <Badge color={String(m.Direction).toLowerCase() === 'outbound' ? 'blue' : 'gray'}>
                    {m.Direction || 'outbound'}
                  </Badge>
                </span>
                <span className="min-w-0 grow truncate text-sm font-medium text-slate-800">
                  {m.Subject || '(no subject)'}
                </span>
                <span className="ml-auto shrink-0 text-xs text-slate-400">
                  {formatDateTime(m.SentAt || m.CreatedAt)}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {m.FromEmail} → {m.ToEmail}
                {m.Status ? ` · ${m.Status}` : ''}
                {m.OpenedAt ? ' · opened' : ''}
              </p>
              {m.Body && (
                <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-slate-600">{m.Body}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TasksTab({ leadId, ownerUserId }) {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => tasksApi.list({ leadId }), [leadId]);
  const [title, setTitle] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [priority, setPriority] = useState('medium');
  const [busy, setBusy] = useState(false);

  const add = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await tasksApi.create({ title, leadId, dueAt: dueAt || null, priority, status: 'open', ownerUserId });
      setTitle('');
      setDueAt('');
      toast.success('Task added.');
      reload();
    } catch (err) {
      toast.error(err?.message || 'Failed to add task.');
    } finally {
      setBusy(false);
    }
  };

  const complete = async (id) => {
    try {
      await tasksApi.complete(id);
      toast.success('Task completed.');
      reload();
    } catch (err) {
      toast.error(err?.message || 'Failed to complete task.');
    }
  };

  const rows = data || [];
  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={add} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-end">
        <Field label="Task" className="grow">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Follow up call…" />
        </Field>
        <Field label="Due">
          <Input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
        </Field>
        <Field label="Priority">
          <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="urgent">urgent</option>
          </Select>
        </Field>
        <Button type="submit" size="sm" loading={busy}>
          Add
        </Button>
      </form>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !rows.length ? (
        <EmptyState title="No tasks" message="Add a task to keep this deal moving." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.map((t) => {
            const done = String(t.Status).toLowerCase() === 'done' || String(t.Status).toLowerCase() === 'completed';
            return (
              <li key={t.Id} className="flex items-center gap-3 py-2.5">
                <button
                  type="button"
                  onClick={() => !done && complete(t.Id)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-400'
                  }`}
                  aria-label="Complete"
                >
                  {done && '✓'}
                </button>
                <div className="grow">
                  <p className={`text-sm ${done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{t.Title}</p>
                  {t.DueAt && (
                    <p className={`text-xs ${isOverdue(t.DueAt) && !done ? 'text-rose-600' : 'text-slate-400'}`}>
                      Due {formatDate(t.DueAt)}
                    </p>
                  )}
                </div>
                <Badge color={done ? 'green' : 'blue'}>{t.Status || 'open'}</Badge>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function TagsTab({ leadId }) {
  const toast = useToast();
  const assigned = useAsync(() => tagsApi.forLead(leadId), [leadId]);
  const all = useAsync(() => tagsApi.list(), []);

  const assignedIds = useMemo(() => new Set((assigned.data || []).map((t) => t.Id)), [assigned.data]);

  const toggle = async (tag) => {
    try {
      if (assignedIds.has(tag.Id)) {
        await tagsApi.unassign(leadId, tag.Id);
      } else {
        await tagsApi.assign(leadId, tag.Id);
      }
      assigned.reload();
    } catch (err) {
      toast.error(err?.message || 'Failed to update tag.');
    }
  };

  if (assigned.loading || all.loading) return <Spinner />;
  if (all.error) return <ErrorState error={all.error} onRetry={all.reload} />;

  const tags = all.data || [];
  if (!tags.length) {
    return <EmptyState title="No tags defined" message="Create tags in Settings to organise leads." />;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const on = assignedIds.has(tag.Id);
        return (
          <button
            key={tag.Id}
            type="button"
            onClick={() => toggle(tag)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              on ? 'border-transparent text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
            style={on ? { backgroundColor: tag.Color || '#4f46e5' } : undefined}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: on ? '#fff' : tag.Color || '#94a3b8' }} />
            {tag.Name}
          </button>
        );
      })}
    </div>
  );
}

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { headerUser } = useAuthContext();
  const ownerUserId = headerUser?.user?.id;

  const lead = useAsync(() => leadsApi.get(id), [id]);
  const stages = useAsync(() => stagesApi.list(), []);
  const companies = useAsync(() => companiesApi.list(), []);

  const [tab, setTab] = useState('Activities');
  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  const changeStage = async (stageId) => {
    try {
      await leadsApi.stage(id, stageId ? Number(stageId) : null);
      toast.success('Stage updated.');
      lead.reload();
    } catch (err) {
      toast.error(err?.message || 'Failed to update stage.');
    }
  };

  const saveEdit = async (payload) => {
    setSaving(true);
    try {
      await leadsApi.update(id, payload);
      toast.success('Lead updated.');
      setShowEdit(false);
      lead.reload();
    } catch (err) {
      toast.error(err?.message || 'Failed to update lead.');
    } finally {
      setSaving(false);
    }
  };

  if (lead.loading) return <Card><Spinner /></Card>;
  if (lead.error) return <Card><ErrorState error={lead.error} onRetry={lead.reload} /></Card>;

  const l = lead.data;
  if (!l) {
    return (
      <Card>
        <EmptyState title="Lead not found" action={<Button onClick={() => navigate('/leads')}>Back to leads</Button>} />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Link to="/leads" className="text-sm text-indigo-600 hover:underline">
        ← Back to leads
      </Link>

      <Card bodyClass="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{fullName(l)}</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {[l.JobTitle, l.CompanyName].filter(Boolean).join(' · ') || 'No company'}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              {l.Email && <span>{l.Email}</span>}
              {l.Phone && <span>{l.Phone}</span>}
              {(l.City || l.Country) && <span>{[l.City, l.Country].filter(Boolean).join(', ')}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge color={statusColor(l.Status)}>{l.Status || 'new'}</Badge>
            <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)}>
              Edit
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Stage">
            <Select value={l.StageId || ''} onChange={(e) => changeStage(e.target.value)}>
              <option value="">— Unassigned —</option>
              {(stages.data || []).map((s) => (
                <option key={s.Id} value={s.Id}>
                  {s.Name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Value</p>
            <p className="text-lg font-semibold tabular-nums text-slate-900">{formatCurrency(l.Value)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Rating</p>
            <div className="mt-1">
              {l.Rating ? (
                <Badge
                  color={
                    { hot: 'rose', warm: 'amber', cold: 'blue' }[String(l.Rating).toLowerCase()] ||
                    'gray'
                  }
                  dot
                >
                  {l.Rating}
                </Badge>
              ) : (
                <span className="text-sm text-slate-400">—</span>
              )}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Next follow-up</p>
            <p className="text-sm font-medium text-slate-800">{formatDate(l.NextFollowUpAt)}</p>
          </div>
        </div>
        {l.Notes && <p className="mt-4 whitespace-pre-wrap text-sm text-slate-600">{l.Notes}</p>}
      </Card>

      <Card>
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-3 pt-2">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`shrink-0 rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === t ? 'text-indigo-700 shadow-[0_-2px_0_inset_#4f46e5]' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === 'Activities' && <ActivitiesTab leadId={l.Id} ownerUserId={ownerUserId} />}
          {tab === 'Emails' && <EmailsTab lead={l} ownerUserId={ownerUserId} />}
          {tab === 'Tasks' && <TasksTab leadId={l.Id} ownerUserId={ownerUserId} />}
          {tab === 'Tags' && <TagsTab leadId={l.Id} />}
        </div>
      </Card>

      <Modal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit lead"
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setShowEdit(false)}>
              Cancel
            </Button>
            <Button type="submit" form="lead-edit-form" loading={saving}>
              Save changes
            </Button>
          </>
        }
      >
        <LeadForm
          formId="lead-edit-form"
          initial={l}
          stages={stages.data || []}
          companies={companies.data || []}
          onSubmit={saveEdit}
          onCancel={() => setShowEdit(false)}
          submitting={saving}
        />
      </Modal>
    </div>
  );
};

export { LeadDetail };
