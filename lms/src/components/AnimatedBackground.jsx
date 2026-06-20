// Fixed, very subtle static background behind the whole app.
// Soft & friendly: near-white base with gentle teal + coral washes.
export function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* soft near-white base */}
      <div className="absolute inset-0" style={{ backgroundColor: '#f5fbfb' }} />

      {/* faint dotted grid for the slightest texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(13,148,136,0.05) 1px, transparent 0)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* gentle teal + coral washes for depth */}
      <div
        className="absolute -left-40 -top-44 h-[38rem] w-[38rem] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.12), transparent 70%)' }}
      />
      <div
        className="absolute -bottom-52 -right-36 h-[36rem] w-[36rem] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(251,113,133,0.12), transparent 70%)' }}
      />
    </div>
  );
}
