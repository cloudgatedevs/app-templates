import { useEffect, useState } from 'react';
import { useAuthContext } from '@/auth';

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
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-600">Update the details on your IdP account.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {status && (
          <div
            className={[
              'rounded-lg px-4 py-3 text-sm',
              status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700',
            ].join(' ')}
          >
            {status.message}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-900" htmlFor="name">
            First name
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={handleChange('name')}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-900" htmlFor="surname">
            Last name
          </label>
          <input
            id="surname"
            type="text"
            value={form.surname}
            onChange={handleChange('surname')}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-900" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export { Profile };
