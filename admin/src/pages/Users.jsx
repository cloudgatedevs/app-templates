import { useState } from 'react';
import { admin } from '@/services/admin';
import { useAsync, Spinner, ErrorNote, Table, Badge, PageHead, Pager, SearchBar, fmtDate } from '@/components/ui';

const PAGE_SIZE = 50;

const roleTone = (r) => (String(r).toLowerCase() === 'admin' ? 'violet' : 'blue');
const statusTone = (s) => {
  const v = String(s ?? '').toLowerCase();
  return v === 'active' ? 'green' : v === 'invited' || v === 'pending' ? 'amber' : v === 'disabled' || v === 'blocked' ? 'red' : 'gray';
};

const Users = () => {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const { data, loading, error, reload } = useAsync(
    () => admin.users({ search: query || undefined, skip: page * PAGE_SIZE, take: PAGE_SIZE }),
    [query, page],
  );

  const rows = data ?? [];
  const total = rows[0]?.TotalCount ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const to = Math.min(total, (page + 1) * PAGE_SIZE);

  const submit = (e) => {
    e.preventDefault();
    setPage(0);
    setQuery(search.trim());
  };

  const pager = (
    <Pager page={page} pages={pages} total={total} from={from} to={to} noun="users" onPage={setPage} />
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHead title="Users" subtitle="Everyone with access to the application, with role and account status.">
        <button onClick={reload} className="btn-ghost">Refresh</button>
      </PageHead>

      <SearchBar
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onSubmit={submit}
        onClear={query ? () => { setSearch(''); setQuery(''); setPage(0); } : undefined}
        placeholder="Search by name or email…"
      />

      <ErrorNote error={error} />
      {loading ? (
        <Spinner />
      ) : (
        <>
          {pager}
          <Table
            columns={[
              {
                key: 'Name',
                label: 'Name',
                mobile: 'title',
                render: (r) =>
                  `${r.Name ?? ''} ${r.Surname ?? ''}`.trim() || <span className="text-mist-dim">Unnamed</span>,
              },
              {
                key: 'Email',
                label: 'Email',
                mobile: 'meta',
                render: (r) => <span className="break-all text-mist-muted">{r.Email || '—'}</span>,
              },
              { key: 'Role', label: 'Role', render: (r) => (r.Role ? <Badge tone={roleTone(r.Role)}>{r.Role}</Badge> : '—') },
              { key: 'Status', label: 'Status', render: (r) => (r.Status ? <Badge tone={statusTone(r.Status)}>{r.Status}</Badge> : '—') },
              { key: 'CreatedAt', label: 'Joined', mobile: 'hide', render: (r) => <span className="whitespace-nowrap">{fmtDate(r.CreatedAt)}</span> },
            ]}
            rows={rows}
            empty={query ? 'No users match the search.' : 'No users yet — publish the /users endpoint and add some data.'}
          />
          {pager}
        </>
      )}
    </div>
  );
};

export { Users };
