const ScreenLoader = () => (
  <div className="flex min-h-[60vh] grow flex-col items-center justify-center gap-4">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
    <p className="text-sm text-slate-500">Loading…</p>
  </div>
);

export { ScreenLoader };
