// Small, generic formatting helpers (numbers, dates). App-agnostic.

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

