import { useState } from 'react';
// CRM shared UI primitives.

export function Card({ title, action, className = '', bodyClass = '', children }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
          {title && <h2 className="text-[13px] font-semibold text-slate-900">{title}</h2>}
          {action}
        </div>
      )}
      <div className={bodyClass}>{children}</div>
    </div>
  );
}

const BADGE = {
  gray: 'bg-slate-50 text-slate-600 ring-slate-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  red: 'bg-rose-50 text-rose-700 ring-rose-200',
  rose: 'bg-rose-50 text-rose-700 ring-rose-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
};

export function Badge({ children, color = 'gray', dot = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${BADGE[color] || BADGE.gray}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const ok = String(status).toLowerCase() === 'success';
  return <Badge color={ok ? 'green' : 'red'} dot>{ok ? 'Success' : 'Failed'}</Badge>;
}

export function StatCard({ label, value, sub, accent = '#4f46e5' }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
      {label}
    </div>
  );
}

export function Copyable({ value, className = '' }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      title="Copy"
      className={`text-slate-400 transition-colors hover:text-indigo-600 ${className}`}
    >
      {copied ? '✓' : '⧉'}
    </button>
  );
}

export function DetailRow({ label, children }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-3 last:border-0 sm:flex-row sm:items-start sm:gap-4">
      <div className="w-full shrink-0 text-sm text-slate-500 sm:w-64">{label}</div>
      <div className="min-w-0 break-words text-sm text-slate-900">{children}</div>
    </div>
  );
}

export function RefreshIcon({ className = 'h-4 w-4', spinning = false }) {
  return (
    <svg
      className={`${className} ${spinning ? 'animate-spin' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36" strokeLinecap="round" />
      <path d="M21 4v5h-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowRight({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const BTN_VARIANTS = {
  primary:
    'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus-visible:ring-indigo-500',
  secondary:
    'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400',
  danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:ring-rose-500',
};

export function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  disabled = false,
  loading = false,
  children,
  ...rest
}) {
  const sizes = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm';
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 ${sizes} ${
        BTN_VARIANTS[variant] || BTN_VARIANTS.primary
      } ${className}`}
      {...rest}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}

export function Field({ label, required = false, hint, error, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <span className="text-xs font-medium text-slate-600">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="text-[11px] text-slate-400">{hint}</span>}
      {error && <span className="text-[11px] text-rose-600">{error}</span>}
    </label>
  );
}

const INPUT_BASE =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100';

export function Input({ className = '', ...rest }) {
  return <input className={`${INPUT_BASE} ${className}`} {...rest} />;
}

export function Textarea({ className = '', rows = 3, ...rest }) {
  return <textarea rows={rows} className={`${INPUT_BASE} resize-y ${className}`} {...rest} />;
}

export function Select({ className = '', children, ...rest }) {
  return (
    <select className={`${INPUT_BASE} pr-8 ${className}`} {...rest}>
      {children}
    </select>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', message, action, icon }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      {icon && <div className="mb-1 text-slate-300">{icon}</div>}
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {message && <p className="max-w-sm text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  const message =
    (error && (error.message || String(error))) || 'Something went wrong loading this data.';
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <p className="text-sm font-medium text-rose-600">Failed to load</p>
      <p className="max-w-md text-xs text-slate-500">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshIcon className="h-3.5 w-3.5" /> Retry
        </Button>
      )}
    </div>
  );
}
