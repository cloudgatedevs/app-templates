// Fixed, very subtle static background behind the whole app.
// Premium clean: near-white base with an extremely faint slate dotted grid.
export function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* clean near-white base */}
      <div className="absolute inset-0" style={{ backgroundColor: '#f8fafc' }} />

      {/* faint dotted grid for the slightest texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(15,23,42,0.035) 1px, transparent 0)',
          backgroundSize: '34px 34px',
        }}
      />
    </div>
  );
}
