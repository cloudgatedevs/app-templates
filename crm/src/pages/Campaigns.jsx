// Campaigns — assemble an audience and send a personalized mass email.
import { useMemo, useState } from 'react';
import { useAsync } from '@/hooks/useAsync';
import { useAuthContext } from '@/auth';
import { leadsApi, stagesApi, emailsApi, importApi } from '@/services/crm';
import {
  Card,
  Button,
  Field,
  Input,
  Textarea,
  Select,
  PageHeader,
  Badge,
  EmptyState,
  ErrorState,
  Spinner,
} from '@/components/ui';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';

const STATUSES = ['new', 'working', 'qualified', 'unqualified', 'customer'];

const SOURCES = [
  { key: 'all', label: 'All leads' },
  { key: 'stage', label: 'By stage' },
  { key: 'status', label: 'By status' },
  { key: 'paste', label: 'Paste emails' },
  { key: 'csv', label: 'Import CSV' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmail(v) {
  return EMAIL_RE.test(String(v || '').trim());
}

// Dedupe recipients by lowercased email, preserving first occurrence.
function dedupe(list) {
  const seen = new Set();
  const out = [];
  for (const r of list) {
    const email = String(r?.email || '').trim();
    if (!email || !isEmail(email)) continue;
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ email, name: r.name || '', leadId: r.leadId ?? null });
  }
  return out;
}

function leadToRecipient(l) {
  return { email: l.Email, name: l.FirstName, leadId: l.Id };
}

