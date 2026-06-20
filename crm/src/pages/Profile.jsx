import { useEffect, useState } from 'react';
import { useAuthContext } from '@/auth';
import { Card, Button, Field, Input, PageHeader } from '@/components/ui';

const Profile = () => {
  const { headerUser, updateUser } = useAuthContext();
  const user = headerUser?.user;

  const [form, setForm] = useState({ name: '', surname: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    setForm({
      name: user?.name ?? '',
      surname: user?.surname ?? '',
      email: user?.emailAddress ?? '',
    });
  }, [user?.name, user?.surname, user?.emailAddress]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);
    setSaving(true);
    try {
      await updateUser({ name: form.name, surname: form.surname, email: form.email });
      setStatus({ type: 'success', message: 'Profile updated.' });
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Could not update profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <PageHeader title="Profile" subtitle="Update the details on your IdP account." />

      <Card bodyClass="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {status && (
            <div
              className={[
                'rounded-lg px-4 py-3 text-sm',
                status.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700',
              ].join(' ')}
            >
              {status.message}
            </div>
          )}

          <Field label="First name">
            <Input id="name" type="text" value={form.name} onChange={handleChange('name')} />
          </Field>

          <Field label="Last name">
            <Input id="surname" type="text" value={form.surname} onChange={handleChange('surname')} />
          </Field>

          <Field label="Email">
            <Input id="email" type="email" value={form.email} onChange={handleChange('email')} />
          </Field>

          <div className="flex items-center justify-end">
            <Button type="submit" loading={saving}>
              Save changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export { Profile };
