import { useState } from 'react';
import { admin } from '@/services/admin';
import { useAsync, Spinner, ErrorNote, Table, Badge, PageHead, Pager, SearchBar, fmtDate, fmtCurrency } from '@/components/ui';

const PAGE_SIZE = 50;

export const orderStatusTone = (s) => {
  const v = String(s ?? '').toLowerCase();
  if (v === 'paid' || v === 'completed' || v === 'delivered') return 'green';
  if (v === 'pending' || v === 'processing') return 'amber';
  if (v === 'shipped') return 'blue';
  if (v === 'cancelled' || v === 'refunded' || v === 'failed') return 'red';
  return 'gray';
};

const Orders = () => {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const { data, loading, error, reload } = useAsync(
    () =>
      admin.orders({
        search: query || undefined,
        status: status || undefined,
        skip: page * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    [query, status, page],
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
    <Pager page={page} pages={pages} total={total} from={from} to={to} noun="orders" onPage={setPage} />
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHead title="Orders" subtitle="Every order placed in the application — who ordered, for how much, and where it stands.">
        <select
          value={status}
          onChange={(e) => { setPage(0); setStatus(e.target.value); }}
          className="input grow py-2 sm:grow-0 sm:py-1.5"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="shipped">Shipped</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button onClick={reload} className="btn-ghost">Refresh</button>
      </PageHead>

      <SearchBar
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onSubmit={submit}
        onClear={query ? () => { setSearch(''); setQuery(''); setPage(0); } : undefined}
        placeholder="Search by reference, customer name or email…"
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
                key: 'Reference',
                label: 'Order',
                mobile: 'title',
                render: (r) => <span className="font-mono text-sm font-medium text-mist">{r.Reference ?? `#${r.Id}`}</span>,
              },
              {
                key: 'CustomerName',
                label: 'Customer',
                mobile: 'meta',
                render: (r) => (
                  <div className="flex flex-col leading-tight">
                    <span className="text-mist">{r.CustomerName || '—'}</span>
                    <span className="break-all text-xs text-mist-dim">{r.CustomerEmail}</span>
                  </div>
                ),
              },
              { key: 'Items', label: 'Items', mobile: 'hide', render: (r) => <span className="tabular-nums">{r.Items ?? '—'}</span> },
              {
                key: 'Total',
                label: 'Total',
                render: (r) => <span className="font-semibold tabular-nums text-mist">{fmtCurrency(r.Total)}</span>,
              },
              { key: 'Status', label: 'Status', render: (r) => (r.Status ? <Badge tone={orderStatusTone(r.Status)}>{r.Status}</Badge> : '—') },
              { key: 'CreatedAt', label: 'Placed', render: (r) => <span className="whitespace-nowrap">{fmtDate(r.CreatedAt)}</span> },
            ]}
            rows={rows}
            empty={query || status ? 'No orders match this view.' : 'No orders yet — publish the /orders endpoint and add some data.'}
          />
          {pager}
        </>
      )}
    </div>
  );
};

export { Orders };