// Parse pasted emails separated by newline / comma / semicolon.
function parsePasted(raw) {
  const tokens = String(raw || '')
    .split(/[\s,;]+/)
    .map((t) => t.replace(/^["'<]+|[">']+$/g, '').trim())
    .filter(Boolean);
  return tokens.filter(isEmail).map((email) => ({ email }));
}

// Minimal CSV parser: splits on newlines/commas, strips quotes & whitespace.
// Requires a header row containing at least `email`.
function parseCsv(raw) {
  const lines = String(raw || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 1) return [];
  const splitRow = (line) => line.split(',').map((c) => c.replace(/^["']+|["']+$/g, '').trim());
  const header = splitRow(lines[0]).map((h) => h.toLowerCase());
  const idx = (...names) => {
    for (const n of names) {
      const i = header.indexOf(n);
      if (i !== -1) return i;
    }
    return -1;
  };
  const iEmail = idx('email', 'e-mail', 'emailaddress');
  if (iEmail === -1) return [];
  const iName = idx('name');
  const iFirst = idx('firstname', 'first name', 'first');
  const iLast = idx('lastname', 'last name', 'last');
  const iCompany = idx('company', 'companyname', 'company name');

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitRow(lines[i]);
    const email = cells[iEmail] || '';
    if (!email) continue;
    let name = iName !== -1 ? cells[iName] || '' : '';
    if (!name) {
      const fn = iFirst !== -1 ? cells[iFirst] || '' : '';
      const ln = iLast !== -1 ? cells[iLast] || '' : '';
      name = [fn, ln].filter(Boolean).join(' ');
    }
    rows.push({
      email,
      name,
      firstName: iFirst !== -1 ? cells[iFirst] || '' : name.split(' ')[0] || '',
      lastName: iLast !== -1 ? cells[iLast] || '' : name.split(' ').slice(1).join(' '),
      company: iCompany !== -1 ? cells[iCompany] || '' : '',
    });
  }
  return rows;
}

function applyTemplate(text, name) {
  return String(text || '').replace(/\{\{\s*name\s*\}\}/gi, name || 'there');
}

const Campaigns = () => {
  const toast = useToast();
  const { headerUser } = useAuthContext();
  const ownerUserId = headerUser?.user?.id;

  const stages = useAsync(() => stagesApi.list(), []);

  const [source, setSource] = useState('all');
  const [stageId, setStageId] = useState('');
  const [status, setStatus] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [csvText, setCsvText] = useState('');
  const [csvRows, setCsvRows] = useState([]);
  const [saveAsLeads, setSaveAsLeads] = useState(false);
  const [savingLeads, setSavingLeads] = useState(false);

  // Recipients from lead-backed sources (all/stage/status).
  const leadRecipients = useAsync(async () => {
    if (source === 'all') {
      const rows = await leadsApi.list({});
      return rows.filter((l) => l.Email && String(l.Email).trim()).map(leadToRecipient);
    }
    if (source === 'stage') {
      if (!stageId) return [];
      const rows = await leadsApi.list({ stageId });
      return rows.filter((l) => l.Email && String(l.Email).trim()).map(leadToRecipient);
    }
    if (source === 'status') {
      if (!status) return [];
      const rows = await leadsApi.list({ status });
      return rows.filter((l) => l.Email && String(l.Email).trim()).map(leadToRecipient);
    }
    return [];
  }, [source, stageId, status]);

  // Raw recipients before manual removals, depending on source.
  const baseRecipients = useMemo(() => {
    if (source === 'all' || source === 'stage' || source === 'status') {
      return dedupe(leadRecipients.data || []);
    }
    if (source === 'paste') return dedupe(parsePasted(pasteText));
    if (source === 'csv') {
      return dedupe(csvRows.map((r) => ({ email: r.email, name: r.name })));
    }
    return [];
  }, [source, leadRecipients.data, pasteText, csvRows]);

  // Manually removed emails (lowercased).
  const [removed, setRemoved] = useState(() => new Set());

  const recipients = useMemo(
    () => baseRecipients.filter((r) => !removed.has(r.email.toLowerCase())),
    [baseRecipients, removed],
  );

  const removeOne = (email) =>
    setRemoved((prev) => {
      const next = new Set(prev);
      next.add(email.toLowerCase());
      return next;
    });

  const resetRemovals = () => setRemoved(new Set());

  // Switching source clears manual removals to avoid stale state.
  const chooseSource = (key) => {
    setSource(key);
    setRemoved(new Set());
  };

  const onCsvFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      setCsvText(text);
      setCsvRows(parseCsv(text));
    };
    reader.readAsText(file);
  };

  const onCsvText = (text) => {
    setCsvText(text);
    setCsvRows(parseCsv(text));
  };

  const saveLeadsNow = async () => {
    const rows = csvRows
      .filter((r) => isEmail(r.email))
      .map((r) => ({
        firstName: r.firstName || '',
        lastName: r.lastName || '',
        email: r.email,
        phone: '',
        jobTitle: '',
        companyName: r.company || '',
        source: 'Campaign import',
        city: '',
        country: '',
      }));
    if (!rows.length) {
      toast.error('No valid rows to save.');
      return;
    }
    setSavingLeads(true);
    try {
      const res = await importApi.leads(rows);
      const imported = res?.Imported ?? rows.length;
      toast.success(`Saved ${imported} lead${imported === 1 ? '' : 's'}.`);
    } catch (e) {
      toast.error(e?.message || 'Failed to save leads.');
    } finally {
      setSavingLeads(false);
    }
  };

  // Compose state.
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const canSend = recipients.length > 0 && subject.trim() && body.trim();

  const send = async () => {
    setSending(true);
    setResult(null);
    try {
      if (source === 'csv' && saveAsLeads) {
        await saveLeadsNow().catch(() => {});
      }
      const res = await emailsApi.bulk({ subject, body, recipients, ownerUserId });
      const sent = res?.Sent ?? 0;
      const failed = res?.Failed ?? 0;
      setResult({ sent, failed });
      setConfirmOpen(false);
      toast.success(`Sent ${sent} · Failed ${failed}`);
    } catch (e) {
      setConfirmOpen(false);
      toast.error(e?.message || 'Send failed.');
    } finally {
      setSending(false);
    }
  };

  const previewName = recipients[0]?.name || 'Alex';

  const loadingAudience =
    (source === 'all' || source === 'stage' || source === 'status') && leadRecipients.loading;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Campaigns" subtitle="Mass email — build an audience and send a personalized message." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* ---------- Audience builder ---------- */}
        <div className="flex flex-col gap-5">
          <Card title="Audience">
            <div className="flex flex-col gap-4 p-5">
              <div className="flex flex-wrap gap-1.5">
                {SOURCES.map((s) => (
                  <Button
                    key={s.key}
                    size="sm"
                    variant={source === s.key ? 'primary' : 'secondary'}
                    onClick={() => chooseSource(s.key)}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>

              {source === 'stage' && (
                <Field label="Stage">
                  <Select value={stageId} onChange={(e) => setStageId(e.target.value)}>
                    <option value="">Select a stage…</option>
                    {(stages.data || []).map((s) => (
                      <option key={s.Id} value={s.Id}>
                        {s.Name}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}

              {source === 'status' && (
                <Field label="Status">
                  <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">Select a status…</option>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}

              {source === 'paste' && (
                <Field
                  label="Paste emails"
                  hint="Separate with new lines, commas, or semicolons. Invalid and duplicate addresses are dropped."
                >
                  <Textarea
                    rows={6}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder={'ada@acme.com\ngrace@example.com, alan@example.com'}
                  />
                </Field>
              )}

              {source === 'csv' && (
                <div className="flex flex-col gap-3">
                  <Field
                    label="CSV"
                    hint="Header row must include an 'email' column. Optional: name / firstName / lastName / company."
                  >
                    <Textarea
                      rows={5}
                      value={csvText}
                      onChange={(e) => onCsvText(e.target.value)}
                      className="font-mono text-xs"
                      placeholder={'email,firstName,lastName,company\nada@acme.com,Ada,Lovelace,Acme'}
                    />
                  </Field>
                  <div>
                    <span className="text-xs font-medium text-slate-600">…or upload a .csv file</span>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      className="mt-1 block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-700"
                      onChange={(e) => onCsvFile(e.target.files?.[0])}
                    />
                  </div>
                  {csvRows.length > 0 && (
                    <p className="text-xs text-slate-500">
                      Parsed <span className="font-medium text-slate-700">{csvRows.length}</span> row
                      {csvRows.length === 1 ? '' : 's'}.
                    </p>
                  )}
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={saveAsLeads}
                      onChange={(e) => setSaveAsLeads(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Also save these as leads
                  </label>
                  <div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={saveLeadsNow}
                      loading={savingLeads}
                      disabled={!csvRows.length}
                    >
                      Save as leads
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card
            title="Recipients"
            action={<Badge color="indigo">{recipients.length}</Badge>}
            bodyClass="flex flex-col"
          >
            {loadingAudience ? (
              <Spinner label="Loading audience…" />
            ) : leadRecipients.error ? (
              <ErrorState error={leadRecipients.error} onRetry={leadRecipients.reload} />
            ) : !recipients.length ? (
              <EmptyState
                title="No recipients yet"
                message="Pick a source above to build your audience."
              />
            ) : (
              <>
                {removed.size > 0 && (
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-2 text-xs text-slate-500">
                    <span>{removed.size} removed</span>
                    <button
                      type="button"
                      onClick={resetRemovals}
                      className="font-medium text-indigo-600 hover:underline"
                    >
                      Reset
                    </button>
                  </div>
                )}
                <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                  {recipients.map((r) => (
                    <li
                      key={r.email}
                      className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-slate-900">{r.email}</p>
                        {r.name && <p className="truncate text-xs text-slate-500">{r.name}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOne(r.email)}
                        className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-rose-600"
                        aria-label={`Remove ${r.email}`}
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        </div>

        {/* ---------- Compose + send ---------- */}
        <div className="flex flex-col gap-5">
          <Card title="Compose">
            <div className="flex flex-col gap-4 p-5">
              <Field label="Subject" required>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="A quick note for {{name}}"
                />
              </Field>
              <Field
                label="Body"
                required
                hint="Use {{name}} to personalize with the recipient's first name."
              >
                <Textarea
                  rows={12}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={'Hi {{name}},\n\nWe wanted to reach out about…'}
                />
              </Field>

              {(subject || body) && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    Preview · {previewName}
                  </p>
                  {subject && (
                    <p className="text-sm font-semibold text-slate-900">
                      {applyTemplate(subject, previewName)}
                    </p>
                  )}
                  {body && (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                      {applyTemplate(body, previewName)}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  {recipients.length} recipient{recipients.length === 1 ? '' : 's'}
                </span>
                <Button onClick={() => setConfirmOpen(true)} disabled={!canSend}>
                  Send campaign
                </Button>
              </div>

              {result && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
                  <span className="font-semibold text-emerald-800">Sent {result.sent}</span>
                  <span className="mx-2 text-emerald-400">·</span>
                  <span className="font-semibold text-emerald-800">Failed {result.failed}</span>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-start gap-3 p-5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </span>
              <p className="text-xs leading-relaxed text-slate-500">
                Live delivery requires SendGrid to be configured in Cloudgate (SENDGRID_API_KEY +
                SENDGRID_FROM_EMAIL). Until then, sends are logged with status &lsquo;failed&rsquo; so
                you can still test your audience and content.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={sending ? undefined : () => setConfirmOpen(false)}
        title="Send campaign"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={send} loading={sending}>
              Send
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-700">
          Send to <span className="font-semibold text-slate-900">{recipients.length}</span> recipient
          {recipients.length === 1 ? '' : 's'}?
        </p>
        {source === 'csv' && saveAsLeads && csvRows.length > 0 && (
          <p className="mt-2 text-xs text-slate-500">
            The {csvRows.length} parsed row{csvRows.length === 1 ? '' : 's'} will also be saved as
            leads.
          </p>
        )}
      </Modal>
    </div>
  );
};

export { Campaigns };
