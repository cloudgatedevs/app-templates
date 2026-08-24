// Placeholder brand mark for the admin console. Swap the SVG for the real logo
// when it's available — the layout only depends on the outer sizing.

export const BrandMark = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="adminGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#7c8bff" />
        <stop offset="0.5" stopColor="#6366f1" />
        <stop offset="1" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="46" height="46" rx="13" fill="url(#adminGrad)" />
    <rect x="1" y="1" width="46" height="46" rx="13" fill="url(#adminGrad)" opacity="0.25" />
    {/* stylized command grid for an "admin console" feel */}
    <rect x="12" y="12" width="10.5" height="10.5" rx="3" fill="#0c111c" fillOpacity="0.35" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="1.6" />
    <rect x="25.5" y="12" width="10.5" height="10.5" rx="3" fill="#0c111c" fillOpacity="0.35" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="1.6" />
    <rect x="12" y="25.5" width="10.5" height="10.5" rx="3" fill="#0c111c" fillOpacity="0.35" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="1.6" />
    <path d="M27 30.75h7.5M30.75 27v7.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const Brand = ({ collapsed = false }) => (
  <div className="flex items-center gap-3">
    <span className="grid place-items-center rounded-2xl shadow-glow">
      <BrandMark />
    </span>
    {!collapsed && (
      <div className="leading-tight">
        <p className="text-sm font-semibold tracking-wide text-mist">Admin</p>
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-mist-dim">Starter</p>
      </div>
    )}
  </div>
);
