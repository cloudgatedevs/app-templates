// Leads list page.
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsync } from '@/hooks/useAsync';
import { useAuthContext } from '@/auth';
import { leadsApi, stagesApi, companiesApi } from '@/services/crm';
import {
  Card,
  Spinner,
  ErrorState,
  EmptyState,
  Badge,
  Button,
  Input,
  Select,
  PageHeader,
} from '@/components/ui';
import { Modal } from '@/components/Modal';
import { LeadForm } from '@/components/LeadForm';
import { useToast } from '@/components/Toast';
import { formatCurrency, formatDate, fullName, statusColor } from '@/services/format';

const STATUSES = ['new', 'contacted', 'qualified', 'won', 'lost'];

const RATING_COLOR = {
  hot: 'rose',
  warm: 'amber',
  cold: 'blue',
};

function Rating({ value }) {
  const v = (value == null ? '' : String(value)).trim();
  if (!v) return <span className="text-slate-300">—</span>;
  const color = RATING_COLOR[v.toLowerCase()] || 'gray';
  return (
    <Badge color={color} dot>
      {v}
    </Badge>
  );
}

function ImportModal({ open, onClose, onDone, stages, ownerUserId }) {
  const toast = useToast();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);

  const parse = (raw) => {
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return [];
    const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
    return lines.slice(1).map((line) => {
      const cells = line.split(',').map((c) => c.trim());
      const row = {};
      header.forEach((h, i) => {
        row[h] = cells[i] ?? '';
      });
      return row;
    });
  };

  const run = async () => {
    const rows = parse(text);
    if (!rows.length) {
      toast.error('Nothing to import. Paste CSV with a header row.');
      return;
    }
    setBusy(true);
    let ok = 0;
    let fail = 0;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      setProgress({ done: i, total: rows.length });
      try {
        await leadsApi.create({
          firstName: r.firstname || r['first name'] || r.first || '',
          lastName: r.lastname || r['last name'] || r.last || '',
          email: r.email || '',
          phone: r.phone || '',
          jobTitle: r.jobtitle || r['job title'] || r.title || '',
          companyName: r.company || r.companyname || '',
          source: r.source || 'Import',
          status: r.status || 'new',
          stageId: stages[0]?.Id ?? null,
          value: r.value ? Number(r.value) : null,
          ownerUserId,
        });
        ok++;
      } catch {
        fail++;
      }
    }
    setBusy(false);
    setProgress(null);
    toast.success(`Imported ${ok} lead${ok === 1 ? '' : 's'}${fail ? `, ${fail} failed` : ''}.`);
    setText('');
    onDone?.();
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onClose}
      title="Import leads from CSV"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={run} loading={busy}>
            {progress ? `Importing ${progress.done}/${progress.total}…` : 'Import'}
          </Button>
        </>
      }
    >
      <p className="mb-2 text-xs text-slate-500">
        Paste CSV with a header row. Recognised columns: firstName, lastName, email, phone, jobTitle,
        company, source, status, value.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder={'firstName,lastName,email,company,value\nAda,Lovelace,ada@acme.com,Acme,5000'}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      />
      <div className="mt-3">
        <label className="text-xs font-medium text-slate-600">…or upload a .csv file</label>
        <input
          type="file"
          accept=".csv,text/csv"
          className="mt-1 block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-700"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => setText(String(reader.result || ''));
            reader.readAsText(file);
          }}
        />
      </div>
    </Modal>
  );
}

const Leads = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { headerUser } = useAuthContext();
  const ownerUserId = headerUser?.user?.id;

  const [q, setQ] = useState('');
  const [stageId, setStageId] = useState('');
  const [status, setStatus] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [saving, setSaving] = useState(false);

  const stages = useAsync(() => stagesApi.list(), []);
  const companies = useAsync(() => companiesApi.list(), []);
  const leads = useAsync(
    () =>
      leadsApi.list({
        q: q || undefined,
        stageId: stageId || undefined,
        status: status || undefined,
        take: 200,
      }),
    [q, stageId, status],
  );

  const stageMap = useMemo(() => {
    const m = new Map();
    (stages.data || []).forEach((s) => m.set(s.Id, s));
    return m;
  }, [stages.data]);

  const createLead = async (payload) => {
    setSaving(true);
    try {
      await leadsApi.create({ ...payload, ownerUserId });
      toast.success('Lead created.');
      setShowNew(false);
      leads.reload();
    } catch (e) {
      toast.error(e?.message || 'Failed to create lead.');
    } finally {
      setSaving(false);
    }
  };

  const rows = leads.data || [];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Leads"
        subtitle="Track and manage your prospects."
        actions={
          <>
            <Button variant="secondary" onClick={() => setShowImport(true)}>
              Import
            </Button>
            <Button onClick={() => setShowNew(true)}>New lead</Button>
          </>
        }
      />

      <Card bodyClass="p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, company…"
            className="sm:max-w-xs"
          />
          <Select value={stageId} onChange={(e) => setStageId(e.target.value)} className="sm:w-44">
            <option value="">All stages</option>
            {(stages.data || []).map((s) => (
              <option key={s.Id} value={s.Id}>
                {s.Name}
              </option>
            ))}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-40">
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card bodyClass="overflow-x-auto">
        {leads.loading ? (
          <Spinner />
        ) : leads.error ? (
          <ErrorState error={leads.error} onRetry={leads.reload} />
        ) : !rows.length ? (
          <EmptyState
            title="No leads found"
            message="Adjust your filters or add your first lead."
            action={<Button onClick={() => setShowNew(true)}>New lead</Button>}
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wide text-slate-600">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Stage</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Value</th>
                <th className="px-4 py-3 font-semibold">Rating</th>
                <th className="px-4 py-3 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((l) => {
                const stage = stageMap.get(l.StageId);
                return (
                  <tr
                    key={l.Id}
                    onClick={() => navigate(`/leads/${l.Id}`)}
                    className="cursor-pointer transition-colors hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-indigo-600 hover:underline">
                        {fullName(l)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{l.CompanyName || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{l.Email || '—'}</td>
                    <td className="px-4 py-3">
                      {stage ? (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ring-slate-200"
                          style={{ color: stage.Color || '#334155' }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: stage.Color || '#64748b' }}
                          />
                          {stage.Name}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={statusColor(l.Status)}>{l.Status || 'new'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                      {formatCurrency(l.Value)}
                    </td>
                    <td className="px-4 py-3">
                      <Rating value={l.Rating} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(l.CreatedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      <Modal
        open={showNew}
        onClose={() => setShowNew(false)}
        title="New lead"
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setShowNew(false)}>
              Cancel
            </Button>
            <Button type="submit" form="lead-create-form" loading={saving}>
              Create lead
            </Button>
          </>
        }
      >
        <LeadForm
          formId="lead-create-form"
          stages={stages.data || []}
          companies={companies.data || []}
          onSubmit={createLead}
          onCancel={() => setShowNew(false)}
          submitting={saving}
        />
      </Modal>

      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onDone={leads.reload}
        stages={stages.data || []}
        ownerUserId={ownerUserId}
      />
    </div>
  );
};

export { Leads };
