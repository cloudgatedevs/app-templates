// Small formatting helpers shared across CRM pages. (USD, dates, names)

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function formatCurrency(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '$0';
  return usd.format(n);
}

export function formatNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0';
  return n.toLocaleString('en-US');
}

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function relativeDay(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  const diff = Math.round(
    (d.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / 86400000,
  );
  return diff;
}

export function isOverdue(value) {
  const diff = relativeDay(value);
  return diff != null && diff < 0;
}

export function fullName(row, firstKey = 'FirstName', lastKey = 'LastName') {
  const parts = [row?.[firstKey], row?.[lastKey]].filter(Boolean);
  return parts.join(' ').trim() || '—';
}

const STATUS_COLORS = {
  new: 'blue',
  contacted: 'violet',
  qualified: 'amber',
  won: 'green',
  lost: 'red',
  open: 'blue',
  done: 'green',
  completed: 'green',
};

export function statusColor(status) {
  return STATUS_COLORS[String(status || '').toLowerCase()] || 'gray';
}

const PRIORITY_COLORS = { low: 'gray', medium: 'blue', high: 'amber', urgent: 'red' };

export function priorityColor(priority) {
  return PRIORITY_COLORS[String(priority || '').toLowerCase()] || 'gray';
}
