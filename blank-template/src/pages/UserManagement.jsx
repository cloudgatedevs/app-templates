import { useRef, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { adminUsersRequest as request } from '@/services/idpAdmin';
import { isAdminRole } from '@/auth/roles';
import { useAuthContext } from '@/auth';
import { useAsync, Table, Badge, PageHead, SearchBar, Pager, Spinner, ErrorNote } from '@/components/ui';
import { Modal, Field, Notice } from '@/components/forms';

const SIZE = 25;
const emptyUser = { email: '', name: '', surname: '', phoneNumber: '', password: '' };
export function UserManagement() {
  const { currentUser } = useAuthContext();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [form, setForm] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [notice, setNotice] = useState('');
  const mutation = useRef(false);
  const users = useAsync(async () => {
    const value = await request('list', { skip: page * SIZE, take: SIZE, filter: query });
    if (!Array.isArray(value?.items)) throw new Error('Cloudgate returned an unexpected user list.');
    if (page > 0 && value.items.length === 0) setPage(Math.max(0, Math.ceil(value.totalCount / SIZE) - 1));
    return value;
  }, [query, page]);
  const total = users.data?.totalCount || 0;
  const protectedUser = (user) => isAdminRole(user.role) || String(user.id) === String(currentUser?.user?.id);
  const run = async (operation) => {
    if (mutation.current) return;
    mutation.current = true;
    setBusy(true);
    setActionError(null);
    setNotice('');
    try {
      await operation();
    } catch (err) {
      setActionError(err);
    } finally {
      mutation.current = false;
      setBusy(false);
    }
  };
  const edit = (user) =>
    run(async () => {
      const result = await request('details', { id: user.id });
      if (!result?.id) throw new Error('Unable to load this user. Refresh and try again.');
      setForm({ ...result, password: '' });
    });
  const save = (e) => {
    e.preventDefault();
    run(async () => {
      if (form.id && protectedUser(form)) throw new Error('Administrator accounts are managed in Cloudgate.');
      const payload = {
        email: form.email.trim(),
        name: form.name,
        surname: form.surname,
        phoneNumber: form.phoneNumber,
      };
      if (form.id) payload.id = form.id;
      else payload.password = form.password;
      const saved = await request(form.id ? 'update' : 'create', payload);
      if (!saved?.id) throw new Error('Unable to verify the saved account. Refresh before retrying.');
      setForm(null);
      setNotice('User saved.');
      users.reload();
    });
  };
  const act = () =>
    run(async () => {
      const { user, action } = confirmation;
      if (protectedUser(user)) throw new Error('Administrator accounts are managed in Cloudgate.');
      const result = await request(action, {
        id: user.id,
        ...(action === 'set-active' ? { isActive: !user.isActive } : {}),
      });
      if (
        action === 'delete'
          ? !result?.deleted
          : action === 'request-password-reset'
            ? result?.success !== true
            : !result?.id
      )
        throw new Error('Unable to verify the result. Refresh before retrying.');
      setConfirmation(null);
      setNotice(
        action === 'request-password-reset'
          ? 'Password reset email requested.'
          : action === 'delete'
            ? 'User deleted.'
            : 'User updated.',
      );
      users.reload();
    });
  return (
    <div className="space-y-5">
      <PageHead
        title="User management"
        subtitle="Manage the Cloudgate identities that sign in to your applications."
      >
        <button className="btn-ghost" disabled={busy || users.loading} onClick={users.reload}>
          <RefreshCw size={16} />
          Refresh
        </button>
        <button
          className="btn-primary"
          disabled={busy}
          onClick={() => {
            setActionError(null);
            setForm({ ...emptyUser });
          }}
        >
          <Plus size={16} />
          Add user
        </button>
      </PageHead>
      <Notice>
        These accounts are shared across this Cloudgate tenant. Administrator accounts and roles are managed
        in the Cloudgate hub.
      </Notice>
      <SearchBar
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email or phone…"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(0);
          setQuery(search.trim());
        }}
        onClear={
          query
            ? () => {
                setSearch('');
                setQuery('');
                setPage(0);
              }
            : undefined
        }
      />
      <ErrorNote error={users.error || (!form && !confirmation ? actionError : null)} />
      <Notice>{notice}</Notice>
      {users.loading ? (
        <Spinner />
      ) : (
        <Table
          rows={users.data?.items}
          empty="No users found."
          columns={[
            {
              key: 'name',
              label: 'User',
              mobile: 'title',
              render: (u) => (
                <span className="inline-flex items-center gap-3 font-medium text-mist">
                  <span className="person-avatar" aria-hidden="true">{(u.name || u.email || '?').slice(0, 1).toUpperCase()}{u.surname?.slice(0, 1).toUpperCase()}</span>
                  <span>{[u.name, u.surname].filter(Boolean).join(' ') || u.email}</span>
                </span>
              ),
            },
            { key: 'email', label: 'Email', mobile: 'meta' },
            {
              key: 'role',
              label: 'Role',
              render: (u) => <Badge tone={isAdminRole(u.role) ? 'violet' : 'blue'}>{u.role || 'User'}</Badge>,
            },
            {
              key: 'isActive',
              label: 'Status',
              render: (u) => (
                <Badge tone={u.isActive ? 'green' : 'gray'}>{u.isActive ? 'Active' : 'Disabled'}</Badge>
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              mobile: 'actions',
              render: (u) => (
                <div className="flex flex-wrap gap-2">
                  <button className="btn-ghost btn-sm" disabled={busy} onClick={() => edit(u)}>
                    {protectedUser(u) ? 'View' : 'Edit'}
                  </button>
                  {!protectedUser(u) && (
                    <select
                      className="input max-w-[12rem] py-1 text-xs"
                      aria-label={`Actions for ${u.email}`}
                      value=""
                      disabled={busy}
                      onChange={(e) => {
                        if (e.target.value) {
                          setActionError(null);
                          setConfirmation({ user: u, action: e.target.value });
                        }
                      }}
                    >
                      <option value="">More actions…</option>
                      <option value="set-active">{u.isActive ? 'Disable user' : 'Enable user'}</option>
                      <option value="request-password-reset" disabled={!u.isActive}>
                        Send password reset
                      </option>
                      <option value="delete">Delete user</option>
                    </select>
                  )}
                </div>
              ),
            },
          ]}
        />
      )}
      {!users.loading && (
        <Pager
          page={page}
          pages={Math.max(1, Math.ceil(total / SIZE))}
          total={total}
          from={total ? page * SIZE + 1 : 0}
          to={Math.min(total, (page + 1) * SIZE)}
          noun="users"
          onPage={setPage}
        />
      )}
      <Modal
        open={!!form}
        title={form?.id ? 'User details' : 'Create user'}
        onClose={
          busy
            ? undefined
            : () => {
                setForm(null);
                setActionError(null);
              }
        }
      >
        {form && (
          <form onSubmit={save} className="space-y-4">
            <ErrorNote error={actionError} />
            {[
              ['Email', 'email', 'email', 256],
              ['First name', 'name', 'text', 64],
              ['Surname', 'surname', 'text', 64],
              ['Phone number', 'phoneNumber', 'tel', 32],
              ...(!form.id ? [['Initial password', 'password', 'password', 128]] : []),
            ].map(([label, key, type, max]) => (
              <Field key={key} label={label} id={`user-${key}`}>
                <input
                  className="input"
                  id={`user-${key}`}
                  type={type}
                  maxLength={max}
                  minLength={key === 'password' ? 8 : undefined}
                  required={['email', 'password'].includes(key)}
                  autoComplete={key === 'password' ? 'new-password' : undefined}
                  disabled={busy || (form.id && protectedUser(form))}
                  value={form[key] || ''}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </Field>
            ))}
            {form.id && protectedUser(form) ? (
              <Notice>Manage administrator accounts in Cloudgate.</Notice>
            ) : (
              <button className="btn-primary" disabled={busy}>
                {busy ? 'Saving…' : 'Save user'}
              </button>
            )}
          </form>
        )}
      </Modal>
      <Modal
        open={!!confirmation}
        title={
          confirmation?.action === 'delete'
            ? 'Delete user?'
            : confirmation?.action === 'request-password-reset'
              ? 'Send password reset?'
              : confirmation?.user.isActive
                ? 'Disable user?'
                : 'Enable user?'
        }
        onClose={
          busy
            ? undefined
            : () => {
                setConfirmation(null);
                setActionError(null);
              }
        }
      >
        <p className="break-all font-medium">{confirmation?.user.email}</p>
        <p className="text-sm text-mist-muted">
          {confirmation?.action === 'delete'
            ? 'This removes the tenant app identity. Existing application records are retained.'
            : confirmation?.action === 'request-password-reset'
              ? 'Send a secure reset link by email. The password changes only when the user completes the reset.'
              : confirmation?.user.isActive
                ? 'This account will no longer be able to sign in to applications in this tenant.'
                : 'This account will be able to sign in again.'}
        </p>
        <ErrorNote error={actionError} />
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" disabled={busy} onClick={() => setConfirmation(null)}>
            Cancel
          </button>
          <button
            className={confirmation?.action === 'delete' ? 'btn-danger' : 'btn-primary'}
            disabled={busy}
            onClick={act}
          >
            {busy ? 'Working…' : 'Confirm'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
