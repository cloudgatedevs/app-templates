// Lead create/edit form.
import { useEffect, useState } from 'react';
import { Field, Input, Select, Textarea } from '@/components/ui';

const SOURCES = ['Website', 'Referral', 'Cold Outreach', 'Event', 'Social', 'Other'];
const STATUSES = ['new', 'contacted', 'qualified', 'won', 'lost'];

function toDateInput(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export function LeadForm({
  initial,
  stages = [],
  companies = [],
  onSubmit,
  onCancel,
  submitting,
  formId = 'lead-form',
}) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    companyId: '',
    companyName: '',
    source: '',
    status: 'new',
    stageId: '',
    value: '',
    rating: '',
    city: '',
    country: '',
    notes: '',
    nextFollowUpAt: '',
  });

  useEffect(() => {
    if (!initial) return;
    setForm({
      firstName: initial.FirstName || '',
      lastName: initial.LastName || '',
      email: initial.Email || '',
      phone: initial.Phone || '',
      jobTitle: initial.JobTitle || '',
      companyId: initial.CompanyId || '',
      companyName: initial.CompanyName || '',
      source: initial.Source || '',
      status: initial.Status || 'new',
      stageId: initial.StageId || '',
      value: initial.Value ?? '',
      rating: initial.Rating ?? '',
      city: initial.City || '',
      country: initial.Country || '',
      notes: initial.Notes || '',
      nextFollowUpAt: toDateInput(initial.NextFollowUpAt),
    });
  }, [initial]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      companyId: form.companyId ? Number(form.companyId) : null,
      value: form.value === '' ? null : Number(form.value),
      rating: form.rating === '' ? null : form.rating,
      nextFollowUpAt: form.nextFollowUpAt || null,
    };
    // When no stage is selected, omit stageId entirely so the backend defaults
    // the lead to the first stage ("New") instead of storing NULL.
    if (form.stageId) {
      payload.stageId = Number(form.stageId);
    } else {
      delete payload.stageId;
    }
    onSubmit?.(payload);
  };

  return (
    <form id={formId} onSubmit={submit} className="flex flex-col gap-3">
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
          {companies.length ? (
            <Select value={form.companyId} onChange={set('companyId')}>
              <option value="">— None —</option>
              {companies.map((c) => (
                <option key={c.Id} value={c.Id}>
                  {c.Name}
                </option>
              ))}
            </Select>
          ) : (
            <Input
              value={form.companyName}
              onChange={set('companyName')}
              placeholder="Company name"
            />
          )}
        </Field>
        <Field label="Stage">
          <Select value={form.stageId} onChange={set('stageId')}>
            <option value="">— Unassigned —</option>
            {stages.map((s) => (
              <option key={s.Id} value={s.Id}>
                {s.Name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={set('status')}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Source">
          <Select value={form.source} onChange={set('source')}>
            <option value="">— None —</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Deal value (USD)">
          <Input type="number" min="0" step="100" value={form.value} onChange={set('value')} />
        </Field>
        <Field label="Rating">
          <Select value={form.rating} onChange={set('rating')}>
            <option value="">— None —</option>
            <option value="Hot">Hot</option>
            <option value="Warm">Warm</option>
            <option value="Cold">Cold</option>
          </Select>
        </Field>
        <Field label="Next follow-up">
          <Input type="date" value={form.nextFollowUpAt} onChange={set('nextFollowUpAt')} />
        </Field>
        <Field label="City">
          <Input value={form.city} onChange={set('city')} />
        </Field>
        <Field label="Country">
          <Input value={form.country} onChange={set('country')} />
        </Field>
      </div>
      <Field label="Notes">
        <Textarea value={form.notes} onChange={set('notes')} rows={3} />
      </Field>
    </form>
  );
}
