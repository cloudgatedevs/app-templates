// Companies page.
import { useState } from 'react';
import { useAsync } from '@/hooks/useAsync';
import { useAuthContext } from '@/auth';
import { companiesApi } from '@/services/crm';
import {
  Card,
  Spinner,
  ErrorState,
  EmptyState,
  Button,
  Input,
  Field,
  PageHeader,
} from '@/components/ui';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';

const BLANK = {
  name: '',
  domain: '',
  industry: '',
  size: '',
  website: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  notes: '',
};

function fromRow(r) {
  return {
    name: r.Name || '',
    domain: r.Domain || '',
    industry: r.Industry || '',
    size: r.Size || '',
    website: r.Website || '',
    phone: r.Phone || '',
    address: r.Address || '',
    city: r.City || '',
    country: r.Country || '',
    notes: r.Notes || '',
  };
}

const Companies = () => {
  const toast = useToast();
  const { headerUser } = useAuthContext();
  const ownerUserId = headerUser?.user?.id;
  const [q, setQ] = useState('');
  const list = useAsync(() => companiesApi.list({ q: q || undefined }), [q]);

  const [editing, setEditing] = useState(null); // row or {} for new
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
    try {
      if (editing?.Id) await companiesApi.update(editing.Id, form);
      else await companiesApi.create({ ...form, ownerUserId });
      toast.success(editing?.Id ? 'Company updated.' : 'Company created.');
      setEditing(null);
      list.reload();
    } catch (err) {
      toast.error(err?.message || 'Failed to save company.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete ${row.Name}?`)) return;
    try {
      await companiesApi.remove(row.Id);
      toast.success('Company deleted.');
      list.reload();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete company.');
    }
  };

  const rows = list.data || [];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Companies"
        subtitle="Accounts and organisations."
        actions={<Button onClick={openNew}>New company</Button>}
      />

      <Card bodyClass="p-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search companies…" className="sm:max-w-xs" />
      </Card>

      <Card bodyClass="overflow-x-auto">
        {list.loading ? (
          <Spinner />
        ) : list.error ? (
          <ErrorState error={list.error} onRetry={list.reload} />
        ) : !rows.length ? (
          <EmptyState title="No companies" action={<Button onClick={openNew}>New company</Button>} />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wide text-slate-600">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Industry</th>
                <th className="px-4 py-3 font-semibold">Website</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.Id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{r.Name}</td>
                  <td className="px-4 py-3 text-slate-600">{r.Industry || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{r.Website || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {[r.City, r.Country].filter(Boolean).join(', ') || '—'}
                  </td>
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
        title={editing?.Id ? 'Edit company' : 'New company'}
        maxWidth="max-w-xl"
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" form="company-form" loading={saving}>
              {editing?.Id ? 'Save changes' : 'Create company'}
            </Button>
          </>
        }
      >
        <form id="company-form" onSubmit={save} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Name" required>
              <Input value={form.name} onChange={set('name')} required />
            </Field>
            <Field label="Domain">
              <Input value={form.domain} onChange={set('domain')} placeholder="acme.com" />
            </Field>
            <Field label="Industry">
              <Input value={form.industry} onChange={set('industry')} />
            </Field>
            <Field label="Size">
              <Input value={form.size} onChange={set('size')} placeholder="1-50" />
            </Field>
            <Field label="Website">
              <Input value={form.website} onChange={set('website')} />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={set('phone')} />
            </Field>
            <Field label="City">
              <Input value={form.city} onChange={set('city')} />
            </Field>
            <Field label="Country">
              <Input value={form.country} onChange={set('country')} />
            </Field>
          </div>
          <Field label="Address">
            <Input value={form.address} onChange={set('address')} />
          </Field>
          <Field label="Notes">
            <Input value={form.notes} onChange={set('notes')} />
          </Field>
        </form>
      </Modal>
    </div>
  );
};

export { Companies };
