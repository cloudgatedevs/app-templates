import { Link } from 'react-router-dom';
import { admin } from '@/services/admin';
import { useAsync, Spinner, ErrorNote, StatCard, Table, Badge, PageHead, fmtDate, fmtCurrency } from '@/components/ui';
import { orderStatusTone } from '@/pages/Orders';

const Dashboard = () => {
  const stats = useAsync(() => admin.dashboard().then((r) => r[0] ?? {}), []);
  const recent = useAsync(() => admin.orders({ take: 10 }), []);

  return (
    <div className="flex flex-col gap-7">
      <PageHead title="Dashboard" subtitle="What's happening across the application right now.">
        <button onClick={() => { stats.reload(); recent.reload(); }} className="btn-ghost">
          Refresh
        </button>
      </PageHead>

      <ErrorNote error={stats.error} />
      {stats.loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Users" value={stats.data?.Users} sub="registered accounts" />
          <StatCard label="Orders" value={stats.data?.Orders} sub="all time" />
          <StatCard label="Revenue (30d)" value={stats.data?.Revenue30d != null ? fmtCurrency(stats.data.Revenue30d) : undefined} sub="last 30 days" />
          <StatCard label="Pending orders" value={stats.data?.PendingOrders} sub="awaiting action" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-mist">Recent orders</h2>
        <Link to="/orders" className="text-sm font-medium text-accent-400 hover:text-accent-500">
          View all →
        </Link>
      </div>
      <ErrorNote error={recent.error} />
      {recent.loading ? (
        <Spinner />
      ) : (
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
            {
              key: 'Total',
              label: 'Total',
              render: (r) => <span className="font-semibold tabular-nums text-mist">{fmtCurrency(r.Total)}</span>,
            },
            { key: 'Status', label: 'Status', render: (r) => (r.Status ? <Badge tone={orderStatusTone(r.Status)}>{r.Status}</Badge> : '—') },
            { key: 'CreatedAt', label: 'Placed', render: (r) => <span className="whitespace-nowrap">{fmtDate(r.CreatedAt)}</span> },
          ]}
          rows={recent.data}
          empty="No orders yet."
        />
      )}
    </div>
  );
};

export { Dashboard };
