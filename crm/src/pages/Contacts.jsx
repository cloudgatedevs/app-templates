// Contacts page.
import { useMemo, useState } from 'react';
import { useAsync } from '@/hooks/useAsync';
import { useAuthContext } from '@/auth';
import { contactsApi, companiesApi } from '@/services/crm';
import {
  Card,
  Spinner,
  ErrorState,
  EmptyState,
  Button,
  Input,
  Select,
  Field,
  PageHeader,
} from '@/components/ui';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { fullName } from '@/services/format';

const BLANK = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  jobTitle: '',
  companyId: '',
};

function fromRow(r) {
  return {
    firstName: r.FirstName || '',
    lastName: r.LastName || '',
    email: r.Email || '',
    phone: r.Phone || '',
    jobTitle: r.JobTitle || '',
    companyId: r.CompanyId || '',
  };
}

const Contacts = () => {
  const toast = useToast();
  const { headerUser } = useAuthContext();
  const ownerUserId = headerUser?.user?.id;
  const [q, setQ] = useState('');
  const list = useAsync(() => contactsApi.list({ q: q || undefined }), [q]);
  const companies = useAsync(() => companiesApi.list(), []);

  const companyMap = useMemo(() => {
    const m = new Map();
    (companies.data || []).forEach((c) => m.set(c.Id, c.Name));
    return m;
  }, [companies.data]);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setForm(BLANK);
    setEditing({});
  };
  const openEdit = (row) => {
    setForm(fromRow(row));
    setEditing(row);
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, companyId: form.companyId ? Number(form.companyId) : null };
    try {
      if (editing?.Id) await contactsApi.update(editing.Id, payload);
      else await contactsApi.create({ ...payload, ownerUserId });
      toast.success(editing?.Id ? 'Contact updated.' : 'Contact created.');
      setEditing(null);
      list.reload();
    } catch (err) {
      toast.error(err?.message || 'Failed to save contact.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete ${fullName(row)}?`)) return;
    try {
      await contactsApi.remove(row.Id);
      toast.success('Contact deleted.');
      list.reload();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete contact.');
    }
  };

  const rows = list.data || [];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Contacts"
        subtitle="People across your accounts."
        actions={<Button onClick={openNew}>New contact</Button>}
      />

      <Card bodyClass="p-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search contacts…" className="sm:max-w-xs" />
      </Card>

      <Card bodyClass="overflow-x-auto">
        {list.loading ? (
          <Spinner />
        ) : list.error ? (
          <ErrorState error={list.error} onRetry={list.reload} />
        ) : !rows.length ? (
          <EmptyState title="No contacts" action={<Button onClick={openNew}>New contact</Button>} />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wide text-slate-600">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.Id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{fullName(r)}</td>
                  <td className="px-4 py-3 text-slate-600">{r.JobTitle || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.CompanyName || companyMap.get(r.CompanyId) || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.Email || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{r.Phone || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-rose-600" onClick={() => remove(r)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal
        open={editing != null}
        onClose={() => setEditing(null)}
        title={editing?.Id ? 'Edit contact' : 'New contact'}
        maxWidth="max-w-xl"
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" form="contact-form" loading={saving}>
              {editing?.Id ? 'Save changes' : 'Create contact'}
            </Button>
          </>
        }
      >
        <form id="contact-form" onSubmit={save} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="First name" required>
              <Input value={form.firstName} onChange={set('firstName')} required />
            </Field>
            <Field label="Last name">
              <Input value={form.lastName} onChange={set('lastName')} />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.email} onChange={set('email')} />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={set('phone')} />
            </Field>
            <Field label="Job title">
              <Input value={form.jobTitle} onChange={set('jobTitle')} />
            </Field>
            <Field label="Company">
              <Select value={form.companyId} onChange={set('companyId')}>
                <option value="">— None —</option>
                {(companies.data || []).map((c) => (
                  <option key={c.Id} value={c.Id}>
                    {c.Name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export { Contacts };
